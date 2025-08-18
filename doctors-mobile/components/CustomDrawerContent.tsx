import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { getClinic } from '@/lib/utils';

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
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: top }}>
        <Link href="/(drawer)/profile" asChild>
          <TouchableOpacity style={{ padding: 20, alignItems: 'center' }}>
            <Image
              source={{ uri: profile?.profileImage?.docUrl }}
              style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10 }}
            />
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{user?.fullName}</Text>
            </TouchableOpacity>
        </Link>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <TouchableOpacity
        onPress={() => {
          signOut();
          AsyncStorage.removeItem('hasOnboarded')
          router.replace('/(auth)/sign-in');
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingBottom: bottom + 10,
        }}
      >
        <LogOut color="gray" size={20} />
        <Text style={{ marginLeft: 10, color: 'gray' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
} 