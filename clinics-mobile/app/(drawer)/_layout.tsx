import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { CustomDrawerContent } from '../../components/CustomDrawerContent';

export default function DrawerLayout() {
  return (
    <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="tabs" options={{ headerShown: false, title: 'Home' }} />
      <Drawer.Screen name="chat" options={{ title: 'Chat' }} />
      <Drawer.Screen name="connections" options={{ title: 'Connections' }} />
      <Drawer.Screen name="news" options={{ title: 'News' }} />
      <Drawer.Screen name="search-doctors" options={{ title: 'Search Doctors' }} />
    </Drawer>
  );
} 