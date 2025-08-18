import React from 'react';
import { Tabs } from 'expo-router';
import { 
  Home, 
  Stethoscope, 
  User, 
  Briefcase, 
  Menu, 
  MessageSquare,
  Activity 
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
            <Menu size={24} color="#374151" />
          </TouchableOpacity>
        ),
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          headerTitle: 'Clinic Dashboard',
        }}
      />
      <Tabs.Screen
        name="requirements"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
          headerTitle: 'Job Requirements',
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
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => <Activity color={color} size={size} />,
          headerTitle: 'Analytics & Reports',
        }}
      />
    </Tabs>
  );
}
