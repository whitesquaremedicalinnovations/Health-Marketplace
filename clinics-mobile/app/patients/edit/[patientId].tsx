import PatientForm from "../../../components/patients/patient-form";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
  medicalProcedure: string;
}

export default function EditPatientScreen() {
  const { patientId } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    phoneNumber: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    latitude: "",
    longitude: "",
    medicalProcedure: ""
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
          longitude: patient.longitude?.toString() || "",
          medicalProcedure: patient.medicalProcedure || ""
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
        latitude: place.geometry?.location?.lat?.toString() || place.geometry?.location?.lat()?.toString() || "",
        longitude: place.geometry?.location?.lng?.toString() || place.geometry?.location?.lng()?.toString() || ""
      }));
    }
  };

  const handleEditPatient = async () => {
    setSubmitting(true);
    try {
      await axiosInstance.put(`/api/patient/update-patient/${patientId}`, formData);
      Toast.show({ 
        type: 'success', 
        text1: 'Success', 
        text2: 'Patient updated successfully' 
      });
      
      // Navigate back to patients page and refresh
      router.replace("/(drawer)/tabs/patients");
    } catch (error: any) {
      console.log("Error updating patient:", error);
      const errorMessage = error.response?.data?.message || 'Failed to update patient';
      Toast.show({ 
        type: 'error', 
        text1: 'Error', 
        text2: errorMessage 
      });
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
      <Stack.Screen 
            options={
                {
                    headerTitle: "Edit Patient",
                    headerStyle: {
                      backgroundColor: "#2563EB"
                    },
                    headerTitleStyle: {
                      color: "white"
                    }
                }
            }
        />
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