import React from 'react';
import { Tabs } from 'expo-router';
import { 
  Home, 
  User, 
  Briefcase, 
  Menu, 
  MessageSquare,
  Activity,
  FileText 
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity, Platform } from 'react-native';
import { DrawerActions } from '@react-navigation/native';

export default function TabLayout() {
  const navigation = useNavigation();

  return (
    <Tabs
      screenOptions={{
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={{ marginLeft: 15 }}
          >
            <Menu size={24} color="#ffffff" />
          </TouchableOpacity>
        ),
        tabBarStyle: {
          backgroundColor: '#f0f9ff',
          borderTopWidth: 0,
          borderTopColor: '#e5e7eb',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 90 : 70,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: '#3b82f6',
          elevation: 4,
          shadowColor: '#3b82f6',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '700',
          color: '#ffffff',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          headerShown: false, // We handle the header in the dashboard component
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Find Jobs',
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
          headerTitle: 'Available Opportunities',
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Applications',
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
          headerTitle: 'My Applications',
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          headerTitle: 'Patient Management',
        }}
      />
    </Tabs>
  );
}
