import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { ThemeSettings } from '@/components/ThemeSettings';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  qualification: string;
  registrationNumber: string;
  bio: string;
  profilePicture?: string;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [profile, setProfile] = useState<DoctorProfile>({
    id: '1',
    name: 'Dr. John Doe',
    email: 'john.doe@example.com',
    phone: '+91 9876543210',
    specialization: 'Cardiology',
    experience: '8 years',
    qualification: 'MBBS, MD Cardiology',
    registrationNumber: 'MCI123456',
    bio: 'Experienced cardiologist with expertise in interventional cardiology and heart surgery.',
    isVerified: true,
    rating: 4.8,
    totalReviews: 156,
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfile(prev => ({ ...prev, profilePicture: result.assets[0].uri }));
    }
  };

  const ProfileField = ({ 
    label, 
    value, 
    icon, 
    editable = false,
    onPress 
  }: {
    label: string;
    value: string;
    icon: string;
    editable?: boolean;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.profileField, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!editable && !onPress}
    >
      <View style={styles.fieldLeft}>
        <Ionicons name={icon as any} size={20} color={colors.icon} />
        <View style={styles.fieldContent}>
          <ThemedText type="muted" style={styles.fieldLabel}>
            {label}
          </ThemedText>
          <ThemedText style={styles.fieldValue}>
            {value}
          </ThemedText>
        </View>
      </View>
      {(editable || onPress) && (
        <Ionicons name="chevron-forward" size={20} color={colors.icon} />
      )}
    </TouchableOpacity>
  );

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing functionality will be implemented soon.');
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Password change functionality will be implemented soon.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          // Handle logout logic
          console.log('Logout pressed');
        }},
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <ThemedView variant="surface" style={styles.profileHeader}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {profile.profilePicture ? (
              <Image source={{ uri: profile.profilePicture }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.avatarText}>
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </ThemedText>
              </View>
            )}
            <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <ThemedText type="title" style={styles.profileName}>
                {profile.name}
              </ThemedText>
              {profile.isVerified && (
                <Ionicons name="checkmark-circle" size={24} color={colors.secondary} />
              )}
            </View>
            
            <ThemedText type="muted" style={styles.specialization}>
              {profile.specialization}
            </ThemedText>
            
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={colors.warning} />
              <ThemedText style={styles.rating}>
                {profile.rating} ({profile.totalReviews} reviews)
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Profile Details */}
        <ThemedView variant="surface" style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Personal Information
          </ThemedText>
          
          <ProfileField
            label="Email"
            value={profile.email}
            icon="mail-outline"
            editable
            onPress={handleEditProfile}
          />
          <ProfileField
            label="Phone"
            value={profile.phone}
            icon="call-outline"
            editable
            onPress={handleEditProfile}
          />
          <ProfileField
            label="Experience"
            value={profile.experience}
            icon="time-outline"
            editable
            onPress={handleEditProfile}
          />
          <ProfileField
            label="Qualification"
            value={profile.qualification}
            icon="school-outline"
            editable
            onPress={handleEditProfile}
          />
          <ProfileField
            label="Registration Number"
            value={profile.registrationNumber}
            icon="document-text-outline"
            editable
            onPress={handleEditProfile}
          />
        </ThemedView>

        {/* Bio Section */}
        <ThemedView variant="surface" style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            About
          </ThemedText>
          <TouchableOpacity onPress={handleEditProfile}>
            <ThemedText style={styles.bio}>
              {profile.bio}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Settings */}
        <ThemedView variant="surface" style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Settings
          </ThemedText>
          
          <ProfileField
            label="Theme"
            value="Appearance settings"
            icon="color-palette-outline"
            onPress={() => setShowThemeSettings(!showThemeSettings)}
          />
          <ProfileField
            label="Change Password"
            value="Update your password"
            icon="lock-closed-outline"
            onPress={handleChangePassword}
          />
          <ProfileField
            label="Notifications"
            value="Manage notifications"
            icon="notifications-outline"
            onPress={() => Alert.alert('Notifications', 'Settings will be implemented soon.')}
          />
        </ThemedView>

        {/* Theme Settings */}
        {showThemeSettings && <ThemeSettings />}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Edit Profile"
            variant="primary"
            onPress={handleEditProfile}
            leftIcon={<Ionicons name="create-outline" size={20} color="white" />}
          />
          <Button
            title="Logout"
            variant="outline"
            onPress={handleLogout}
            leftIcon={<Ionicons name="log-out-outline" size={20} color={colors.error} />}
            style={[styles.logoutButton, { borderColor: colors.error }]}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  profileHeader: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  profileName: {
    textAlign: 'center',
  },
  specialization: {
    fontSize: 16,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  profileField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  fieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 16,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
  },
  logoutButton: {
    borderColor: '#ef4444',
  },
});