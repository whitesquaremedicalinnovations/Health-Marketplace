import PatientForm from "@/components/patients/patient-form";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";
import { axiosInstance } from "@/lib/axios";
import { Redirect, useRouter } from "expo-router";

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

export default function CreatePatientScreen() {
  const { user } = useUser();
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
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

  const handleCreatePatient = async () => {
    setSubmitting(true);
    try {
      await axiosInstance.post("/api/patient/create-patient", { 
        ...formData, 
        clinicId: user?.id 
      });
      Toast.show({ 
        type: 'success', 
        text1: 'Success', 
        text2: 'Patient created successfully' 
      });
      
      // Navigate back to patients page and refresh
      router.replace("/(drawer)/tabs/patients");
    } catch (error: any) {
      console.log("Error creating patient:", error);
      const errorMessage = error.response?.data?.message || 'Failed to create patient';
      Toast.show({ 
        type: 'error', 
        text1: 'Error', 
        text2: errorMessage 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading indicator while Clerk is initializing
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // Redirect to home if not signed in
  if (!isSignedIn) {
    return <Redirect href="/(auth)/home" />;
  }

  return (
    <View className="flex-1">
      <PatientForm
        formData={formData}
        onFormDataChange={handleInputChange}
        onLocationSelect={handleLocationSelect}
        onSubmit={handleCreatePatient}
        submitting={submitting}
        mode="create"
      />
    </View>
  );
} 