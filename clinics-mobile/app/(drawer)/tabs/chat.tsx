import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
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
import { getClinicConnections } from '../../../lib/utils';
import { useRouter } from 'expo-router';
import { 
  MessageSquare, 
  Search, 
  CheckCircle,
  Stethoscope,
  ArrowRight,
  Bell,
} from 'lucide-react-native';

interface Connection {
  doctor: {
    id: string;
    fullName: string;
    specialization: string;
    profileImage: { docUrl: string } | null;
  };
  patients?: {
    id: string;
    name: string;
    lastMessage?: {
      content: string;
      timestamp: string;
      read: boolean;
    };
    status: 'ACTIVE' | 'COMPLETED';
  }[];
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <LinearGradient
          colors={['#2563EB', '#06B6D4']}
          style={{ 
            paddingHorizontal: 20, 
            paddingTop: 20, 
            paddingBottom: 30,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>
                Messages
              </Text>
              <Text style={{ fontSize: 16, color: '#bfdbfe' }}>
                Chat with your connected doctors and patients
              </Text>
            </View>
            <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8 }}>
              <Bell size={20} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={{ padding: 20, paddingTop: 30 }}>
          {/* Search Bar */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}>
              <Search size={20} color="#9ca3af" />
              <TextInput
                placeholder="Search doctors or conversations..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                style={{ flex: 1, marginLeft: 12, fontSize: 16, color: '#111827' }}
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Connections List */}
          {filteredConnections.length > 0 ? (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
                Connected Doctors ({filteredConnections.length})
              </Text>
              
              {filteredConnections.map((item) => (
                <TouchableOpacity
                  key={item.doctor.id}
                  onPress={() => handleOpenChat(item.doctor)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: '#3b82f6',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                    }}>
                      {item.doctor.profileImage?.docUrl ? (
                        <Image
                          source={{ uri: item.doctor.profileImage.docUrl }}
                          style={{ width: 56, height: 56, borderRadius: 28 }}
                        />
                      ) : (
                        <Stethoscope size={24} color="white" />
                      )}
                    </View>
                    
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 }}>
                        Dr. {item.doctor.fullName}
                      </Text>
                      <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
                        {item.doctor.specialization.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <CheckCircle size={12} color="#2563EB" />
                <Text style={{ fontSize: 12, color: '#2563EB', marginLeft: 4 }}>
                          Connected
                        </Text>
                      </View>
                    </View>

                    <ArrowRight size={20} color="#9ca3af" />
                  </View>

                  {/* Show patient list if available */}
                  {item.patients && item.patients.length > 0 && (
                    <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                        Recent Patients:
                      </Text>
                      {item.patients.slice(0, 2).map((patient) => (
                        <TouchableOpacity
                          key={patient.id}
                          onPress={() => router.push(`/chat/${patient.id}`)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#f8fafc',
                            borderRadius: 8,
                            padding: 8,
                            marginBottom: 4,
                          }}
                        >
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: patient.status === 'ACTIVE' ? '#2563EB' : '#6b7280', marginRight: 8 }} />
                          <Text style={{ flex: 1, fontSize: 14, color: '#374151' }}>
                            {patient.name}
                          </Text>
                          {patient.lastMessage && !patient.lastMessage.read && (
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6' }} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 32,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#f3f4f6',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
                <MessageSquare size={32} color="#9ca3af" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>
                No Conversations Yet
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 }}>
                Connect with doctors to start chatting about patient care
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(drawer)/search-doctors')}
                style={{
                  backgroundColor: '#3b82f6',
                  borderRadius: 12,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                  Find Doctors
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}