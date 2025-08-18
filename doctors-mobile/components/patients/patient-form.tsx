import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import GooglePlacesAutocomplete from "@/components/ui/google-places-autocomplete";
import { Picker } from "@react-native-picker/picker";

interface PatientFormData {
  name: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  latitude: string;
  longitude: string;
}

interface Props {
  formData: PatientFormData;
  onFormDataChange: (field: string, value: string) => void;
  onLocationSelect: (place: any) => void;
  onSubmit: () => void;
  submitting: boolean;
  mode: "create" | "edit";
}

export default function PatientForm({
  formData,
  onFormDataChange,
  onLocationSelect,
  onSubmit,
  submitting,
  mode,
}: Props) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, justifyContent: 'center' }}
    >
      <ScrollView>
        <View className="p-4 bg-white rounded-lg shadow-md m-4">
          <View>
            <Text className="font-semibold mb-1">Name</Text>
            <TextInput
              className="border border-gray-300 p-2 rounded-md"
              placeholder="Patient's full name"
              onChangeText={(value) => onFormDataChange("name", value)}
              value={formData.name}
            />
          </View>
          <View className="mt-4">
            <Text className="font-semibold mb-1">Phone Number</Text>
            <TextInput
              className="border border-gray-300 p-2 rounded-md"
              placeholder="Patient's phone number"
              onChangeText={(value) => onFormDataChange("phoneNumber", value)}
              value={formData.phoneNumber}
              keyboardType="phone-pad"
            />
          </View>
          <View className="mt-4">
            <Text className="font-semibold mb-1">Gender</Text>
            <Picker selectedValue={formData.gender} onValueChange={(value) => onFormDataChange("gender", value)}>
              <Picker.Item label="Male" value="MALE" />
              <Picker.Item label="Female" value="FEMALE" />
              <Picker.Item label="Other" value="OTHER" />
            </Picker>
          </View>
          <View className="mt-4">
            <Text className="font-semibold mb-1">Date of Birth</Text>
            <TextInput
              className="border border-gray-300 p-2 rounded-md"
              placeholder="YYYY-MM-DD"
              onChangeText={(value) => onFormDataChange("dateOfBirth", value)}
              value={formData.dateOfBirth}
            />
          </View>
          <View className="mt-4">
            <Text className="font-semibold mb-1">Address</Text>
            <GooglePlacesAutocomplete onPlaceSelect={onLocationSelect} />
          </View>
          <TouchableOpacity
            onPress={onSubmit}
            disabled={submitting}
            className="bg-blue-600 p-3 rounded-md mt-6"
          >
            <Text className="text-white text-center font-bold">
              {submitting ? "Submitting..." : mode === "create" ? "Create Patient" : "Update Patient"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 