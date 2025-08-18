import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";

import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  FileText,
  Mail,
  MapPin,
  Phone,
  Share2,
} from "lucide-react-native";

import { axiosInstance } from "../../lib/axios";

interface Document {
  id: string;
  name: string;
  docUrl: string;
  type: string;
}

interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
  experience: number;
  profileImage: string | null;
  about: string;
  address: string;
  certifications: string[];
  phoneNumber: string;
  email: string;
  latitude: number;
  longitude: number;
  documents: Document[];
}

export default function DoctorProfile() {
  const { doctorId } = useLocalSearchParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/doctor/get-doctor/${doctorId}`
        );
        setDoctor(response.data.doctor);
      } catch (error) {
        console.log("Error fetching doctor:", error);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text>Loading doctor's profile...</Text>
      </View>
    );
  }

  if (!doctor) {
    return <Text className="text-center py-10">Doctor not found</Text>;
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>

        <View className="bg-white p-6 rounded-lg shadow-md mb-6">
          <View className="items-center">
            <Image
              source={{ uri: doctor.profileImage || undefined }}
              className="w-32 h-32 rounded-full"
            />
            <Text className="text-2xl font-bold mt-4">{doctor.fullName}</Text>
            <Text className="text-lg text-blue-600">
              {doctor.specialization.replace(/_/g, " ")}
            </Text>
            <Text className="text-gray-500">
              {doctor.experience} years of experience
            </Text>
          </View>
        </View>

        <View className="bg-white p-6 rounded-lg shadow-md mb-6">
          <Text className="text-xl font-bold">About</Text>
          <Text className="mt-2 text-gray-700">{doctor.about}</Text>
        </View>

        <View className="bg-white p-6 rounded-lg shadow-md mb-6">
          <Text className="text-xl font-bold">Documents</Text>
          {doctor.documents.length > 0 ? (
            doctor.documents.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                onPress={() => Linking.openURL(doc.docUrl)}
                className="flex-row items-center mt-2"
              >
                <FileText size={24} color="blue" />
                <Text className="ml-2">{doc.name}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text className="text-gray-500 mt-2">No documents available.</Text>
          )}
        </View>

        <View className="bg-white p-6 rounded-lg shadow-md mb-6">
          <Text className="text-xl font-bold">Contact Information</Text>
          <View className="mt-2">
            <View className="flex-row items-center mt-2">
              <Mail size={16} color="gray" />
              <Text className="ml-2">{doctor.email}</Text>
            </View>
            <View className="flex-row items-center mt-2">
              <Phone size={16} color="gray" />
              <Text className="ml-2">{doctor.phoneNumber}</Text>
            </View>
            <View className="flex-row items-center mt-2">
              <MapPin size={16} color="gray" />
              <Text className="ml-2">{doctor.address}</Text>
            </View>
          </View>
        </View>

        <View className="bg-white p-6 rounded-lg shadow-md mb-6">
          <Text className="text-xl font-bold">Certifications & Skills</Text>
          <View className="flex-row flex-wrap mt-2">
            {doctor.certifications.map((cert) => (
              <View
                key={cert}
                className="bg-gray-200 rounded-full px-3 py-1 m-1"
              >
                <Text>{cert}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
} 