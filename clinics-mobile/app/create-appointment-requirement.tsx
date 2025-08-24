import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";
import { Stack, useRouter, Redirect } from "expo-router";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { Picker } from "@react-native-picker/picker";
import { Calendar, ArrowLeft, Clock } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { axiosInstance } from "../lib/axios";
import DateTimePicker from '@react-native-community/datetimepicker';

enum DoctorSpecialization {
  GENERAL_PHYSICIAN = "GENERAL_PHYSICIAN",
  CARDIOLOGIST = "CARDIOLOGIST",
  DERMATOLOGIST = "DERMATOLOGIST",
  ENDOCRINOLOGIST = "ENDOCRINOLOGIST",
  GASTROENTEROLOGIST = "GASTROENTEROLOGIST",
  NEUROLOGIST = "NEUROLOGIST",
  ONCOLOGIST = "ONCOLOGIST",
  OPHTHALMOLOGIST = "OPHTHALMOLOGIST",
  ORTHOPEDIC_SURGEON = "ORTHOPEDIC_SURGEON",
  PEDIATRICIAN = "PEDIATRICIAN",
  PSYCHIATRIST = "PSYCHIATRIST",
  PULMONOLOGIST = "PULMONOLOGIST",
  RADIOLOGIST = "RADIOLOGIST",
  UROLOGIST = "UROLOGIST",
  ANESTHESIOLOGIST = "ANESTHESIOLOGIST",
  EMERGENCY_MEDICINE_PHYSICIAN = "EMERGENCY_MEDICINE_PHYSICIAN",
  FAMILY_MEDICINE_PHYSICIAN = "FAMILY_MEDICINE_PHYSICIAN",
  GERIATRICIAN = "GERIATRICIAN",
  HEMATOLOGIST = "HEMATOLOGIST",
  INFECTIOUS_DISEASE_SPECIALIST = "INFECTIOUS_DISEASE_SPECIALIST",
  NEPHROLOGIST = "NEPHROLOGIST",
  OBSTETRICIAN_GYNECOLOGIST = "OBSTETRICIAN_GYNECOLOGIST",
  OTOLARYNGOLOGIST = "OTOLARYNGOLOGIST",
  PATHOLOGIST = "PATHOLOGIST",
  PLASTIC_SURGEON = "PLASTIC_SURGEON",
  RHEUMATOLOGIST = "RHEUMATOLOGIST",
  SPORTS_MEDICINE_PHYSICIAN = "SPORTS_MEDICINE_PHYSICIAN",
  ALLERGIST_IMMUNOLOGIST = "ALLERGIST_IMMUNOLOGIST",
  HOSPITALIST = "HOSPITALIST",
  PAIN_MANAGEMENT_SPECIALIST = "PAIN_MANAGEMENT_SPECIALIST",
}

export default function CreateAppointmentRequirementScreen() {
  const { user } = useUser();
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [specialization, setSpecialization] = useState(
    DoctorSpecialization.GENERAL_PHYSICIAN
  );
  const [additionalInformation, setAdditionalInformation] = useState("");
  const [preferredDate, setPreferredDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [duration, setDuration] = useState("60");

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setPreferredDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDateTime = new Date(preferredDate);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setPreferredDate(newDateTime);
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  async function onSubmit() {
    if (!title.trim() || !description.trim()) {
      Toast.show({ type: "error", text1: "Title and Description are required." });
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await axiosInstance.post(
        "/api/clinic/post-requirement",
        {
          title,
          description,
          type: "ONETIME", // Always ONETIME for appointments
          specialization,
          additionalInformation,
          clinicId: user?.id,
          preferredDate: preferredDate.toISOString(),
          duration,
        }
      );
      if (response.status === 201) {
        Toast.show({ type: "success", text1: "Appointment requirement posted!" });
        router.push("/(drawer)/tabs/requirements");
      } else {
        Toast.show({ type: "error", text1: "Failed to post appointment requirement" });
      }
    } catch (error) {
      console.log("Error posting appointment requirement:", error);
      Toast.show({ type: "error", text1: "Failed to post appointment requirement" });
    } finally {
      setIsSubmitting(false);
    }
  }

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
      >
        <Stack.Screen 
            options={
                {
                    headerShown: false
                }
            }
        />
        <View className="p-4">
          {/* Header with back button */}
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 mr-3"
            >
              <ArrowLeft size={24} color="#3b82f6" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">
              Post Appointment Requirement
            </Text>
          </View>

          <View className="bg-blue-600 rounded-xl p-6 shadow-lg mb-6">
            <View className="flex-row items-center">
              <Calendar size={24} color="white" />
              <Text className="text-2xl font-bold text-white ml-3">
                Appointment
              </Text>
            </View>
            <Text className="text-white opacity-80 mt-1">
              Find a healthcare professional for a one-time consultation
            </Text>
          </View>

          <View className="bg-white p-6 rounded-lg shadow-md">
            <View>
              <Text className="font-semibold mb-1">Appointment Title</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded-md"
                placeholder="e.g. Need cardiologist consultation"
                onChangeText={setTitle}
                value={title}
              />
            </View>
            <View className="mt-4">
              <Text className="font-semibold mb-1">Appointment Description</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded-md h-24"
                placeholder="Describe the consultation needed, patient condition, and requirements"
                onChangeText={setDescription}
                value={description}
                multiline
              />
            </View>
            <View className="mt-4">
              <Text className="font-semibold mb-1">Specialization Required</Text>
              <Picker
                selectedValue={specialization}
                onValueChange={setSpecialization}
              >
                {Object.values(DoctorSpecialization).map((spec) => (
                  <Picker.Item key={spec} label={spec.replace(/_/g, ' ')} value={spec} />
                ))}
              </Picker>
            </View>
            <View className="mt-4">
              <Text className="font-semibold mb-1">Preferred Date & Time</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="flex-1 border border-gray-300 p-3 rounded-md bg-white"
                >
                  <Text className="text-gray-600 text-sm">Date</Text>
                  <Text className="text-gray-900 font-medium">
                    {preferredDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  className="flex-1 border border-gray-300 p-3 rounded-md bg-white"
                >
                  <Text className="text-gray-600 text-sm">Time</Text>
                  <Text className="text-gray-900 font-medium">
                    {preferredDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text className="text-gray-500 text-xs mt-1">
                Selected: {formatDateTime(preferredDate)}
              </Text>
            </View>
            <View className="mt-4">
              <Text className="font-semibold mb-1">Duration (minutes)</Text>
              <Picker selectedValue={duration} onValueChange={setDuration}>
                <Picker.Item label="30 minutes" value="30" />
                <Picker.Item label="60 minutes" value="60" />
                <Picker.Item label="90 minutes" value="90" />
                <Picker.Item label="120 minutes" value="120" />
              </Picker>
            </View>
            <View className="mt-4">
              <Text className="font-semibold mb-1">
                Additional Information (Optional)
              </Text>
              <TextInput
                className="border border-gray-300 p-3 rounded-md h-24"
                placeholder="Urgency level, specific requirements, location preferences, etc."
                onChangeText={setAdditionalInformation}
                value={additionalInformation}
                multiline
              />
            </View>
            <TouchableOpacity
              onPress={onSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 p-4 rounded-md mt-6 flex-row justify-center items-center"
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Post Appointment Requirement</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={preferredDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={preferredDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </KeyboardAvoidingView>
  );
} 