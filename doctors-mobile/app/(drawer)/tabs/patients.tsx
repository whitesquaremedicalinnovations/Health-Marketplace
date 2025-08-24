import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, RefreshControl, StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { getDoctorPatients } from '@/lib/utils';
import Toast from 'react-native-toast-message';

interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  condition?: string;
  status: 'Active' | 'Completed' | 'In Progress';
  assignedDate?: string;
  clinicName?: string;
  urgency?: 'Low' | 'Medium' | 'High';
  lastUpdate?: string;
  clinic?: {
    id: string;
    clinicName: string;
    clinicAddress: string;
  };
  assignedDoctors?: Array<{
    id: string;
    fullName: string;
    specialization: string;
  }>;
  feedbacks?: Array<{
    id: string;
    feedback: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function PatientsScreen() {
  const { colors } = useTheme();
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Completed' | 'In Progress'>('All');
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setError(null);
      const patientsData = await getDoctorPatients(user.id);
      
              // Transform the data to match our interface
        const transformedPatients = patientsData.map((patient: any) => {
          console.log('Raw patient data:', patient);
          console.log('Patient status from API:', patient.status);
          return {
            id: patient.id,
            name: patient.name,
            age: patient.age || 0,
            gender: patient.gender || 'Other',
            condition: patient.condition || 'General Checkup',
            status: patient.status || 'Active',
            assignedDate: patient.createdAt,
            clinicName: patient.clinic?.clinicName || 'Unknown Clinic',
            urgency: patient.urgency || 'Medium',
            lastUpdate: patient.updatedAt,
            clinic: patient.clinic,
            assignedDoctors: patient.assignedDoctors,
            feedbacks: patient.feedbacks,
            createdAt: patient.createdAt,
            updatedAt: patient.updatedAt,
          };
        });
      setPatients(transformedPatients);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      setError(error.message || 'Failed to fetch patients');
      setPatients([]);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load patients',
      });
    }
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPatients();
    setRefreshing(false);
  }, [fetchPatients]);

  useEffect(() => {
    setLoading(true);
    fetchPatients().finally(() => setLoading(false));
  }, [fetchPatients]);

  const filteredPatients = patients.filter(patient => {
    console.log('Filtering patient:', patient.name, 'Status:', patient.status, 'Filter:', filter);
    
    // Normalize status values to handle different formats from API
    const normalizedStatus = patient.status?.toLowerCase().replace(/\s+/g, '') || '';
    const normalizedFilter = filter.toLowerCase().replace(/\s+/g, '');
    
    console.log('Normalized status:', normalizedStatus, 'Normalized filter:', normalizedFilter);
    
    if (filter === 'All') return true;
    
    // Map different possible status values to our expected values
    const statusMapping: { [key: string]: string } = {
      'active': 'active',
      'inprogress': 'inprogress',
      'in_progress': 'inprogress',
      'in progress': 'inprogress',
      'completed': 'completed',
      'done': 'completed',
      'finished': 'completed',
    };
    
    const mappedStatus = statusMapping[normalizedStatus] || normalizedStatus;
    const result = mappedStatus === normalizedFilter;
    console.log('Mapped status:', mappedStatus, 'Result:', result);
    
    return result;
  });

  console.log('Filtered patients count:', filteredPatients.length, 'Total patients:', patients.length);

  const getStatusColor = (status: Patient['status']) => {
    switch (status) {
      case 'Active':
        return '#10B981'; // Green
      case 'In Progress':
        return '#F59E0B'; // Amber
      case 'Completed':
        return '#3B82F6'; // Blue
      default:
        return '#6B7280'; // Gray
    }
  };

  const getUrgencyColor = (urgency: Patient['urgency']) => {
    switch (urgency) {
      case 'High':
        return '#EF4444'; // Red
      case 'Medium':
        return '#F59E0B'; // Amber
      case 'Low':
        return '#10B981'; // Green
      default:
        return '#6B7280'; // Gray
    }
  };

  const PatientCard = ({ patient }: { patient: Patient }) => (
    <TouchableOpacity
      style={[styles.patientCard, { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }]}
      onPress={() => router.push(`/patients/${patient.id}` as any)}
    >
      <View style={styles.patientHeader}>
        <View style={styles.patientInfo}>
          <ThemedText type="defaultSemiBold" style={[styles.patientName, { color: '#111827' }]}>
            {patient.name}
          </ThemedText>
          <ThemedText style={[styles.patientDetails, { color: '#6B7280' }]}>
            {patient.age} years • {patient.gender}
          </ThemedText>
        </View>
        <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(patient.urgency) + '15' }]}>
          <ThemedText style={[styles.urgencyText, { color: getUrgencyColor(patient.urgency) }]}>
            {patient.urgency}
          </ThemedText>
        </View>
      </View>

      <View style={styles.patientCondition}>
        <Ionicons name="medical-outline" size={16} color="#6B7280" />
        <ThemedText style={[styles.conditionText, { color: '#374151' }]}>
          {patient.condition}
        </ThemedText>
      </View>

      <View style={styles.patientMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="business-outline" size={14} color="#9CA3AF" />
          <ThemedText style={[styles.metaText, { color: '#6B7280' }]}>
            {patient.clinicName}
          </ThemedText>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
          <ThemedText style={[styles.metaText, { color: '#6B7280' }]}>
            {patient.assignedDate ? new Date(patient.assignedDate).toLocaleDateString() : 'N/A'}
          </ThemedText>
        </View>
      </View>

      <View style={styles.patientFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(patient.status) + '15' }]}>
          <ThemedText style={[styles.statusText, { color: getStatusColor(patient.status) }]}>
            {patient.status}
          </ThemedText>
        </View>
        <ThemedText style={[styles.lastUpdate, { color: '#9CA3AF' }]}>
          Updated {patient.lastUpdate ? new Date(patient.lastUpdate).toLocaleDateString() : 'N/A'}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  const FilterButton = ({ 
    title, 
    isActive,
    filterType
  }: { 
    title: string; 
    isActive: boolean;
    filterType: typeof filter;
  }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        { borderColor: isActive ? '#3B82F6' : '#E5E7EB' },
        isActive && { backgroundColor: '#3B82F6' }
      ]}
      onPress={() => {
        console.log('Filter button pressed:', filterType);
        setFilter(filterType);
      }}
      activeOpacity={0.7}
    >
      <ThemedText
        style={[
          styles.filterText,
          { color: isActive ? '#FFFFFF' : '#374151' }
        ]}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: '#FFFFFF' }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <ThemedText style={[styles.loadingText, { color: '#6B7280' }]}>
          Loading patients...
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#F9FAFB' }]}>
      <View style={[styles.header, { backgroundColor: '#FFFFFF' }]}>
        <ThemedText style={[styles.headerTitle, { color: '#111827' }]}>
          My Patients
        </ThemedText>
      </View>

      <View style={styles.filterContainer}>
        {(['All', 'Active', 'In Progress', 'Completed'] as const).map((filterOption) => {
          const count = filterOption === 'All' 
            ? patients.length 
            : patients.filter(p => {
              const normalizedStatus = p.status?.toLowerCase().replace(/\s+/g, '') || '';
              const normalizedFilter = filterOption.toLowerCase().replace(/\s+/g, '');
              
              const statusMapping: { [key: string]: string } = {
                'active': 'active',
                'inprogress': 'inprogress',
                'in_progress': 'inprogress',
                'in progress': 'inprogress',
                'completed': 'completed',
                'done': 'completed',
                'finished': 'completed',
              };
              
              const mappedStatus = statusMapping[normalizedStatus] || normalizedStatus;
              return mappedStatus === normalizedFilter;
            }).length;
          
          return (
            <FilterButton
              key={filterOption}
              title={`${filterOption} (${count})`}
              isActive={filter === filterOption}
              filterType={filterOption}
            />
          );
        })}
      </View>

      <ScrollView
        style={styles.patientsList}
        contentContainerStyle={styles.patientsContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error ? (
          <View style={[styles.emptyState, { backgroundColor: '#FFFFFF' }]}>
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <ThemedText style={[styles.emptyTitle, { color: '#111827' }]}>
              Error loading patients
            </ThemedText>
            <ThemedText style={[styles.emptyDescription, { color: '#6B7280' }]}>
              {error}
            </ThemedText>
            <Button
              title="Retry"
              size="small"
              onPress={fetchPatients}
              style={styles.retryButton}
            />
          </View>
        ) : filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: '#FFFFFF' }]}>
            <Ionicons name="medical-outline" size={48} color="#9CA3AF" />
            <ThemedText style={[styles.emptyTitle, { color: '#111827' }]}>
              No patients found
            </ThemedText>
            <ThemedText style={[styles.emptyDescription, { color: '#6B7280' }]}>
              {filter === 'All' 
                ? "You don't have any patients assigned yet."
                : `No patients with ${filter.toLowerCase()} status.`
              }
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', 
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  patientsList: {
    flex: 1,
  },
  patientsContent: {
    padding: 20,
    gap: 16,
  },
  patientCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 14,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  patientCondition: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conditionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  patientMeta: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
  },
  patientFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lastUpdate: {
    fontSize: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    borderRadius: 16,
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyDescription: {
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 14,
  },
  retryButton: {
    marginTop: 16,
  },
});