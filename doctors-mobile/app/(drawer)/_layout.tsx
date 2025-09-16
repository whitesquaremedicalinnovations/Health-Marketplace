import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { CustomDrawerContent } from '../../components/CustomDrawerContent';

export default function DrawerLayout() {
  return (
    <Drawer 
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3b82f6',
          elevation: 4,
          shadowColor: 'none',
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
          width: 280,
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
        name="connections" 
        options={{ 
          title: 'Active Positions',
          drawerLabel: 'Active Positions',
          headerTitle: 'My Current Jobs'
        }} 
      />
      <Drawer.Screen 
        name="news" 
        options={{ 
          title: 'News',
          drawerLabel: 'News & Updates',
          headerTitle: 'Healthcare News'
        }} 
      />
      <Drawer.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          drawerLabel: 'My Profile',
          headerTitle: 'Doctor Profile'
        }} 
      />
      <Drawer.Screen 
        name="calendar" 
        options={{ 
          title: 'Calendar',
          drawerLabel: 'Calendar',
          headerTitle: 'Schedule & Appointments'
        }} 
      />
      <Drawer.Screen 
        name="clinics-map" 
        options={{ 
          title: 'Clinics Map',
          drawerLabel: 'Find Clinics',
          headerTitle: 'Nearby Healthcare Facilities'
        }} 
      />
    </Drawer>
  );
} 