import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { getClinic } from '../lib/utils';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export default function VerificationStatusScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();

  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClinicData = async (useCache = true) => {
    console.log("getting data")
    if (!user?.id) return;

    try {
      // Check cache first if useCache is true
      if (useCache) {
        const cachedUserData = await AsyncStorage.getItem(`user_data_${user.id}`);
        if (cachedUserData) {
          const userData = JSON.parse(cachedUserData);
          console.log("Using cached userData in verification", userData);
          
          if (userData.isVerified) {
            router.replace('/(drawer)/tabs/dashboard');
            return;
          } else {
            setClinicData(userData);
            setLoading(false);
            // Still fetch fresh data in background
            fetchClinicData(false);
            return;
          }
        }
      }

      const response = await getClinic(user.id);
      console.log(response.data)
      if (response.status === 200 && response.data) {
        // Update cache
        await AsyncStorage.setItem(`user_data_${user.id}`, JSON.stringify(response.data));
        
        if(response.data.isVerified) {
          router.replace('/(drawer)/tabs/dashboard');
        } else {
          setClinicData(response.data);
        }
      } else {
        router.replace('/(auth)/home');
      }
    } catch (error) {
      console.error('Error fetching clinic data:', error);
      
      // Try to use cached data if fresh fetch fails
      if (useCache) {
        try {
          const cachedUserData = await AsyncStorage.getItem(`user_data_${user.id}`);
          if (cachedUserData) {
            const userData = JSON.parse(cachedUserData);
            console.log("Falling back to cached userData due to error");
            
            if (userData.isVerified) {
              router.replace('/(drawer)/tabs/dashboard');
              return;
            } else {
              setClinicData(userData);
              Toast.show({
                type: 'warning',
                text1: 'Using cached data',
                text2: 'Check network connection',
              });
              return;
            }
          }
        } catch (cacheError) {
          console.error('Error reading cached data:', cacheError);
        }
      }
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch clinic information',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchClinicData(false); // Force fresh data on refresh
    setRefreshing(false);
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Please contact our support team at support@healthconnect.com for verification assistance.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Copy Email',
          onPress: async () => {
            await Clipboard.setStringAsync('support@healthconnect.com');
            Toast.show({
              type: 'success',
              text1: 'Email copied',
              text2: 'support@healthconnect.com copied to clipboard',
            });
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear cached data on sign out
              if (user?.id) {
                await AsyncStorage.removeItem(`user_data_${user.id}`);
              }
              await AsyncStorage.removeItem('hasOnboarded');
              
              await signOut();
              router.replace('/(auth)/home');
            } catch (error) {
              console.error('Error signing out:', error);
              router.replace('/(auth)/home');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (!clinicData && user?.id) {
      fetchClinicData();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading verification status...</Text>
      </View>
    );
  }

  if (!clinicData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Unable to load clinic data</Text>
        <Text style={styles.errorDescription}>
          Please try again or contact support if the problem persists.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchClinicData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification Status</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusIconContainer}>
          {clinicData.isVerified ? (
            <Ionicons name="checkmark-circle" size={64} color="#10B981" />
          ) : (
            <Ionicons name="time" size={64} color="#F59E0B" />
          )}
        </View>

        <Text style={styles.statusTitle}>
          {clinicData.isVerified ? 'Verified' : 'Pending Verification'}
        </Text>

        <Text style={styles.statusDescription}>
          {clinicData.isVerified
            ? 'Your clinic has been successfully verified. You can now access all features.'
            : 'Your clinic verification is currently under review. This usually takes 1-3 business days.'}
        </Text>

        {!clinicData.isVerified && (
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Ionicons name="refresh" size={20} color="#2563EB" />
            <Text style={styles.refreshButtonText}>
              {refreshing ? 'Checking...' : 'Check Status'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Clinic Information */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Clinic Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Clinic Name:</Text>
          <Text style={styles.infoValue}>{clinicData.clinicName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Owner Name:</Text>
          <Text style={styles.infoValue}>{clinicData.ownerName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{clinicData.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{clinicData.clinicPhoneNumber}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Address:</Text>
          <Text style={styles.infoValue}>{clinicData.clinicAddress}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Registered:</Text>
          <Text style={styles.infoValue}>
            {new Date(clinicData.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Verification Process */}
      {!clinicData.isVerified && (
        <View style={styles.processCard}>
          <Text style={styles.processTitle}>Verification Process</Text>

          <View style={styles.processStep}>
            <View style={styles.stepIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Application Submitted</Text>
              <Text style={styles.stepDescription}>
                Your clinic information has been submitted for review
              </Text>
            </View>
          </View>

          <View style={styles.processStep}>
            <View style={styles.stepIcon}>
              <Ionicons name="time" size={24} color="#F59E0B" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Under Review</Text>
              <Text style={styles.stepDescription}>
                Our team is reviewing your clinic details and documents
              </Text>
            </View>
          </View>

          <View style={styles.processStep}>
            <View style={styles.stepIcon}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#D1D5DB" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Verification Complete</Text>
              <Text style={styles.stepDescription}>
                Once verified, you'll have full access to all features
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Support Section */}
      <View style={styles.supportCard}>
        <Text style={styles.supportTitle}>Need Help?</Text>
        <Text style={styles.supportDescription}>
          If you have questions about the verification process or need assistance, 
          our support team is here to help.
        </Text>

        <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
          <Ionicons name="chatbubble-outline" size={20} color="white" />
          <Text style={styles.supportButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      {clinicData.isVerified && (
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => router.replace('/(drawer)/tabs/dashboard')}
          >
            <Text style={styles.primaryButtonText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  signOutButton: {
    padding: 8,
  },
  statusCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIconContainer: {
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  processCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  processTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  supportCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  supportDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  supportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionContainer: {
    padding: 20,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 