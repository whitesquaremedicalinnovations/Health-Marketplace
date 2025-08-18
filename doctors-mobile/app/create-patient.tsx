import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, Platform } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { axiosInstance } from '@/lib/axios';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreatePatientScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [address, setAddress] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleCreatePatient = async () => {
    if (!name.trim() || !phoneNumber.trim()) {
      Toast.show({ type: 'error', text1: 'Name and Phone Number are required.' });
      return;
    }

    try {
      const response = await axiosInstance.post('/api/patient/create-patient', {
        name,
        phoneNumber,
        gender,
        dateOfBirth: dateOfBirth.toISOString().split('T')[0], // format as YYYY-MM-DD
        address,
        clinicId: user?.id,
      });

      if (response.status === 201) {
        Toast.show({ type: 'success', text1: 'Patient created!' });
        router.back();
      } else {
        Toast.show({ type: 'error', text1: 'Failed to create patient.' });
      }
    } catch (error) {
      console.error('Error creating patient:', error);
      Toast.show({ type: 'error', text1: 'An error occurred.' });
    }
  };

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(Platform.OS === 'ios');
    setDateOfBirth(currentDate);
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Create New Patient</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10, marginBottom: 15 }}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10, marginBottom: 15 }}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <TextInput
        style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10, marginBottom: 15 }}
        placeholder="Gender"
        value={gender}
        onChangeText={setGender}
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
        value={address}
        onChangeText={setAddress}
      />
      <Button title="Create Patient" onPress={handleCreatePatient} />
    </ScrollView>
  );
} 