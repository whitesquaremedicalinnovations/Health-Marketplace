import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useEffect, useState } from "react";

import { useUser } from "@clerk/clerk-expo";
import { Stack, useRouter } from "expo-router";
import {
  Briefcase,
  Clock,
  Users,
  Building,
  Star,
  MapPin,
  Phone,
  Plus,
  Search,
  Filter,
} from "lucide-react-native";

import { getDoctorConnections } from "../../lib/utils";

// Dynamic interface that supports both doctor and clinic connections
interface DoctorConnection {
  id: string;
  connectedAt: string;
  clinic: {
    id: string;
    clinicName: string;
    clinicAddress: string;
    clinicPhoneNumber: string;
    profileImage: string | null;
  };
  job: {
    id: string;
    title: string;
    description: string;
    type: string;
    specialization: string;
    location: string;
    additionalInformation: string | null;
    createdAt: string;
  };
}

interface ClinicConnection {
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

type Connection = DoctorConnection | ClinicConnection;

export default function ConnectionsScreen() {
  const { user } = useUser();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userType, setUserType] = useState<'doctor' | 'clinic'>('doctor');
  const router = useRouter();

  const fetchConnections = useCallback(async () => {
    if (user?.id) {
      try {
        // For now, we'll assume this is a doctor app, but this could be made dynamic
        // based on user metadata or app context
        const data = await getDoctorConnections(user.id);
        setConnections(data.connections || []);
        setUserType('doctor');
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
      return { label: "Strong", color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" };
    if (count >= 3)
      return { label: "Good", color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" };
    return { label: "New", color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" };
  };

  const formatJobType = (type: string) => {
    switch (type) {
      case 'FULLTIME': return 'Full-time';
      case 'PARTTIME': return 'Part-time';
      case 'ONETIME': return 'One-time';
      default: return type;
    }
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'FULLTIME': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'PARTTIME': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ONETIME': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getConnectionDuration = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day";
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months`;
    return `${Math.ceil(diffDays / 365)} years`;
  };

  const renderDoctorConnection = (connection: DoctorConnection) => (
    <TouchableOpacity
      onPress={() =>
        router.push(`/doctors/${connection.clinic.id}?from=connections`)
      }
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="flex-row items-start">
        <View className="relative">
          {connection.clinic.profileImage ? (
            <Image
              source={{ uri: connection.clinic.profileImage }}
              className="w-16 h-16 rounded-xl"
            />
          ) : (
            <View className="w-16 h-16 rounded-xl bg-gray-100 items-center justify-center border border-gray-200">
              <Building size={24} color="#6b7280" />
            </View>
          )}
          <View className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${getJobTypeColor(connection.job.type)} items-center justify-center border border-white`}>
            <Star size={10} color="#059669" />
          </View>
        </View>
        
        <View className="ml-3 flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-bold text-gray-900 flex-1 mr-2">
              {connection.clinic.clinicName}
            </Text>
            <View className={`px-2 py-1 rounded-full border ${getJobTypeColor(connection.job.type)}`}>
              <Text className="text-xs font-semibold">{formatJobType(connection.job.type)}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center mb-1">
            <MapPin size={12} color="#6b7280" />
            <Text className="text-gray-600 text-sm ml-1 flex-1">
              {connection.clinic.clinicAddress}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Phone size={12} color="#6b7280" />
            <Text className="text-gray-600 text-sm ml-1">
              {connection.clinic.clinicPhoneNumber}
            </Text>
          </View>
        </View>
      </View>
      
      <View className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <Text className="font-bold text-gray-900 text-base mb-1">{connection.job.title}</Text>
        <Text className="text-gray-700 text-sm">{connection.job.specialization}</Text>
        <Text className="text-gray-600 text-xs">{connection.job.location}</Text>
      </View>
      
      <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
        <Stat
          icon={<Briefcase size={16} color="#3b82f6" />}
          label="Project"
          value={connection.job.title}
          color="text-blue-600"
        />
        <Stat
          icon={<Clock size={16} color="#10b981" />}
          label="Connected"
          value={getConnectionDuration(connection.connectedAt)}
          color="text-emerald-600"
        />
      </View>
    </TouchableOpacity>
  );

  const renderClinicConnection = (connection: ClinicConnection) => (
    <TouchableOpacity
      onPress={() =>
        router.push(`/doctors/${connection.doctor.id}?from=connections`)
      }
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="flex-row items-start">
        <View className="relative">
          {connection.doctor.profileImage ? (
            <Image
              source={{ uri: connection.doctor.profileImage.docUrl }}
              className="w-16 h-16 rounded-xl"
            />
          ) : (
            <View className="w-16 h-16 rounded-xl bg-gray-100 items-center justify-center border border-gray-200">
              <Users size={24} color="#6b7280" />
            </View>
          )}
          <View className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${getConnectionStrength(connection.connectionCount).bgColor} items-center justify-center border border-white ${getConnectionStrength(connection.connectionCount).borderColor}`}>
            <Star size={10} color="#059669" />
          </View>
        </View>
        
        <View className="ml-3 flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-bold text-gray-900 flex-1 mr-2">
              {connection.doctor.fullName}
            </Text>
            <View className={`px-2 py-1 rounded-full border ${getConnectionStrength(connection.connectionCount).bgColor} ${getConnectionStrength(connection.connectionCount).borderColor}`}>
              <Text className={`text-xs font-semibold ${getConnectionStrength(connection.connectionCount).color}`}>
                {getConnectionStrength(connection.connectionCount).label}
              </Text>
            </View>
          </View>
          
          <Text className="text-emerald-600 font-semibold text-sm mb-1">
            {connection.doctor.specialization}
          </Text>
          
          <View className="flex-row items-center">
            <Clock size={12} color="#6b7280" />
            <Text className="text-gray-600 text-sm ml-1">
              {connection.doctor.experience} years experience
            </Text>
          </View>
        </View>
      </View>
      
      <View className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <Text className="font-bold text-gray-900 text-base mb-1">Collaboration History</Text>
        <Text className="text-gray-700 text-sm">
          {connection.connectionCount} successful projects together
        </Text>
        <Text className="text-gray-600 text-xs">
          Latest: {getConnectionDuration(connection.latestConnection)} ago
        </Text>
      </View>
      
      <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
        <Stat
          icon={<Briefcase size={16} color="#3b82f6" />}
          label="Projects"
          value={connection.connectionCount}
          color="text-blue-600"
        />
        <Stat
          icon={<Clock size={16} color="#10b981" />}
          label="Experience"
          value={`${connection.doctor.experience}y`}
          color="text-emerald-600"
        />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mx-4">
          <ActivityIndicator size="large" color="#6b7280" />
          <Text className="text-gray-700 mt-4 text-center font-medium">Loading your connections...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={connections}
        keyExtractor={(item) => 'id' in item ? item.id : item.doctor.id}
        ListHeaderComponent={
          <View className="p-4">
            {/* Compact Header Section */}
            <View className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-4">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center">
                  <Users size={20} color="#3b82f6" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-xl font-bold text-gray-900">
                    Professional Connections
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {userType === 'doctor' 
                      ? 'Manage your clinic network and track your collaborations' 
                      : 'Manage your healthcare professional network and partnerships'
                    }
                  </Text>
                </View>
              </View>
              
              {/* Compact Stats */}
              <View className="flex-row space-x-3">
                <View className="flex-1 bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <View className="flex-row items-center justify-center">
                    <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-2">
                      <Users size={12} color="#ffffff" />
                    </View>
                    <View>
                      <Text className="text-lg font-bold text-blue-900">{connections.length}</Text>
                      <Text className="text-blue-700 text-xs font-medium">
                        {connections.length === 1 ? 'Connection' : 'Connections'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Compact Search Bar */}
              <View className="flex-row space-x-2 mt-3">
                <View className="flex-1 bg-gray-50 rounded-lg border border-gray-200 flex-row items-center px-3 py-2">
                  <Search size={16} color="#6b7280" />
                  <Text className="text-gray-500 ml-2 text-sm">Search connections...</Text>
                </View>
              </View>
            </View>

            {connections.length === 0 ? (
              <View className="items-center justify-center mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4 border border-gray-200">
                  <Users size={32} color="#9ca3af" />
                </View>
                <Text className="text-xl font-bold text-gray-900 mb-2 text-center">No Connections Yet</Text>
                <Text className="text-gray-600 text-center text-sm leading-5 mb-6 px-4">
                  {userType === 'doctor' 
                    ? 'Start by applying to job requirements and building your professional network.'
                    : 'Start by posting a requirement and connecting with healthcare professionals.'
                  }
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/create-requirement")}
                  className="bg-gray-900 px-6 py-3 rounded-lg shadow-sm border border-gray-200"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <View className="flex-row items-center">
                    <Plus size={16} color="#ffffff" />
                    <Text className="text-white font-bold text-base ml-2">
                      {userType === 'doctor' ? 'Browse Requirements' : 'Post Requirement'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View />
            )}
          </View>
        }
        renderItem={({ item }) => {
          // Type guard to determine if it's a doctor or clinic connection
          if ('clinic' in item) {
            return renderDoctorConnection(item as DoctorConnection);
          } else {
            return renderClinicConnection(item as ClinicConnection);
          }
        }}
        ListEmptyComponent={
          <View className="items-center justify-center mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100 mx-4">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4 border border-gray-200">
              <Users size={32} color="#9ca3af" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2 text-center">No Connections Yet</Text>
            <Text className="text-gray-600 text-center text-sm leading-5 mb-6 px-4">
              {userType === 'doctor' 
                ? 'Start by applying to job requirements and building your professional network.'
                : 'Start by posting a requirement and connecting with healthcare professionals.'
              }
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/create-requirement")}
              className="bg-gray-900 px-6 py-3 rounded-lg shadow-sm border border-gray-200"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center">
                <Plus size={16} color="#ffffff" />
                <Text className="text-white font-bold text-base ml-2">
                  {userType === 'doctor' ? 'Browse Requirements' : 'Post Requirement'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#6b7280", "#374151"]}
            tintColor="#6b7280"
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

function Stat({
  icon,
  label,
  value,
  color = "text-gray-700",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <View className="items-center flex-1">
      <View className="w-8 h-8 bg-gray-50 rounded-lg items-center justify-center mb-2 border border-gray-100">
        {icon}
      </View>
      <Text className={`font-bold text-sm ${color}`}>{value}</Text>
      <Text className="text-gray-500 text-xs font-medium">{label}</Text>
    </View>
  );
} 