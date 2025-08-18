import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  Heart,
  Search,
  Filter,
  Send,
  Building,
  Award,
  Stethoscope,
  Target,
  TrendingUp,
  X,
  CheckCircle,
  Star,
} from 'lucide-react-native';
import { axiosInstance } from '../../../lib/axios';
import Toast from 'react-native-toast-message';

// This is the same component as the requirements page but placed in tabs
// We'll redirect to the main requirements page to avoid duplication

export default function JobsScreen() {
  const router = useRouter();

  // Redirect to the main requirements page
  useEffect(() => {
    router.replace('/(drawer)/requirements');
  }, [router]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-lg font-semibold text-gray-800 mt-4">Redirecting to job opportunities...</Text>
      </View>
    </SafeAreaView>
  );
}