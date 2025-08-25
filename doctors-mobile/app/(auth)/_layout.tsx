import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { View, ActivityIndicator } from 'react-native'

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth()

  // Show loading indicator while Clerk is initializing
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href={'/(onboarding)'} />
  }

  // For non-authenticated users, show the home screen by default
  return <Stack screenOptions={{ headerShown: false }} />
}