import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useEffect, useState } from "react";

import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Edit3,
  Eye,
  MapPin,
  PlusCircle,
} from "lucide-react-native";
import Toast from "react-native-toast-message";

import { axiosInstance } from "../../../lib/axios";
import { getRequirementsByClinic } from "../../../lib/utils";

interface Requirement {
  id: string;
  title: string;
  type: string;
  requirementStatus: string;
  createdAt: string;
  description?: string;
  specialization?: string;
}

export default function RequirementsScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequirement, setSelectedRequirement] =
    useState<Requirement | null>(null);

  const fetchRequirements = useCallback(async () => {
    if (user?.id) {
      try {
        const fetchedRequirements = await getRequirementsByClinic(user.id);
        setRequirements(fetchedRequirements);
      } catch (error) {
        console.error("Error fetching requirements:", error);
      }
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchRequirements().finally(() => setLoading(false));
  }, [fetchRequirements]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequirements().finally(() => setRefreshing(false));
  }, [fetchRequirements]);


  const handleComplete = async () => {
    if (!selectedRequirement) return;

    try {
      const response = await axiosInstance.patch(
        `/api/clinic/update-requirement/${selectedRequirement.id}`,
        {
          requirementStatus: "COMPLETED",
          clinicId: user?.id,
        }
      );

      if (response.status === 200) {
        setRequirements(
          requirements.map((req) =>
            req.id === selectedRequirement.id
              ? { ...req, requirementStatus: "COMPLETED" }
              : req
          )
        );
        Toast.show({ type: "success", text1: "Requirement completed!" });
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to complete requirement.",
        });
      }
    } catch (error) {
      console.error("Error completing requirement:", error);
      Toast.show({ type: "error", text1: "An error occurred." });
    } finally {
      setModalVisible(false);
      setSelectedRequirement(null);
    }
  };

  const openConfirmationModal = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setModalVisible(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "FULLTIME":
        return <Briefcase className="h-4 w-4 text-blue-600" />;
      case "PARTTIME":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      default:
        return <MapPin className="h-4 w-4 text-blue-600" />;
    }
  };

  const formatSpecialization = (specialization?: string) => {
    if (!specialization) return "General Practice";
    return specialization
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text>Loading requirements...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="p-4">
          <View className="bg-blue-600 rounded-xl p-6 shadow-lg mb-6">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-3xl font-bold text-white">
                  Job Requirements
                </Text>
                <Text className="text-white opacity-80 mt-1">
                  Manage your hiring needs
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/create-requirement")}
                className="bg-white p-3 rounded-full"
              >
                <PlusCircle color="#3b82f6" size={24} />
              </TouchableOpacity>
            </View>
          </View>

          {requirements.length === 0 ? (
            <View className="items-center justify-center mt-16">
              <Briefcase size={64} color="#d1d5db" />
              <Text className="text-xl font-bold mt-4">
                No Requirements Yet
              </Text>
              <Text className="text-gray-500 mt-2 text-center">
                Post your first job requirement to connect with healthcare
                professionals.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/create-requirement")}
                className="bg-blue-600 px-6 py-3 rounded-full mt-6"
              >
                <Text className="text-white font-semibold">
                  Post Requirement
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={requirements}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="bg-white rounded-lg p-4 mb-4 shadow-md">
                  <View className="flex-row items-start">
                    <View className="p-2 bg-blue-100 rounded-lg">
                      {getTypeIcon(item.type)}
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-lg font-bold">{item.title}</Text>
                      <Text className="text-gray-600">
                        {formatSpecialization(item.specialization)}
                      </Text>
                    </View>
                    <Text
                      className={`font-semibold ${
                        item.requirementStatus === "POSTED"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      {item.requirementStatus}
                    </Text>
                  </View>
                  {item.description && (
                    <Text className="text-gray-700 mt-2 line-clamp-2">
                      {item.description}
                    </Text>
                  )}
                  <View className="flex-row items-center mt-4 pt-2 border-t border-gray-200">
                    <Calendar size={14} color="gray" />
                    <Text className="ml-2 text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="flex-row justify-end mt-4">
                    <TouchableOpacity
                      className="p-2"
                      onPress={() =>
                        router.push(`/requirements/view/${item.id}`)
                      }
                    >
                      <Eye size={22} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="p-2"
                      onPress={() =>
                        router.push(`/requirements/edit/${item.id}`)
                      }
                    >
                      <Edit3 size={22} color="orange" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="p-2"
                      onPress={() => openConfirmationModal(item)}
                      disabled={item.requirementStatus === "COMPLETED"}
                    >
                      <CheckCircle
                        size={22}
                        color={
                          item.requirementStatus === "COMPLETED"
                            ? "gray"
                            : "green"
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg w-4/5">
            <Text className="text-lg font-bold">Confirm Completion</Text>
            <Text className="my-2">
              Are you sure you want to mark this requirement as completed?
            </Text>
            <View className="flex-row justify-end mt-4">
              <TouchableOpacity
                className="px-4 py-2"
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-green-600 px-4 py-2 rounded-md ml-2"
                onPress={handleComplete}
              >
                <Text className="text-white">Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
} 