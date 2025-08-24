import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Briefcase, Calendar, Clock, Eye, MapPin, Users } from "lucide-react-native";
import { axiosInstance } from "@/lib/axios";
import Toast from "react-native-toast-message";

interface Requirement {
  id: string;
  title: string;
  description: string;
  type: string;
  specialization: string;
  date: string;
  additionalInformation: string;
  requirementStatus: string;
  location: string;
}

export default function ViewRequirementScreen() {
  const router = useRouter();
  const { requirementId } = useLocalSearchParams();
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequirement = async () => {
      try {
        const response = await axiosInstance.get(`/api/clinic/get-requirement/${requirementId}`);
        setRequirement(response.data.requirement);
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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text>Loading requirement...</Text>
      </View>
    );
  }

  if (!requirement) {
    return (
      <View>
      <Stack.Screen 
              options={
                {
                  headerTitle: "View Requirement",
                  headerStyle: {
                    backgroundColor: "#2563EB"
                  },
                  headerTitleStyle: {
                    color: "white"
                  }
                }
              }
              />
        <View className="flex-1 justify-center items-center">
          <Text>Requirement not found</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <Stack.Screen 
            options={
                {
                    headerTitle: "View Requirement",
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
        
        <View className="bg-indigo-600 rounded-xl p-6 shadow-lg mb-6">
          <Text className="text-3xl font-bold text-white">{requirement.title}</Text>
          <View className="flex-row items-center mt-2">
            <Text className="text-white bg-white/20 px-2 py-1 rounded-full">{requirement.type}</Text>
            <Text className={`ml-2 px-2 py-1 rounded-full ${requirement.requirementStatus === 'POSTED' ? 'bg-green-400/20 text-green-100' : 'bg-blue-400/20 text-blue-100'}`}>{requirement.requirementStatus}</Text>
          </View>
        </View>

        <View className="bg-white p-6 rounded-lg shadow-md mb-6">
          <Text className="text-xl font-bold">Job Description</Text>
          <Text className="mt-2 text-gray-700">{requirement.description}</Text>
        </View>

        <View className="bg-white p-6 rounded-lg shadow-md mb-6">
          <Text className="text-xl font-bold">Required Specialization</Text>
          <Text className="mt-2 text-gray-700">{requirement.specialization}</Text>
        </View>

        <View className="bg-white p-6 rounded-lg shadow-md mb-6">
          <Text className="text-xl font-bold">Additional Details</Text>
          <Text className="mt-2 text-gray-700">{requirement.additionalInformation}</Text>
        </View>

        <TouchableOpacity 
          onPress={() => router.push(`/requirements/view/${requirementId}/applications`)}
          className="bg-indigo-600 p-3 rounded-md mt-4"
        >
          <Text className="text-white text-center font-bold">View Applications</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => router.push(`/requirements/edit/${requirementId}`)}
          className="bg-gray-200 p-3 rounded-md mt-4"
        >
          <Text className="text-black text-center font-bold">Edit Requirement</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 