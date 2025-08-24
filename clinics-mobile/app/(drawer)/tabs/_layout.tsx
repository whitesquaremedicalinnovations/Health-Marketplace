import React, { useEffect, useRef, useState } from 'react';
import { router, Tabs } from 'expo-router';
import { 
  Home, 
  Stethoscope, 
  User, 
  Briefcase, 
  Menu, 
  MessageSquare,
  Activity 
} from 'lucide-react-native';
import { useNavigation , DrawerActions } from '@react-navigation/native';
import { TouchableOpacity, Platform, View, ActivityIndicator } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { getClinic } from '@/lib/utils';
import Toast from 'react-native-toast-message';

interface ClinicData {
  id: string;
  clinicName: string;
  ownerName: string;
  email: string;
  isVerified: boolean;
  clinicAddress: string;
  clinicPhoneNumber: string;
  createdAt: string;
}

export default function TabLayout() {
  const navigation = useNavigation();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);  

  const fetchClinicData = async () => {
    console.log("fetchign clinic")
    try { 
      const response = await getClinic(user?.id || '');
      console.log(response.data)
      if (response.status === 200 && response.data) {
        if(!(response.data.data.isVerified)) {
          router.replace('/verification-status');
        } else {
          setClinicData(response.data.data);
        }
      } else {
        router.replace('/(auth)/home');
      }
    } catch (error) {
      console.error('Error fetching clinic data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch clinic information',
      });
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    fetchClinicData();
  }, [user?.id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

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
      }}
    >
      <Tabs.Screen
        name="dashboard"
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
      <Tabs.Screen 
        name="chat" 
        options={{ 
          title: 'Messages',
          tabBarIcon: ({ color, size, focused }) => (
            <MessageSquare color={color} size={size} />
          ),  
          headerTitle: 'Chat & Communication'
        }} 
      />
    </Tabs>
  );
}
