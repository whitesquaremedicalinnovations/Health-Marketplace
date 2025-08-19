import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { axiosInstance } from '../../../lib/axios';
import { UserCircle, Search, MessageCircle, ChevronRight } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';

interface Patient {
  id: string;
  name: string;
}

export default function PatientListScreen() {
  const { doctorId } = useLocalSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const fetchPatients = async () => {
      if (user?.id) {
        try {
          const response = await axiosInstance.get(`/api/patient/get-clinic-patients/${user.id}`);
          const filteredPatients = response.data.data.filter((patient: any) => 
            patient.assignedDoctors.some((doctor: any) => doctor.id === doctorId)
          );
          setPatients(filteredPatients);
          setFilteredPatients(filteredPatients);
          setDoctor(filteredPatients[0]?.assignedDoctors.find((doctor: any) => doctor.id === doctorId));
        } catch (error) {
          console.error("Error fetching patients:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPatients();
  }, [user, doctorId]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  const handlePatientSelect = (patient: Patient) => {
    router.push(`/chat/${patient.id}?doctorId=${doctorId}`);
  };

  const renderPatientCard = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={styles.patientCard}
      onPress={() => handlePatientSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.patientInfo}>
        <View style={styles.avatarContainer}>
          <UserCircle size={48} color="#2563EB" />
        </View>
        <View style={styles.patientDetails}>
          <Text style={styles.patientName}>{item.name}</Text>
          <Text style={styles.patientSubtext}>Tap to start chat</Text>
        </View>
      </View>
      <View style={styles.actionContainer}>
        <MessageCircle size={20} color="#6B7280" />
        <ChevronRight size={20} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <UserCircle size={64} color="#9CA3AF" />
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No patients found' : 'No patients assigned'}
      </Text>
      <Text style={styles.emptyStateSubtext}>
        {searchQuery 
          ? 'Try adjusting your search terms'
          : 'Patients will appear here once assigned to this doctor'
        }
      </Text>
    </View>
  );

  if (loading) {
    return (
      <>
        <StatusBar style="light" />
        <Stack.Screen
          options={{
            title: `Chat with Dr. ${doctor?.fullName || 'Doctor'}`,
            headerStyle: {
              backgroundColor: '#2563EB',
            },
            headerTintColor: '#fff',
            headerShadowVisible: false,
            statusBarStyle: 'light',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading patients...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          title: `Chat with Dr. ${doctor?.fullName || 'Doctor'}`,
          headerStyle: {
            backgroundColor: '#2563EB',
          },
          headerTintColor: '#fff',
          headerShadowVisible: false,
          statusBarStyle: 'light',
        }}
      />
      
      <View style={styles.container}>
        {/* Search Section */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search patients..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Select a Patient</Text>
          <Text style={styles.headerSubtitle}>
            {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} available
          </Text>
        </View>

        {/* Patients List */}
        <FlatList
          data={filteredPatients}
          keyExtractor={(item) => item.id}
          renderItem={renderPatientCard}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 8,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 16,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  patientSubtext: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  separator: {
    height: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 24,
  },
}); 