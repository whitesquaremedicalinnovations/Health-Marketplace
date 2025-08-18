import { Redirect, Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { getClinic } from '../../lib/utils';

export default function OnboardingLayout() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  useEffect(() => {
    const checkUserOnboarding = async () => {
      if (!isLoaded) return;

      try {
        const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');
        if (hasOnboarded === 'true') {
          router.replace('/(drawer)/tabs');
          return;
        }

        if (user?.id) {
          const userData = await getClinic(user.id);
          if (userData.status === 200) {
            await AsyncStorage.setItem('hasOnboarded', 'true');
            router.replace('/(drawer)/tabs');
          } else {
            setIsCheckingUser(false);
          }
        } else {
          // If there's no user, perhaps redirect to sign-in
          router.replace('/sign-in');
        }
      } catch (error) {
        console.error('Failed to check user onboarding status', error);
        setIsCheckingUser(false);
      }
    };

    checkUserOnboarding();
  }, [user, isLoaded, router]);

  if (isCheckingUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        </View>
    );
  }

  return <Stack />;
}
