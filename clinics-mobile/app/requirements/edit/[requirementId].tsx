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
import { useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Picker } from "@react-native-picker/picker";
import { Briefcase } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { axiosInstance } from "../../../lib/axios";
import DateTimePickerAndroid from "@react-native-community/datetimepicker";

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

export default function EditRequirementScreen() {
  const { user } = useUser();
  const router = useRouter();
  const { requirementId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("ONETIME");
  const [specialization, setSpecialization] = useState(DoctorSpecialization.GENERAL_PHYSICIAN);
  const [additionalInformation, setAdditionalInformation] = useState("");
  const [requirementStatus, setRequirementStatus] = useState("POSTED");
  const [time, setTime] = useState("");

  useEffect(() => {
    const fetchRequirement = async () => {
      try {
        const response = await axiosInstance.get(`/api/clinic/get-requirement/${requirementId}`);
        const requirement = response.data.requirement;
        setTitle(requirement.title);
        setDescription(requirement.description);
        setType(requirement.type);
        setSpecialization(requirement.specialization);
        setAdditionalInformation(requirement.additionalInformation);
        setRequirementStatus(requirement.requirementStatus);
        setTime(requirement.time || "");
      } catch (error) {
        console.error("Error fetching requirement:", error);
        Toast.show({ type: 'error', text1: 'Failed to fetch requirement details.' });
      } finally {
        setLoading(false);
      }
    };
    if (requirementId) {
      fetchRequirement();
    }
  }, [requirementId]);

  async function onSubmit() {
    if (!title.trim() || !description.trim()) {
      Toast.show({ type: 'error', text1: 'Title and Description are required.' });
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosInstance.patch(`/api/clinic/update-requirement/${requirementId}`, {
        title,
        description,
        type,
        specialization,
        additionalInformation,
        requirementStatus,
        time,
        clinicId: user?.id,
      });
      Toast.show({ type: 'success', text1: 'Requirement updated successfully!' });
      router.push("/(drawer)/tabs/requirements");
    } catch (error) {
      console.error("Error updating requirement:", error);
      Toast.show({ type: 'error', text1: 'Failed to update requirement.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Stack.Screen 
            options={
                {
                    headerTitle: "Edit Requirement",
                    headerStyle: {
                      backgroundColor: "#2563EB"
                    },
                    headerTitleStyle: {
                      color: "white"
                    }
                }
            }
        />
        <ActivityIndicator size="large" />
        <Text>Loading requirement...</Text>
      </View>
    );
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
                    headerTitle: "Edit Requirement",
                    headerStyle: {
                      backgroundColor: "#2563EB"
                    },
                    headerTitleStyle: {
                      color: "white"
                    }
                }
            }
        />
        <View className="p-4">
          <View className="bg-orange-600 rounded-xl p-6 shadow-lg mb-6">
            <View className="flex-row items-center">
              <Briefcase size={24} color="white" />
              <Text className="text-2xl font-bold text-white ml-3">
                Edit Requirement
              </Text>
            </View>
            <Text className="text-white opacity-80 mt-1">
              Update your job requirement details
            </Text>
          </View>

          <View className="bg-white p-6 rounded-lg shadow-md">
            <View>
              <Text className="font-semibold mb-1">Title</Text>
              <TextInput
                className="border border-gray-300 p-2 rounded-md"
                placeholder="e.g. Need a cardiologist"
                onChangeText={setTitle}
                value={title}
              />
            </View>
            <View className="mt-4">
              <Text className="font-semibold mb-1">Description</Text>
              <TextInput
                className="border border-gray-300 p-2 rounded-md h-24"
                placeholder="Describe the requirement in detail"
                onChangeText={setDescription}
                value={description}
                multiline
              />
            </View>
            <View className="mt-4">
              <Text className="font-semibold mb-1">Type</Text>
              <Picker selectedValue={type} onValueChange={setType}>
                <Picker.Item label="Onetime" value="ONETIME" />
                <Picker.Item label="Full-time" value="FULLTIME" />
                <Picker.Item label="Part-time" value="PARTTIME" />
              </Picker>
            </View>
            <View className="mt-4">
              <Text className="font-semibold mb-1">Specialization</Text>
              <Picker selectedValue={specialization} onValueChange={setSpecialization}>
                {Object.values(DoctorSpecialization).map((spec) => (
                  <Picker.Item key={spec} label={spec} value={spec} />
                ))}
              </Picker>
            </View>
            <View className="mt-4">
              <Text className="font-semibold mb-1">Time (Optional)</Text>
              <TextInput
                className="border border-gray-300 p-2 rounded-md"
                placeholder="e.g. 14:30"
                onChangeText={setTime}
                value={time}
              />
            </View>
            <View className="mt-4">
              <Text className="font-semibold mb-1">
                Additional Information (Optional)
              </Text>
              <TextInput
                className="border border-gray-300 p-2 rounded-md h-24"
                placeholder="Any other details"
                onChangeText={setAdditionalInformation}
                value={additionalInformation}
                multiline
              />
            </View>
            <View className="mt-4">
              <Text className="font-semibold mb-1">Status</Text>
              <Picker selectedValue={requirementStatus} onValueChange={setRequirementStatus}>
                <Picker.Item label="Posted" value="POSTED" />
                <Picker.Item label="Completed" value="COMPLETED" />
              </Picker>
            </View>
            <TouchableOpacity
              onPress={onSubmit}
              disabled={isSubmitting}
              className="bg-orange-600 p-3 rounded-md mt-6 flex-row justify-center items-center"
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold">Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 