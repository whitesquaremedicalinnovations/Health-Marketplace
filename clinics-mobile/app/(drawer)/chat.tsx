import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  Image, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@clerk/clerk-expo';
import { getClinicConnections } from '../../lib/utils';
import { useRouter } from 'expo-router';
import { 
  UserCircle, 
  MessageSquare, 
  Search, 
  Users, 
  Clock,
  CheckCircle,
  Stethoscope,
  Calendar,
  ArrowRight,
} from 'lucide-react-native';

interface Connection {
  doctor: {
    id: string;
    fullName: string;
    specialization: string;
    profileImage: { docUrl: string } | null;
  };
  patients?: Array<{
    id: string;
    name: string;
    lastMessage?: {
      content: string;
      timestamp: string;
      read: boolean;
    };
    status: 'ACTIVE' | 'COMPLETED';
  }>;
}

export default function ChatScreen() {
  const { user } = useUser();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const fetchConnections = useCallback(async () => {
    if (user?.id) {
      try {
        const data = await getClinicConnections(user.id);
        setConnections(data.connections || []);
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

  const handleOpenChat = (doctor: any, patient?: any) => {
    if (patient) {
      router.push(`/chat/${patient.id}`);
    } else {
      router.push(`/chat/patients/${doctor.id}`);
    }
  };

  const filteredConnections = connections.filter(connection =>
    searchTerm === '' || 
    connection.doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 16 }}>
            Loading conversations...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <FlatList
      data={connections}
      keyExtractor={(item) => item.doctor.id}
      ListHeaderComponent={
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold' }}>Select a Doctor</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}
          onPress={() => handleOpenChat(item.doctor)}
        >
          {item.doctor.profileImage ? (
            <Image source={{ uri: item.doctor.profileImage.docUrl }} style={{ width: 50, height: 50, borderRadius: 25 }} />
          ) : (
            <UserCircle size={50} color="gray" />
          )}
          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.doctor.fullName}</Text>
            <Text style={{ color: 'gray' }}>{item.doctor.specialization}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}