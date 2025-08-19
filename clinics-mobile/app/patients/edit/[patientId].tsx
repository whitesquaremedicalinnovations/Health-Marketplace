import PatientForm from "../../../components/patients/patient-form";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import Toast from "react-native-toast-message";
import { axiosInstance } from "../../../lib/axios";

interface PatientFormData {
  name: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  latitude: string;
  longitude: string;
}

export default function EditPatientScreen() {
  const { patientId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    phoneNumber: "",
    gender: "MALE",
    dateOfBirth: "",
    address: "",
    latitude: "",
    longitude: ""
  });

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await axiosInstance.get(`/api/patient/get-patient/${patientId}`);
        const patient = response.data.data;
        setFormData({
          name: patient.name,
          phoneNumber: patient.phoneNumber,
          gender: patient.gender,
          dateOfBirth: patient.dateOfBirth.split('T')[0],
          address: patient.address,
          latitude: patient.latitude?.toString() || "",
          longitude: patient.longitude?.toString() || ""
        });
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Failed to fetch patient data' });
      } finally {
        setLoading(false);
      }
    };
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (place: any) => {
    if (place) {
      setFormData(prev => ({
        ...prev,
        address: place.formatted_address || "",
        latitude: place.geometry?.location?.lat()?.toString() || "",
        longitude: place.geometry?.location?.lng()?.toString() || ""
      }));
    }
  };

  const handleEditPatient = async () => {
    setSubmitting(true);
    try {
      await axiosInstance.put(`/api/patient/update-patient/${patientId}`, formData);
      Toast.show({ type: 'success', text1: 'Patient updated successfully' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to update patient' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text>Loading patient data...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <PatientForm
        formData={formData}
        onFormDataChange={handleInputChange}
        onLocationSelect={handleLocationSelect}
        onSubmit={handleEditPatient}
        submitting={submitting}
        mode="edit"
      />
    </View>
  );
} 