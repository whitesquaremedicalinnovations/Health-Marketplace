import PatientForm from "@/components/patients/patient-form";
import { useUser } from "@clerk/clerk-expo";
import { useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { axiosInstance } from "@/lib/axios";

interface PatientFormData {
  name: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  latitude: string;
  longitude: string;
}

export default function CreatePatientScreen() {
  const { user } = useUser();
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

  const handleCreatePatient = async () => {
    setSubmitting(true);
    try {
      await axiosInstance.post("/api/patient/create-patient", { ...formData, clinicId: user?.id });
      Toast.show({ type: 'success', text1: 'Patient created successfully' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to create patient' });
    } finally {
      setSubmitting(false);
    }
  };

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