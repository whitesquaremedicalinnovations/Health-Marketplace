import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { axiosInstance } from '../../../lib/axios';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import { useUser } from '@clerk/clerk-expo';

interface Doctor {
  id: string;
  fullName: string;
}

export default function AssignDoctorScreen() {
  const { patientId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (user?.id) {
        try {
          const response = await axiosInstance.get(`/api/clinic/connected-doctors/${user.id}`);
          setDoctors(response.data.data);
          if (response.data.data.length > 0) {
            setSelectedDoctor(response.data.data[0].id);
          }
        } catch (error) {
          console.error('Error fetching doctors:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDoctors();
  }, [user]);

  const handleAssignDoctor = async () => {
    if (!selectedDoctor) return;

    try {
      const response = await axiosInstance.patch(`/api/patient/assign-doctor-to-patient/${patientId}`, {
        doctorId: selectedDoctor,
      });

      if (response.status === 200) {
        Toast.show({ type: 'success', text1: 'Doctor assigned!' });
        router.back();
      } else {
        Toast.show({ type: 'error', text1: 'Failed to assign doctor.' });
      }
    } catch (error) {
      console.error('Error assigning doctor:', error);
      Toast.show({ type: 'error', text1: 'An error occurred.' });
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Assign Doctor</Text>
      <Picker
        selectedValue={selectedDoctor}
        onValueChange={(itemValue) => setSelectedDoctor(itemValue)}
      >
        {doctors.map((doctor) => (
          <Picker.Item key={doctor.id} label={doctor.fullName} value={doctor.id} />
        ))}
      </Picker>
      <Button title="Assign Doctor" onPress={handleAssignDoctor} />
    </View>
  );
} 