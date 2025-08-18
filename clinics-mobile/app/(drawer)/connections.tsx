import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useEffect, useState } from "react";

import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  Briefcase,
  Clock,
  Users,
} from "lucide-react-native";

import { getClinicConnections } from "../../lib/utils";

interface Connection {
  doctor: {
    id: string;
    fullName: string;
    specialization: string;
    experience: number;
    profileImage: { docUrl: string } | null;
  };
  acceptedPitches: {
    id: string;
    jobRequirement: {
      id: string;
      title: string;
      type: string;
      createdAt: string;
    };
    createdAt: string;
  }[];
  connectionCount: number;
  latestConnection: string;
}

export default function ConnectionsScreen() {
  const { user } = useUser();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchConnections = useCallback(async () => {
    if (user?.id) {
      try {
        const data = await getClinicConnections(user.id);
        setConnections(data.connections);
      } catch (error) {
        console.error("Error fetching connections:", error);
      }
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchConnections().finally(() => setLoading(false));
  }, [fetchConnections]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConnections().finally(() => setRefreshing(false));
  }, [fetchConnections]);

  const getConnectionStrength = (count: number) => {
    if (count >= 5)
      return { label: "Strong", color: "text-green-600", bgColor: "bg-green-100" };
    if (count >= 3)
      return { label: "Good", color: "text-blue-600", bgColor: "bg-blue-100" };
    return { label: "New", color: "text-gray-600", bgColor: "bg-gray-100" };
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text>Loading connections...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={connections}
      keyExtractor={(item) => item.doctor.id}
      ListHeaderComponent={
        <View className="p-4">
          <View className="bg-purple-600 rounded-xl p-6 shadow-lg mb-6">
            <View className="flex-row items-center mb-4">
              <Users size={24} color="white" />
              <Text className="text-2xl font-bold text-white ml-3">
                Professional Connections
              </Text>
            </View>
            <Text className="text-white opacity-80 mt-1">
              Manage your healthcare professional network
            </Text>
          </View>

          {connections.length === 0 ? (
            <View className="items-center justify-center mt-16">
              <Users size={64} color="#d1d5db" />
              <Text className="text-xl font-bold mt-4">No Connections Yet</Text>
              <Text className="text-gray-500 mt-2 text-center">
                Start by posting a requirement and accepting pitches.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/create-requirement")}
                className="bg-purple-600 px-6 py-3 rounded-full mt-6"
              >
                <Text className="text-white font-semibold">Post Requirement</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View />
          )}
        </View>
      }
      renderItem={({ item }) => {
        const strength = getConnectionStrength(item.connectionCount);
        return (
          <TouchableOpacity
            onPress={() =>
              router.push(`/doctors/${item.doctor.id}?from=connections`)
            }
            className="bg-white rounded-lg p-4 mb-4 shadow-md"
          >
            <View className="flex-row items-center">
              {item.doctor.profileImage ? (
                <Image
                  source={{ uri: item.doctor.profileImage.docUrl }}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <Users size={64} color="gray" />
              )}
              <View className="ml-4 flex-1">
                <Text className="text-lg font-bold">
                  {item.doctor.fullName}
                </Text>
                <Text className="text-purple-600">
                  {item.doctor.specialization}
                </Text>
              </View>
              <View
                className={`px-2 py-1 rounded-full ${strength.bgColor}`}
              >
                <Text className={strength.color}>{strength.label}</Text>
              </View>
            </View>
            <View className="flex-row justify-around mt-4 border-t border-gray-200 pt-2">
              <Stat
                icon={<Briefcase size={20} color="#3b82f6" />}
                label="Projects"
                value={item.connectionCount}
              />
              <Stat
                icon={<Clock size={20} color="#10b981" />}
                label="Experience"
                value={`${item.doctor.experience}y`}
              />
            </View>
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={
        <View className="items-center justify-center mt-16">
          <Users size={64} color="#d1d5db" />
          <Text className="text-xl font-bold mt-4">No Connections Yet</Text>
          <Text className="text-gray-500 mt-2 text-center">
            Start by posting a requirement and accepting pitches.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/create-requirement")}
            className="bg-purple-600 px-6 py-3 rounded-full mt-6"
          >
            <Text className="text-white font-semibold">Post Requirement</Text>
          </TouchableOpacity>
        </View>
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <View className="items-center">
      {icon}
      <Text className="font-bold">{value}</Text>
      <Text className="text-gray-500">{label}</Text>
    </View>
  );
} 