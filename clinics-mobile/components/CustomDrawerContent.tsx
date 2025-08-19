import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { LogOut, Building, User, Shield, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { getClinic } from '../lib/utils';

interface Clinic {
  id: string;
  email: string;
  ownerName: string;
  ownerPhoneNumber: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhoneNumber: string;
  clinicAdditionalDetails: string | null;
  profileImage: { docUrl: string } | null;
  documents?: Document[];
  galleryImages?: GalleryImage[];
  reviews?: Review[];
  isVerified: boolean;
}

interface Document {
  id: string;
  docUrl: string;
  name: string;
  type: string;
}

interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  doctor: {
    fullName: string;
    profileImage: { docUrl: string } | null;
  };
}

export function CustomDrawerContent(props: any) {
  const { top, bottom } = useSafeAreaInsets();
  const { user } = useUser();
  const [profile, setProfile] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      const response = await getClinic(user.id);
      const clinic = response.data?.success ? response.data.data : response.data.clinic;
      setProfile(clinic || null);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <DrawerContentScrollView 
        {...props} 
        contentContainerStyle={{ paddingTop: 0 }}
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Header Section */}
          <Link href="/(drawer)/profile" asChild>
            <TouchableOpacity style={{ alignItems: 'center', paddingTop: top + 20 }}>
              <View style={{ 
                width: 100, 
                height: 100, 
                borderRadius: 40, 
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                borderWidth: 3,
                borderColor: 'rgba(255,255,255,0.3)'
              }}>
                {profile?.profileImage?.docUrl ? (
                  <Image
                    source={{ uri: profile.profileImage.docUrl }}
                    style={{ width: 74, height: 74, borderRadius: 37 }}
                  />
                ) : (
                  <Building size={32} color="white" />
                )}
              </View>
              
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                color: 'black',
                textAlign: 'center',
                marginBottom: 4
              }} numberOfLines={1}>
                {profile?.clinicName || user?.fullName || 'Clinic'}
              </Text>
              
              <Text style={{ 
                fontSize: 14, 
                color: 'black',
                textAlign: 'center',
                marginBottom: 8
              }} numberOfLines={1}>
                {profile?.ownerName || 'Healthcare Provider'}
              </Text>

              {/* Verification Status */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: profile?.isVerified ? 'rgba(59,130,246,0.2)' : 'rgba(245,158,11,0.2)',
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12,
                marginBottom: 10
              }}>
                {profile?.isVerified ? (
                  <Shield size={12} color="#3b82f6" />
                ) : (
                  <Clock size={12} color="#f59e0b" />
                )}
                <Text style={{ 
                  color: profile?.isVerified ? '#3b82f6' : '#f59e0b',
                  fontSize: 12,
                  fontWeight: '600',
                  marginLeft: 4
                }}>
                  {profile?.isVerified ? 'Verified' : 'Pending'}
                </Text>
              </View>
            </TouchableOpacity>
          </Link>
        
        {/* Navigation Items */}
        <View style={{ paddingHorizontal: 8 }}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
      
      {/* Logout Section */}
      <View style={{
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingBottom: bottom + 16,
        backgroundColor: '#ffffff'
      }}>
        <TouchableOpacity
          onPress={() => {
            signOut();
            AsyncStorage.removeItem('hasOnboarded');
            router.replace('/(auth)/sign-in');
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 20,
            backgroundColor: '#fef2f2',
            marginHorizontal: 12,
            marginTop: 12,
            borderRadius: 12,
          }}
        >
          <LogOut color="#ef4444" size={20} />
          <Text style={{ 
            marginLeft: 12, 
            color: '#ef4444',
            fontSize: 16,
            fontWeight: '600'
          }}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 