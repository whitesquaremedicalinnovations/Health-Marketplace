import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { CustomDrawerContent } from '../../components/CustomDrawerContent';

export default function DrawerLayout() {
  return (
    <Drawer 
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '700',
          color: '#1f2937',
        },
        headerTintColor: '#374151',
        drawerStyle: {
          backgroundColor: '#ffffff',
          width: 300,
        },
        drawerActiveTintColor: '#3b82f6',
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
        name="chat" 
        options={{ 
          title: 'Messages',
          drawerLabel: 'Messages',
          headerTitle: 'Chat & Communication'
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
          drawerLabel: 'Profile Settings',
          headerTitle: 'Clinic Profile'
        }} 
      />
    </Drawer>
  );
} 