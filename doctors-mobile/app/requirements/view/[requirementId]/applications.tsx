import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { axiosInstance } from '../../../../lib/axios';
import { UserCircle } from 'lucide-react-native';

interface Pitch {
  id: string;
  doctor: {
    id: string;
    fullName: string;
    profileImage: { docUrl: string } | null;
  };
  status: string;
}

export default function RequirementApplicationsScreen() {
  const { requirementId } = useLocalSearchParams();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPitches = async () => {
      if (typeof requirementId === 'string') {
        try {
          const response = await axiosInstance.get(`/api/clinic/get-pitches/${requirementId}`);
          setPitches(response.data.pitches);
        } catch (error) {
          console.error('Error fetching pitches:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPitches();
  }, [requirementId]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <FlatList
      data={pitches}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={<Text style={{ fontSize: 28, fontWeight: 'bold', padding: 16 }}>Applications</Text>}
      renderItem={({ item }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
          {item.doctor.profileImage ? (
            <Image source={{ uri: item.doctor.profileImage.docUrl }} style={{ width: 50, height: 50, borderRadius: 25 }} />
          ) : (
            <UserCircle size={50} color="gray" />
          )}
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.doctor.fullName}</Text>
            <Text style={{ color: 'gray' }}>{item.status}</Text>
          </View>
        </View>
      )}
    />
  );
} 