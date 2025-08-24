import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { View, ActivityIndicator } from 'react-native';
import { CustomDrawerContent } from '../../components/CustomDrawerContent';

export default function DrawerLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading indicator while Clerk is initializing
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // Redirect to home if not signed in
  if (!isSignedIn) {
    return <Redirect href="/(auth)/home" />;
  }

  return (
    <Drawer 
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2563EB',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '700',
          color: '#ffffff',
        },
        headerTintColor: '#ffffff',
        drawerStyle: {
          backgroundColor: '#ffffff',
          width: 300,
        },
        drawerActiveTintColor: '#2563EB',
        drawerInactiveTintColor: '#6b7280',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          marginLeft: -10,
        },
      }}
    >
      <Drawer.Screen 
        name="tabs" 
        options={{ 
          headerShown: false, 
          title: 'Dashboard',
          drawerLabel: 'Dashboard'
        }} 
      />
      <Drawer.Screen 
        name="search-doctors" 
        options={{ 
          title: 'Find Doctors',
          drawerLabel: 'Find Doctors',
          headerTitle: 'Search & Connect with Doctors'
        }} 
      />
      <Drawer.Screen 
        name="connections" 
        options={{ 
          title: 'My Team',
          drawerLabel: 'My Team',
          headerTitle: 'Connected Doctors'
        }} 
      />
      <Drawer.Screen 
        name="calendar" 
        options={{ 
          title: 'Calendar',
          drawerLabel: 'Calendar',
          headerTitle: 'Calendar & Schedule'
        }} 
      />
      <Drawer.Screen 
        name="news" 
        options={{ 
          title: 'News & Updates',
          drawerLabel: 'News & Updates',
          headerTitle: 'Healthcare News'
        }} 
      />
      <Drawer.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          drawerLabel: 'Profile',
          headerTitle: 'Your Profile'
        }} 
      />
    </Drawer>
  );
} 