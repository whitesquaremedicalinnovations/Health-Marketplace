import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@clerk/clerk-expo";
import { Trash2 } from "lucide-react-native";
import { axiosInstance } from "../../lib/axios";
import { onboardingClinic } from "../../lib/utils";
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';

export default function OnboardingScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [ownerFirstName, setOwnerFirstName] = useState("");
  const [ownerLastName, setOwnerLastName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhoneNumber, setOwnerPhoneNumber] = useState("");

  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [clinicPhoneNumber, setClinicPhoneNumber] = useState("");
  const [clinicAdditionalDetails, setClinicAdditionalDetails] = useState("");
  const [clinicDocuments, setClinicDocuments] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [clinicProfileImage, setClinicProfileImage] = useState<ImagePicker.ImagePickerAsset | null>(
    null
  );
  const [clinicLocation, setClinicLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [preferredRadius, setPreferredRadius] = useState(5);

  const [loading, setLoading] = useState(false);
  const [onboardingAmount, setOnboardingAmount] = useState(0);
  const [hasEmailPaid, setHasEmailPaid] = useState(false);

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  useEffect(() => {
    if (user) {
      setOwnerFirstName(user.firstName ?? "");
      setOwnerLastName(user.lastName ?? "");
      setOwnerEmail(user.emailAddresses[0]?.emailAddress ?? "");
      setOwnerPhoneNumber(user.phoneNumbers[0]?.phoneNumber ?? "");
    }
  }, [user]);

  const handleChooseProfileImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setClinicProfileImage(result.assets[0]);
    }
  };

  const handleChooseDocuments = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      setClinicDocuments(result.assets);
    }
  };


  const handleSubmit = async () => {
    setLoading(true);

    let profileImageUrl = null;
    if (clinicProfileImage) {
      const profileImageFormData = new FormData();
      profileImageFormData.append('file', {
        uri: clinicProfileImage.uri,
        name: clinicProfileImage.fileName,
        type: clinicProfileImage.mimeType,
      } as any);

      try {
        const res = await axiosInstance.post('/api/upload', profileImageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        profileImageUrl = res.data.url;
      } catch (error) {
        console.error("Profile image upload failed:", error);
        Toast.show({ type: 'error', text1: 'Profile image upload failed' });
        setLoading(false);
        return;
      }
    }

    const documentUrls = [];
    for (const doc of clinicDocuments) {
      const docFormData = new FormData();
      docFormData.append('file', {
        uri: doc.uri,
        name: doc.fileName,
        type: doc.mimeType,
      } as any);

      try {
        const res = await axiosInstance.post('/api/upload', docFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        documentUrls.push(res.data.url);
      } catch (error) {
        console.error("Document upload failed:", error);
        Toast.show({ type: 'error', text1: 'Document upload failed' });
        setLoading(false);
        return;
      }
    }

    try {
      const data = {
        clinicId: user?.id ?? "",
        ownerName: `${ownerFirstName} ${ownerLastName}`,
        ownerPhoneNumber,
        email: ownerEmail,
        clinicName,
        clinicAddress,
        clinicPhoneNumber,
        clinicAdditionalDetails,
        clinicProfileImage: profileImageUrl,
        documents: documentUrls,
        location: clinicLocation,
        preferredRadius,
      };

      const response = await onboardingClinic(data);
      if (response.status === 200) {
        await AsyncStorage.setItem("hasOnboarded", "true");
        router.replace("/(drawer)/tabs");
      } else {
        Toast.show({
          type: 'error',
          text1: 'Onboarding Failed',
          text2: 'Please try again.',
        });
      }
    } catch (err) {
      console.log("Error during onboarding:", err);
      Toast.show({
        type: 'error',
        text1: 'An error occurred',
        text2: 'Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-center text-gray-800">
            Welcome to HealthCare Platform
          </Text>
          <Text className="text-lg text-center text-gray-600 mt-2">
            Let's set up your clinic profile
          </Text>
        </View>

        {/* Step Indicator */}
        <View className="flex-row items-center justify-center mb-8">
          <View
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <Text className="text-white font-bold">1</Text>
          </View>
          <View
            className={`flex-1 h-1 ${
              step >= 2 ? "bg-blue-500" : "bg-gray-300"
            }`}
          />
          <View
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <Text className="text-white font-bold">2</Text>
          </View>
        </View>

        {step === 1 && (
          <View>
            <Text className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Owner Information
            </Text>
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">First Name</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded-lg"
                placeholder="John"
                value={ownerFirstName}
                onChangeText={setOwnerFirstName}
              />
            </View>
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Last Name</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded-lg"
                placeholder="Doe"
                value={ownerLastName}
                onChangeText={setOwnerLastName}
              />
            </View>
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Email Address</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded-lg bg-gray-200"
                value={ownerEmail}
                editable={false}
              />
            </View>
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Phone Number</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded-lg"
                placeholder="+1 (555) 123-4567"
                value={ownerPhoneNumber}
                onChangeText={setOwnerPhoneNumber}
              />
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Clinic Details
            </Text>
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Clinic Name</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded-lg"
                placeholder="HealthCare Plus"
                value={clinicName}
                onChangeText={setClinicName}
              />
            </View>
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Clinic Phone Number</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded-lg"
                placeholder="+1 (555) 987-6543"
                value={clinicPhoneNumber}
                onChangeText={setClinicPhoneNumber}
              />
            </View>
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Additional Details</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded-lg h-24"
                placeholder="Services, timings, etc."
                value={clinicAdditionalDetails}
                onChangeText={setClinicAdditionalDetails}
                multiline
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Clinic Address</Text>
              <TextInput
                className="border border-gray-300 p-3 rounded-lg"
                placeholder="123 Main St, Anytown, USA"
                value={clinicAddress}
                onChangeText={setClinicAddress}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Clinic Documents</Text>
              <TouchableOpacity 
                className="border border-dashed border-gray-400 p-6 rounded-lg flex items-center justify-center"
                onPress={handleChooseDocuments}
              >
                <Text>Upload Documents</Text>
              </TouchableOpacity>
              <View className="mt-4">
                {clinicDocuments.map((doc, index) => (
                  <View key={index} className="flex-row items-center justify-between bg-gray-100 p-2 rounded-lg mb-2">
                    <Text className="truncate w-4/5">{doc.fileName}</Text>
                    <TouchableOpacity onPress={() => setClinicDocuments(clinicDocuments.filter((_, i) => i !== index))}>
                      <Trash2 color="red" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* TODO: Implement Profile Image Upload */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Clinic Profile Image</Text>
              <TouchableOpacity 
                className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center self-center"
                onPress={handleChooseProfileImage}
              >
                {clinicProfileImage ? (
                  <Image source={{ uri: clinicProfileImage.uri }} className="w-32 h-32 rounded-full" />
                ) : (
                  <Text>Upload Image</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View className="flex-row justify-between mt-8">
          {step > 1 ? (
            <Button title="Previous" onPress={handlePrev} />
          ) : (
            <View />
          )}
          {step < 2 ? (
            <Button title="Next" onPress={handleNext} />
          ) : (
            <Button title="Finish Onboarding" onPress={handleSubmit} disabled={loading?true:false}/>
          )}
        </View>
    </View>
    </ScrollView>
  );
}
