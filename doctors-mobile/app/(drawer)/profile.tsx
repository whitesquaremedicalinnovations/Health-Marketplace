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
  Stethoscope,
  Award,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { axiosInstance } from '../../lib/axios';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GooglePlacesAutocomplete from '@/components/ui/google-places-autocomplete';
import { Picker } from '@react-native-picker/picker';

enum DoctorSpecialization {
  GENERAL_PHYSICIAN = "GENERAL_PHYSICIAN",
  CARDIOLOGIST = "CARDIOLOGIST", 
  DERMATOLOGIST = "DERMATOLOGIST",
  ENDOCRINOLOGIST = "ENDOCRINOLOGIST",
  GYNECOLOGIST = "GYNECOLOGIST",
  NEUROSURGEON = "NEUROSURGEON",
  ORTHOPEDIC_SURGEON = "ORTHOPEDIC_SURGEON",
  PLASTIC_SURGEON = "PLASTIC_SURGEON",
  UROLOGIST = "UROLOGIST",
  ENT_SPECIALIST = "ENT_SPECIALIST",
  PEDIATRICIAN = "PEDIATRICIAN",
  PSYCHIATRIST = "PSYCHIATRIST",
  DENTIST = "DENTIST"
}

interface DoctorProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  latitude?: number;
  longitude?: number;
  specialization: DoctorSpecialization;
  experience: number;
  about: string;
  additionalInformation: string;
  certifications: string[];
  profileImage?: string;
  documents?: Array<{
    id: string;
    docUrl: string;
    docType?: string;
    uploadedAt?: string;
  }>;
}

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [editData, setEditData] = useState<Partial<DoctorProfile>>({});

  const fetchProfile = useCallback(async () => {
    if (user?.id) {
      try {
        const response = await axiosInstance.get(`/api/doctor/get-doctor/${user.id}`);
        const profileData = response.data.doctor;
        setProfile(profileData);
        setEditData(profileData);
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
      const updatedData = { ...editData, role: 'DOCTOR' };

      const response = await axiosInstance.post(`/api/user/profile/update/${user?.id}`, updatedData);
      
      fetchProfile()
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
      setEditData(profile);
    }
    setEditing(false);
  };

  const handlePlaceSelect = (details: any) => {
    if (details) {
      setEditData({
        ...editData,
        address: details.formatted_address,
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      });
    }
  };

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const uri = result.assets[0].uri;
      const formData = new FormData();
      formData.append('files', {
        uri,
        name: `photo_${user?.id}.jpg`,
        type: 'image/jpeg',
      } as any);

      try {
        const response = await axiosInstance.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data.uploaded.length > 0) {
          const profileImageUrl = response.data.uploaded[0].url;
          
          // Immediately update profile with the new image URL
          const updatedProfileResponse = await axiosInstance.post(`/api/user/profile/update/${user?.id}`, {
            profileImage: profileImageUrl,
            role: 'DOCTOR'
          });

          fetchProfile()

          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Profile image updated',
          });
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to upload image',
        });
      }
    }
  };

  const handleDocumentUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
      multiple: true,
    });

    if (result.canceled === false && result.assets) {
      const formData = new FormData();
      result.assets.forEach(asset => {
        formData.append('files', {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
        } as any);
      });

      try {
        const uploadResponse = await axiosInstance.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (uploadResponse.data.uploaded.length > 0) {
          const documents = uploadResponse.data.uploaded.map((item: any) => item.url);
          await axiosInstance.post(`/api/user/profile/update-documents/${user?.id}`, { documents });
          fetchProfile(); // Refresh profile to show new documents
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Documents uploaded successfully',
          });
        }
      } catch (error) {
        console.error('Error uploading documents:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to upload documents',
        });
      }
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await axiosInstance.delete(`/api/user/profile/delete-document/${user?.id}/${documentId}`);
      fetchProfile(); // Refresh profile
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Document deleted',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete document',
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{ flex: 1 }}
      >
        {/* Header with Profile Image */}
        <LinearGradient
          colors={['#3b82f6', '#06B6D4']}
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
                {profile.profileImage ? (
                  <Image
                    source={{ uri: profile.profileImage }}
                    className="w-32 h-32 rounded-full"
                  />
                ) : (
                  <User size={40} color="white" />
                )}
              </View>
              <View className="absolute bottom-0 right-0 bg-white rounded-full p-2">
                <Camera size={16} color="#3b82f6" />
              </View>
            </TouchableOpacity>
            
            <Text className="text-2xl font-bold text-white mb-1">{profile.fullName}</Text>
            <Text className="text-blue-100 text-base mb-4">{profile.specialization.replace(/_/g, ' ')}</Text>
            
            <View className="flex-row items-center">
              {/* Verification status can be added here if available in DoctorProfile */}
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
            <Text className="text-2xl font-bold text-gray-900 mb-4">Personal Information</Text>
            
            {renderInfoCard(
              <User size={20} color="#3b82f6" />,
              'Full Name',
              editData.fullName || '',
              true,
              (text) => setEditData({...editData, fullName: text})
            )}
            
            {renderInfoCard(
              <Mail size={20} color="#3b82f6" />,
              'Email Address',
              profile.email
            )}
            
            {renderInfoCard(
              <Phone size={20} color="#3b82f6" />,
              'Phone Number',
              editData.phoneNumber || '',
              true,
              (text) => setEditData({...editData, phoneNumber: text})
            )}
            
            {!editing ? (
              renderInfoCard(
                <MapPin size={20} color="#3b82f6" />,
                'Address',
                editData.address || ''
              )
            ) : null}
            
            {editing ? (
              <View className="bg-white rounded-2xl p-4 shadow-sm mb-3">
                <View className="flex-row items-center mb-2">
                  <View className="bg-blue-100 rounded-lg p-2 mr-3">
                    <Stethoscope size={20} color="#3b82f6" />
                  </View>
                  <Text className="text-gray-700 font-medium flex-1">Specialization</Text>
                </View>
                <Picker
                  selectedValue={editData.specialization}
                  onValueChange={(itemValue) => setEditData({ ...editData, specialization: itemValue })}
                >
                  {Object.values(DoctorSpecialization).map(spec => (
                    <Picker.Item key={spec} label={spec.replace(/_/g, ' ')} value={spec} />
                  ))}
                </Picker>
              </View>
            ) : renderInfoCard(
              <Stethoscope size={20} color="#3b82f6" />,
              'Specialization',
              editData.specialization?.replace(/_/g, ' ') || ''
            )}

            {renderInfoCard(
              <Award size={20} color="#3b82f6" />,
              'Experience (years)',
              editData.experience?.toString() || '0',
              true,
              (text) => setEditData({...editData, experience: parseInt(text) || 0})
            )}
            
            {renderInfoCard(
              <Building size={20} color="#3b82f6" />,
              'About',
              editData.about || '',
              true,
              (text) => setEditData({...editData, about: text}),
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
                  initialAddress={editData.address || ''}
                />
              </View>
            )}
          </View>

          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-4">Document Management</Text>
            <TouchableOpacity
              onPress={handleDocumentUpload}
              className="bg-blue-600 rounded-xl px-4 py-3 flex-row items-center justify-center mb-4"
            >
              <Camera size={16} color="white" />
              <Text className="text-white font-medium ml-2">Upload Documents</Text>
            </TouchableOpacity>

            {profile.documents?.map(doc => (
              <View key={doc.id} className="bg-white rounded-2xl p-4 shadow-sm mb-3 flex-row items-center justify-between">
                <Text className="text-gray-800">{doc.docType || 'Document'}</Text>
                <TouchableOpacity onPress={() => handleDeleteDocument(doc.id)}>
                  <X size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
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
              {/* Member since can be added if available in DoctorProfile */}
            </Text>
            <Text className="text-gray-600 text-sm text-center mt-1">
              Account ID: {user?.id.substring(0, 8)}...
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}