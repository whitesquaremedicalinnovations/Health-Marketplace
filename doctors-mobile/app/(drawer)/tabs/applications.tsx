import React, { useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';

// This is the same component as the applications page but placed in tabs
// We'll redirect to the main applications page to avoid duplication

export default function ApplicationsTabScreen() {
  const router = useRouter();

  // Redirect to the main applications page
  useEffect(() => {
    router.replace('/(drawer)/applications');
  }, [router]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-lg font-semibold text-gray-800 mt-4">Redirecting to applications...</Text>
      </View>
    </SafeAreaView>
  );
}