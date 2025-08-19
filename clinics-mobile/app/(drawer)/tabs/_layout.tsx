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
            <Menu size={24} color="#ffffff" />
          </TouchableOpacity>
        ),
        tabBarStyle: {
          backgroundColor: '#f0f9ff',
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? 20 : 0,
          paddingTop: 0,
          height: Platform.OS === 'ios' ? 90 : 80,
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },

        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <Home color={color} size={size} />
          ),
          headerTitle: 'Clinic Dashboard',
        }}
      />
      <Tabs.Screen
        name="requirements"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color, size, focused }) => (
            <Briefcase color={color} size={size} />
          ),
          headerTitle: 'Job Requirements',
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          tabBarIcon: ({ color, size, focused }) => (
            <User color={color} size={size} />
          ),
          headerTitle: 'Patient Management',
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size, focused }) => (
            <Activity color={color} size={size} />
          ),
          headerTitle: 'Analytics & Reports',
        }}
      />
    </Tabs>
  );
}
