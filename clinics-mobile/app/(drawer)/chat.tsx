import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { getClinicConnections } from '../../lib/utils';
import { useRouter } from 'expo-router';
import { UserCircle } from 'lucide-react-native';

interface Connection {
  doctor: {
    id: string;
    fullName: string;
    specialization: string;
    profileImage: { docUrl: string } | null;
  };
}

export default function ChatScreen() {
  const { user } = useUser();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchConnections = async () => {
      if (user?.id) {
        try {
          const data = await getClinicConnections(user.id);
          setConnections(data.connections);
        } catch (error) {
          console.error("Error fetching connections:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchConnections();
  }, [user]);

  const handleOpenChat = (doctor: any) => {
    router.push(`/chat/patients/${doctor.id}`);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading chats...</Text>
      </View>
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