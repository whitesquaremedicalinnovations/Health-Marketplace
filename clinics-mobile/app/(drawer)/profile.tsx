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
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import {
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Clock,
  CheckCircle,
  Settings,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { axiosInstance } from '../../lib/axios';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GooglePlacesAutocomplete from '@/components/ui/google-places-autocomplete';

interface ClinicProfile {
  id: string;
  clinicName: string;
  ownerName: string;
  email: string;
  ownerPhoneNumber: string;
  clinicPhoneNumber: string;
  clinicAddress: string;
  latitude: number;
  longitude: number;
  clinicAdditionalDetails: string;
  profileImage?: {
    docUrl: string;
  };
  isVerified: boolean;
  createdAt: string;
  preferredRadius: number;
}

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ClinicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [clinicName, setClinicName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [clinicPhoneNumber, setClinicPhoneNumber] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [clinicAdditionalDetails, setClinicAdditionalDetails] = useState('');

  const fetchProfile = useCallback(async () => {
    if (user?.id) {
      try {
        const response = await axiosInstance.get(`/api/clinic/get-clinic/${user.id}`);
        const profileData = response.data.data;
        setProfile(profileData);
        
        // Set editable fields
        setClinicName(profileData.clinicName || '');
        setOwnerName(profileData.ownerName || '');
        setClinicPhoneNumber(profileData.clinicPhoneNumber || '');
        setClinicAddress(profileData.clinicAddress || '');
        setLatitude(profileData.latitude || null);
        setLongitude(profileData.longitude || null);
        setClinicAdditionalDetails(profileData.clinicAdditionalDetails || '');
      } catch (error) {
        console.error('Error fetching profile:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load profile',
        });
      }
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchProfile().finally(() => setLoading(false));
  }, [fetchProfile]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile().finally(() => setRefreshing(false));
  }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedData = {
        clinicName,
        ownerName,
        clinicPhoneNumber,
        clinicAddress,
        latitude: latitude || 0,
        longitude: longitude || 0,
        clinicAdditionalDetails,
        role: 'CLINIC',
      };

      await axiosInstance.post(`/api/user/profile/update/${user?.id}`, updatedData);
      
      setProfile(prev => prev ? { ...prev, ...updatedData } : null);
      setEditing(false);
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update profile',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setClinicName(profile.clinicName);
      setOwnerName(profile.ownerName);
      setClinicPhoneNumber(profile.clinicPhoneNumber);
      setClinicAddress(profile.clinicAddress);
      setLatitude(profile.latitude);
      setLongitude(profile.longitude);
      setClinicAdditionalDetails(profile.clinicAdditionalDetails);
    }
    setEditing(false);
  };

  const handlePlaceSelect = (details: any) => {
    if (details) {
      setClinicAddress(details.formatted_address);
      setLatitude(details.geometry.location.lat);
      setLongitude(details.geometry.location.lng);
    }
  };

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // Handle image upload here
      Toast.show({
        type: 'info',
        text1: 'Coming Soon',
        text2: 'Image upload will be available in the next update',
      });
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Handle logout logic here
            signOut()
            AsyncStorage.removeItem('hasOnboarded');
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  };

  const renderInfoCard = (
    icon: React.ReactNode,
    title: string,
    value: string,
    editable: boolean = false,
    onChangeText?: (text: string) => void,
    multiline: boolean = false
  ) => (
    <View className="bg-white rounded-2xl p-4 shadow-sm mb-3">
      <View className="flex-row items-center mb-2">
        <View className="bg-blue-100 rounded-lg p-2 mr-3">
          {icon}
        </View>
        <Text className="text-gray-700 font-medium flex-1">{title}</Text>
      </View>
      {editing && editable && onChangeText ? (
        <TextInput
          className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900 mt-2"
          value={value}
          onChangeText={onChangeText}
          placeholder={`Enter ${title.toLowerCase()}`}
          placeholderTextColor="#9ca3af"
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={multiline ? { minHeight: 80 } : {}}
        />
      ) : (
        <Text className="text-gray-900 text-base ml-12">
          {value || 'Not provided'}
        </Text>
      )}
    </View>
  );

  const renderMenuOption = (
    icon: React.ReactNode,
    title: string,
    subtitle: string,
    onPress: () => void,
    showArrow: boolean = true
  ) => (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-4 shadow-sm mb-3 flex-row items-center"
    >
      <View className="bg-gray-100 rounded-lg p-3 mr-4">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold text-base">{title}</Text>
        <Text className="text-gray-600 text-sm mt-1">{subtitle}</Text>
      </View>
      {showArrow && (
        <View className="w-6 h-6 bg-gray-200 rounded-full items-center justify-center">
          <Text className="text-gray-600 font-bold">›</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-lg font-semibold text-gray-800 mt-4">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</Text>
          <Text className="text-gray-600 text-center">
            Unable to load your profile information. Please try again.
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            className="bg-blue-600 rounded-xl px-6 py-3 mt-4"
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
              <StatusBar barStyle="light-content" backgroundColor="#2563EB" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{ flex: 1 }}
      >
        {/* Header with Profile Image */}
        <LinearGradient
          colors={['#2563EB', '#06B6D4']}
          style={{ 
            paddingHorizontal: 20, 
            paddingTop: 20, 
            paddingBottom: 40,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          <View className="items-center">
            <TouchableOpacity 
              onPress={handleImagePicker}
              className="relative mb-4"
            >
              <View className="w-32 h-32 rounded-full bg-white/20 items-center justify-center">
                {profile.profileImage?.docUrl ? (
                  <Image
                    source={{ uri: profile.profileImage.docUrl }}
                    className="w-32 h-32 rounded-full"
                  />
                ) : (
                  <Building size={40} color="white" />
                )}
              </View>
              <View className="absolute bottom-0 right-0 bg-white rounded-full p-2">
                <Camera size={16} color="#3b82f6" />
              </View>
            </TouchableOpacity>
            
            <Text className="text-2xl font-bold text-white mb-1">{profile.clinicName}</Text>
            <Text className="text-blue-100 text-base mb-4">{profile.ownerName}</Text>
            
            <View className="flex-row items-center">
              {profile.isVerified ? (
                <View className="bg-blue-500/20 rounded-full px-4 py-2 flex-row items-center">
                  <CheckCircle size={16} color="#2563EB" />
                  <Text className="text-blue-100 font-medium ml-2">Verified</Text>
                </View>
              ) : (
                <View className="bg-yellow-500/20 rounded-full px-4 py-2 flex-row items-center">
                  <Clock size={16} color="#f59e0b" />
                  <Text className="text-yellow-100 font-medium ml-2">Pending Verification</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        <View style={{ padding: 20, paddingTop: 30 }}>
          {/* Edit/Save Buttons */}
          <View className="flex-row justify-end mb-6">
            {editing ? (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleCancel}
                  className="bg-gray-200 rounded-xl px-4 py-2 flex-row items-center"
                >
                  <X size={16} color="#6b7280" />
                  <Text className="text-gray-700 font-medium ml-2">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={saving}
                  className="bg-blue-600 rounded-xl px-4 py-2 flex-row items-center"
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Save size={16} color="white" />
                  )}
                  <Text className="text-white font-medium ml-2">
                    {saving ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setEditing(true)}
                className="bg-blue-600 rounded-xl px-4 py-2 flex-row items-center"
              >
                <Edit3 size={16} color="white" />
                <Text className="text-white font-medium ml-2">Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Profile Information */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-4">Clinic Information</Text>
            
            {renderInfoCard(
              <Building size={20} color="#3b82f6" />,
              'Clinic Name',
              clinicName,
              true,
              setClinicName
            )}
            
            {renderInfoCard(
              <User size={20} color="#3b82f6" />,
              'Owner Name',
              ownerName,
              true,
              setOwnerName
            )}
            
            {renderInfoCard(
              <Mail size={20} color="#3b82f6" />,
              'Email Address',
              profile.email
            )}
            
            {renderInfoCard(
              <Phone size={20} color="#3b82f6" />,
              'Clinic Phone',
              clinicPhoneNumber,
              true,
              setClinicPhoneNumber
            )}
            
            {!editing ? (
              renderInfoCard(
                <MapPin size={20} color="#3b82f6" />,
                'Address',
                clinicAddress
              )
            ) : null}
            
            {renderInfoCard(
              <Building size={20} color="#3b82f6" />,
              'Additional Details',
              clinicAdditionalDetails,
              true,
              setClinicAdditionalDetails,
              true
            )}
            {editing && (
              <View className="bg-white rounded-2xl p-4 shadow-sm mb-3">
                <View className="flex-row items-center mb-2">
                  <View className="bg-blue-100 rounded-lg p-2 mr-3">
                    <MapPin size={20} color="#3b82f6" />
                  </View>
                  <Text className="text-gray-700 font-medium flex-1">Address</Text>
                </View>
                <GooglePlacesAutocomplete
                  onPlaceSelect={handlePlaceSelect}
                  initialAddress={clinicAddress}
                />
              </View>
            )}
          </View>

          {/* Settings Menu */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-4">Settings & Support</Text>
            
            {renderMenuOption(
              <Bell size={20} color="#6b7280" />,
              'Notifications',
              'Manage your notification preferences',
              () => Toast.show({ type: 'info', text1: 'Coming Soon', text2: 'Notification settings' })
            )}
            
            {renderMenuOption(
              <Lock size={20} color="#6b7280" />,
              'Privacy & Security',
              'Account security and privacy settings',
              () => Toast.show({ type: 'info', text1: 'Coming Soon', text2: 'Privacy settings' })
            )}
            
            {renderMenuOption(
              <HelpCircle size={20} color="#6b7280" />,
              'Help & Support',
              'Get help and contact support',
              () => Toast.show({ type: 'info', text1: 'Coming Soon', text2: 'Help center' })
            )}
            
            {renderMenuOption(
              <LogOut size={20} color="#ef4444" />,
              'Logout',
              'Sign out of your account',
              handleLogout,
              false
            )}
          </View>

          {/* Account Info */}
          <View className="bg-gray-100 rounded-2xl p-4 mb-4">
            <Text className="text-gray-600 text-sm text-center">
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </Text>
            <Text className="text-gray-600 text-sm text-center mt-1">
              Account ID: {profile.id.substring(0, 8)}...
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}