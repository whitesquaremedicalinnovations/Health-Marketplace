import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Compass, User, Briefcase, Menu } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
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
            <Menu />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} />,
        }}
      />
      <Tabs.Screen
        name="requirements"
        options={{
          title: 'Requirements',
          tabBarIcon: ({ color }) => <Briefcase color={color} />,
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          tabBarIcon: ({ color }) => <User color={color} />,
        }}
      />
    </Tabs>
  );
}
