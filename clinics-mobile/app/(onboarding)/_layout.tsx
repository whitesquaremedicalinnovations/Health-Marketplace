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
        const userData = await getClinic(user.id);
        console.log("userData", userData)

        if (userData.status === 200 && userData.data) {
          await AsyncStorage.setItem('hasOnboarded', 'true');

          if (userData.data.isVerified) {
            router.replace('/(drawer)/tabs/dashboard');
          } else {
            router.replace('/verification-status');
          }
        } else {
          // User not in DB, show onboarding stack
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
