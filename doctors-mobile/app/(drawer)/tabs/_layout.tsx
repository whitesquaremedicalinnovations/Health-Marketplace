import React, { useEffect, useRef, useState } from 'react';
import { router, Tabs } from 'expo-router';
import { 
  Home, 
  User, 
  Briefcase, 
  Menu, 
  MessageSquare,
  Activity,
  FileText 
} from 'lucide-react-native';
import { useNavigation , DrawerActions } from '@react-navigation/native';
import { TouchableOpacity, Platform, View, ActivityIndicator } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { getDoctor } from '@/lib/utils';
import Toast from 'react-native-toast-message';
import { registerForPushNotificationsAsync } from '@/lib/registerNotification';
import { axiosInstance } from '@/lib/axios';

interface DoctorData {
  id: string;
  doctorName: string;
  email: string;
  isVerified: boolean;
  specialization: string;
  phoneNumber: string;
  createdAt: string;
}

export default function TabLayout() {
  const navigation = useNavigation();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);  

  const fetchDoctorData = async () => {
    console.log("fetching doctor")
    try { 
      const response = await getDoctor(user?.id || '');
      console.log(response.data)
      if (response.status === 200 && response.data) {
        if(!(response.data.data.isVerified)) {
          router.replace('/verification-status');
        } else {
          setDoctorData(response.data.data);
        }
      } else {
        router.replace('/(auth)/home');
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch doctor information',
      });
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    fetchDoctorData();
  }, [user?.id]);

  useEffect(() => {
    const registerForPushNotifications = async () => {
     const token = await registerForPushNotificationsAsync();
     console.log("Token", token);

     if(token && doctorData?.id) {
      await axiosInstance.post('/api/notification/save-device-notification-token', {
        token,
        doctorId: doctorData?.id,
        type: "DOCTOR",
      });
     }
    };
    registerForPushNotifications();
  }, [doctorData?.id]);

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
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <Home color={color} size={size} />
          ),
          headerTitle: 'Doctor Dashboard',
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Find Jobs',
          tabBarIcon: ({ color, size, focused }) => (
            <Briefcase color={color} size={size} />
          ),
          headerTitle: 'Available Opportunities',
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Applications',
          tabBarIcon: ({ color, size, focused }) => (
            <FileText color={color} size={size} />
          ),
          headerTitle: 'My Applications',
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
