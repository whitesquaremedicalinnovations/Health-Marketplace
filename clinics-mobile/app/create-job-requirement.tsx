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
import { Briefcase, ArrowLeft } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { axiosInstance } from "../lib/axios";

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

export default function CreateJobRequirementScreen() {
  const { user } = useUser();
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("FULLTIME");
  const [specialization, setSpecialization] = useState(
    DoctorSpecialization.GENERAL_PHYSICIAN
  );
  const [additionalInformation, setAdditionalInformation] = useState("");
  const [time, setTime] = useState("");

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
          type,
          specialization,
          additionalInformation,
          time,
          clinicId: user?.id,
        }
      );
      if (response.status === 201) {
        Toast.show({ type: "success", text1: "Job requirement posted!" });
        router.push("/(drawer)/tabs/requirements");
      } else {
        Toast.show({ type: "error", text1: "Failed to post job requirement" });
      }
    } catch (error) {
      console.log("Error posting job requirement:", error);
      Toast.show({ type: "error", text1: "Failed to post job requirement" });
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
              Post Job Requirement
            </Text>
          </View>

          <View className="bg-purple-600 rounded-xl p-6 shadow-lg mb-6">
            <View className="flex-row items-center">
              <Briefcase size={24} color="white" />
              <Text className="text-2xl font-bold text-white ml-3">
                Job Position
              </Text>
            </View>
            <Text className="text-white opacity-80 mt-1">
              Find the perfect healthcare professional for your clinic
            </Text>
          </View>

          <View className="bg-white p-6 rounded-lg shadow-md">
            <View>
              <Text className="font-semibold mb-1">Job Title</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded-md"
                placeholder="e.g. Cardiologist needed"
                onChangeText={setTitle}
                value={title}
              />
            </View>
            <View className="mt-4">
              <Text className="font-semibold mb-1">Job Description</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded-md h-24"
                placeholder="Describe the job responsibilities, requirements, and benefits"
                onChangeText={setDescription}
                value={description}
                multiline
              />
            </View>
            <View className="mt-4">
              <Text className="font-semibold mb-1">Employment Type</Text>
              <Picker selectedValue={type} onValueChange={setType}>
                <Picker.Item label="Full-time" value="FULLTIME" />
                <Picker.Item label="Part-time" value="PARTTIME" />
                <Picker.Item label="Contract" value="ONETIME" />
              </Picker>
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
              <Text className="font-semibold mb-1">Start Time (Optional)</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded-md"
                placeholder="e.g. 09:00"
                onChangeText={setTime}
                value={time}
              />
            </View>
            <View className="mt-4">
              <Text className="font-semibold mb-1">
                Additional Information (Optional)
              </Text>
              <TextInput
                className="border border-gray-300 p-3 rounded-md h-24"
                placeholder="Salary range, work hours, location, benefits, etc."
                onChangeText={setAdditionalInformation}
                value={additionalInformation}
                multiline
              />
            </View>
            <TouchableOpacity
              onPress={onSubmit}
              disabled={isSubmitting}
              className="bg-purple-600 p-4 rounded-md mt-6 flex-row justify-center items-center"
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Post Job Requirement</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 