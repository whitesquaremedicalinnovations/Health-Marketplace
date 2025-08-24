import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  Image, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { axiosInstance } from '../../../lib/axios';
import { UserCircle, ArrowLeft, User, Calendar, MapPin } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';

interface Patient {
  id: string;
  name: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  status: 'ACTIVE' | 'COMPLETED';
  profileImage?: { docUrl: string };
  lastMessage?: {
    content: string;
    timestamp: string;
    read: boolean;
  };
}

export default function PatientListScreen() {
  const { clinicId } = useLocalSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const fetchPatients = async () => {
    if (clinicId) {
      try {
        const response = await axiosInstance.get(`/api/patient/get-clinic-patients/${clinicId}`);
        const allPatients = response.data.data || [];
        const filteredPatients = (allPatients || []).filter((patient: any) => 
          patient?.clinic?.id === clinicId
        );
        setPatients(filteredPatients);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPatients().finally(() => setLoading(false));
  }, [user, clinicId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPatients();
    setRefreshing(false);
  };

  const handlePatientSelect = (patient: Patient) => {
    router.push(`/chat/${patient.id}?doctorId=${user?.id}&clinicId=${clinicId}`);
  };

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 16 }}>
            Loading patients...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header */}
      <LinearGradient
        colors={['#2563EB', '#06B6D4']}
        style={{ 
          paddingHorizontal: 20, 
          paddingTop: 20, 
          paddingBottom: 30,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ marginRight: 16 }}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>
              Patients
            </Text>
            <Text style={{ fontSize: 16, color: '#bfdbfe' }}>
              Select a patient to start chatting
            </Text>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={patients}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 20 }}
        ListHeaderComponent={
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: 16,
            marginTop: 10 
          }}>
            Assigned Patients ({patients.length})
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
            onPress={() => handlePatientSelect(item)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#3b82f6',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
                overflow: 'hidden',
              }}>
                {item.profileImage?.docUrl ? (
                  <Image
                    source={{ uri: item.profileImage.docUrl }}
                    style={{ width: 56, height: 56, borderRadius: 28 }}
                  />
                ) : (
                  <User size={24} color="white" />
                )}
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 }}>
                  {item.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Calendar size={14} color="#6b7280" />
                  <Text style={{ fontSize: 14, color: '#6b7280', marginLeft: 4 }}>
                    {getAge(item.dateOfBirth)} years • {item.gender}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <MapPin size={14} color="#6b7280" />
                  <Text style={{ fontSize: 14, color: '#6b7280', marginLeft: 4, flex: 1 }}>
                    {item.address}
                  </Text>
                </View>
                <View style={{ 
                  backgroundColor: item.status === 'ACTIVE' ? '#dcfce7' : '#f3e8ff',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 12,
                  alignSelf: 'flex-start'
                }}>
                  <Text style={{ 
                    fontSize: 12, 
                    fontWeight: '600',
                    color: item.status === 'ACTIVE' ? '#166534' : '#7c3aed'
                  }}>
                    {item.status}
                  </Text>
                </View>
              </View>

              {item.lastMessage && !item.lastMessage.read && (
                <View style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: 4, 
                  backgroundColor: '#3b82f6' 
                }} />
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 32,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#f3f4f6',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <User size={32} color="#9ca3af" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>
              No Patients Assigned
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
              Patients will appear here once they are assigned to you
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
} 