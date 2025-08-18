import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { axiosInstance } from '../../../lib/axios';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';

interface PatientDetails {
  name: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
}

export default function EditPatientScreen() {
  const { patientId } = useLocalSearchParams();
  const router = useRouter();
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      if (typeof patientId === 'string') {
        try {
          const response = await axiosInstance.get(`/api/patient/get-patient-by-id/${patientId}`);
          setPatient(response.data.data);
          setDateOfBirth(new Date(response.data.data.dateOfBirth));
        } catch (error) {
          console.error('Error fetching patient:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPatient();
  }, [patientId]);

  const handleUpdatePatient = async () => {
    if (!patient) return;

    try {
      const response = await axiosInstance.put(`/api/patient/update-patient/${patientId}`, {
        ...patient,
        dateOfBirth: dateOfBirth.toISOString().split('T')[0],
      });

      if (response.status === 200) {
        Toast.show({ type: 'success', text1: 'Patient updated!' });
        router.back();
      } else {
        Toast.show({ type: 'error', text1: 'Failed to update patient.' });
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      Toast.show({ type: 'error', text1: 'An error occurred.' });
    }
  };

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(Platform.OS === 'ios');
    setDateOfBirth(currentDate);
    if (patient) {
      setPatient({ ...patient, dateOfBirth: currentDate.toISOString().split('T')[0] });
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  if (!patient) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Patient not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Edit Patient</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10, marginBottom: 15 }}
        placeholder="Name"
        value={patient.name}
        onChangeText={(text) => setPatient({ ...patient, name: text })}
      />
      <TextInput
        style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10, marginBottom: 15 }}
        placeholder="Phone Number"
        value={patient.phoneNumber}
        onChangeText={(text) => setPatient({ ...patient, phoneNumber: text })}
        keyboardType="phone-pad"
      />
      <TextInput
        style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10, marginBottom: 15 }}
        placeholder="Gender"
        value={patient.gender}
        onChangeText={(text) => setPatient({ ...patient, gender: text })}
      />
      <View style={{ marginBottom: 15 }}>
        <Button onPress={() => setShowDatePicker(true)} title="Select Date of Birth" />
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={dateOfBirth}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
        <Text style={{ marginTop: 8 }}>Selected: {dateOfBirth.toLocaleDateString()}</Text>
      </View>
      <TextInput
        style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10, marginBottom: 20 }}
        placeholder="Address"
        value={patient.address}
        onChangeText={(text) => setPatient({ ...patient, address: text })}
      />
      <Button title="Update Patient" onPress={handleUpdatePatient} />
    </ScrollView>
  );
} 