import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { axiosInstance } from '../../../lib/axios';
import { UserCircle } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';

interface Patient {
  id: string;
  name: string;
}

export default function PatientListScreen() {
  const { doctorId } = useLocalSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const fetchPatients = async () => {
      if (user?.id) {
        try {
          const response = await axiosInstance.get(`/api/patient/get-clinic-patients/${user.id}`);
          const filteredPatients = response.data.data.filter((patient: any) => 
            patient.assignedDoctors.some((doctor: any) => doctor.id === doctorId)
          );
          setPatients(filteredPatients);
        } catch (error) {
          console.error("Error fetching patients:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPatients();
  }, [user, doctorId]);

  const handlePatientSelect = (patient: Patient) => {
    router.push(`/chat/${patient.id}?doctorId=${doctorId}`);
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <FlatList
      data={patients}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={<Text style={{ fontSize: 28, fontWeight: 'bold', padding: 16 }}>Select a Patient</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}
          onPress={() => handlePatientSelect(item)}
        >
          <UserCircle size={50} color="gray" />
          <Text style={{ marginLeft: 12, fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
} 