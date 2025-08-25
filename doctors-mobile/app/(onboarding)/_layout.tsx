import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { getDoctor } from '../../lib/utils';

export default function OnboardingLayout() {
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const router = useRouter();
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  useEffect(() => {
    const checkUserOnboarding = async () => {
      console.log("checking onboarding")

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
        // Fetch fresh data from server
        const userData = await getDoctor(user.id);
        console.log("Fresh userData", userData.data.doctor.isVerified)

        if (userData.data.doctor) {
          await AsyncStorage.setItem('hasOnboarded', 'true');

          if (userData.data.doctor.isVerified) {
            router.replace('/(drawer)/tabs');
          } else {
            router.replace('/verification-status');
          }
        } else {
          // User not in DB, clear any cached data and show onboarding stack
          await AsyncStorage.removeItem('hasOnboarded');
          setIsCheckingUser(false);
        }
      } catch (error) {
        console.error('Error checking user data:', error);
        
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
