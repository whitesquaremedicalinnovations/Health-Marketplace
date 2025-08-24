import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { getClinic } from '../../lib/utils';

export default function OnboardingLayout() {
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const router = useRouter();
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  useEffect(() => {
    const checkUserOnboarding = async () => {
      console.log("checking onboarding")

      if (!authLoaded || !userLoaded) return; // Wait until Clerk loads

      // If user is not signed in, redirect to home
      if (!isSignedIn) {
        router.replace('/(auth)/home');
        return;
      }

      if (!user?.id) {
        router.replace('/(auth)/home');
        return;
      }

      try {
        // Check if we already have user status cached
        const cachedUserData = await AsyncStorage.getItem(`user_data_${user.id}`);
        const cachedOnboardingStatus = await AsyncStorage.getItem('hasOnboarded');
        
        if (cachedUserData && cachedOnboardingStatus === 'true') {
          const userData = JSON.parse(cachedUserData);
          console.log("Using cached userData", userData);
          
          if (userData.isVerified) {
            router.replace('/(drawer)/tabs/dashboard');
            return;
          } else {
            router.replace('/verification-status');
            return;
          }
        }

        // Fetch fresh data from server
        const userData = await getClinic(user.id);
        console.log("Fresh userData", userData)

        if (userData.status === 200 && userData.data) {
          await AsyncStorage.setItem('hasOnboarded', 'true');
          await AsyncStorage.setItem(`user_data_${user.id}`, JSON.stringify(userData.data));

          if (userData.data.isVerified) {
            router.replace('/(drawer)/tabs/dashboard');
          } else {
            router.replace('/verification-status');
          }
        } else {
          // User not in DB, clear any cached data and show onboarding stack
          await AsyncStorage.removeItem('hasOnboarded');
          await AsyncStorage.removeItem(`user_data_${user.id}`);
          setIsCheckingUser(false);
        }
      } catch (error) {
        console.error('Error checking user data:', error);
        // On network error, check if we have cached data to fall back to
        try {
          const cachedUserData = await AsyncStorage.getItem(`user_data_${user.id}`);
          const cachedOnboardingStatus = await AsyncStorage.getItem('hasOnboarded');
          
          if (cachedUserData && cachedOnboardingStatus === 'true') {
            const userData = JSON.parse(cachedUserData);
            console.log("Falling back to cached userData due to network error");
            
            if (userData.isVerified) {
              router.replace('/(drawer)/tabs/dashboard');
              return;
            } else {
              router.replace('/verification-status');
              return;
            }
          }
        } catch (cacheError) {
          console.error('Error reading cached data:', cacheError);
        }
        
        setIsCheckingUser(false);
      }
    };

    checkUserOnboarding();
  }, [authLoaded, userLoaded, isSignedIn, user?.id, router]);

  if (!authLoaded || !userLoaded || isCheckingUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return <Stack />;
}
