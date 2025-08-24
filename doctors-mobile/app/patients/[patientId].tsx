import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function PatientDetailScreen() {
  const { colors } = useTheme();
  const { user } = useUser();
  const { patientId } = useLocalSearchParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!user?.id) return;
      
      try {
        setError(null);
        // For now, we'll fetch all patients and find the specific one
        // In a real app, you'd have a specific endpoint for single patient
        const patientsData = await getDoctorPatients(user.id);
        const foundPatient = patientsData.find((p: any) => p.id === patientId);
        
        if (foundPatient) {
          const transformedPatient = {
            id: foundPatient.id,
            name: foundPatient.name,
            age: foundPatient.age || 0,
            gender: foundPatient.gender || 'Other',
            condition: foundPatient.condition || 'General Checkup',
            status: foundPatient.status || 'Active',
            assignedDate: foundPatient.createdAt,
            clinicName: foundPatient.clinic?.clinicName || 'Unknown Clinic',
            urgency: foundPatient.urgency || 'Medium',
            lastUpdate: foundPatient.updatedAt,
            clinic: foundPatient.clinic,
            assignedDoctors: foundPatient.assignedDoctors,
            feedbacks: foundPatient.feedbacks,
            createdAt: foundPatient.createdAt,
            updatedAt: foundPatient.updatedAt,
          };
          setPatient(transformedPatient);
        } else {
          setError('Patient not found');
        }
      } catch (error: any) {
        console.error('Error fetching patient details:', error);
        setError(error.message || 'Failed to fetch patient details');
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load patient details',
        });
      } finally {
        setLoading(false);
      }
    };

    if (patientId && user?.id) {
      fetchPatientDetails();
    }
  }, [patientId, user?.id]);

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

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: '#FFFFFF' }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <ThemedText style={[styles.loadingText, { color: '#6B7280' }]}>
          Loading patient details...
        </ThemedText>
      </View>
    );
  }

  if (error || !patient) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: '#FFFFFF' }]}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <ThemedText style={[styles.errorTitle, { color: '#111827' }]}>
          {error || 'Patient not found'}
        </ThemedText>
        <Button
          title="Go Back"
          size="small"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#F9FAFB' }]}>
      <View style={[styles.header, { backgroundColor: '#FFFFFF' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: '#111827' }]}>
          Patient Details
        </ThemedText>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push(`/patients/edit/${patient.id}` as any)}
          >
            <Ionicons name="create-outline" size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Basic Info */}
        <View style={[styles.section, { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }]}>
          <ThemedText style={[styles.sectionTitle, { color: '#111827' }]}>
            Basic Information
          </ThemedText>
          
          <View style={styles.infoRow}>
            <ThemedText style={[styles.infoLabel, { color: '#6B7280' }]}>Name:</ThemedText>
            <ThemedText style={[styles.infoValue, { color: '#111827' }]}>{patient.name}</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <ThemedText style={[styles.infoLabel, { color: '#6B7280' }]}>Age:</ThemedText>
            <ThemedText style={[styles.infoValue, { color: '#111827' }]}>{patient.age} years</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <ThemedText style={[styles.infoLabel, { color: '#6B7280' }]}>Gender:</ThemedText>
            <ThemedText style={[styles.infoValue, { color: '#111827' }]}>{patient.gender}</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <ThemedText style={[styles.infoLabel, { color: '#6B7280' }]}>Condition:</ThemedText>
            <ThemedText style={[styles.infoValue, { color: '#111827' }]}>{patient.condition}</ThemedText>
          </View>
        </View>

        {/* Status and Urgency */}
        <View style={[styles.section, { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }]}>
          <ThemedText style={[styles.sectionTitle, { color: '#111827' }]}>
            Status & Priority
          </ThemedText>
          
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(patient.status) + '15' }]}>
              <ThemedText style={[styles.statusText, { color: getStatusColor(patient.status) }]}>
                {patient.status}
              </ThemedText>
            </View>
            
            <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(patient.urgency) + '15' }]}>
              <ThemedText style={[styles.urgencyText, { color: getUrgencyColor(patient.urgency) }]}>
                {patient.urgency} Priority
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Clinic Information */}
        <View style={[styles.section, { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }]}>
          <ThemedText style={[styles.sectionTitle, { color: '#111827' }]}>
            Clinic Information
          </ThemedText>
          
          <View style={styles.infoRow}>
            <ThemedText style={[styles.infoLabel, { color: '#6B7280' }]}>Clinic:</ThemedText>
            <ThemedText style={[styles.infoValue, { color: '#111827' }]}>{patient.clinicName}</ThemedText>
          </View>
          
          {patient.clinic?.clinicAddress && (
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: '#6B7280' }]}>Address:</ThemedText>
              <ThemedText style={[styles.infoValue, { color: '#111827' }]}>{patient.clinic.clinicAddress}</ThemedText>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <ThemedText style={[styles.infoLabel, { color: '#6B7280' }]}>Assigned Date:</ThemedText>
            <ThemedText style={[styles.infoValue, { color: '#111827' }]}>
              {patient.assignedDate ? new Date(patient.assignedDate).toLocaleDateString() : 'N/A'}
            </ThemedText>
          </View>
        </View>

        {/* Assigned Doctors */}
        {patient.assignedDoctors && patient.assignedDoctors.length > 0 && (
          <View style={[styles.section, { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }]}>
            <ThemedText style={[styles.sectionTitle, { color: '#111827' }]}>
              Assigned Doctors
            </ThemedText>
            
            {patient.assignedDoctors.map((doctor, index) => (
              <View key={doctor.id} style={styles.doctorRow}>
                <View style={styles.doctorInfo}>
                  <ThemedText style={[styles.doctorName, { color: '#111827' }]}>{doctor.fullName}</ThemedText>
                  <ThemedText style={[styles.doctorSpecialization, { color: '#6B7280' }]}>{doctor.specialization}</ThemedText>
                </View>
                <TouchableOpacity 
                  style={styles.chatButton}
                  onPress={() => router.push(`/chat/${patient.id}?doctorId=${doctor.id}` as any)}
                >
                  <Ionicons name="chatbubble-outline" size={20} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Recent Feedback */}
        {patient.feedbacks && patient.feedbacks.length > 0 && (
          <View style={[styles.section, { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }]}>
            <ThemedText style={[styles.sectionTitle, { color: '#111827' }]}>
              Recent Feedback
            </ThemedText>
            
            {patient.feedbacks.slice(0, 3).map((feedback, index) => (
              <View key={feedback.id} style={styles.feedbackRow}>
                <ThemedText style={[styles.feedbackText, { color: '#374151' }]}>{feedback.feedback}</ThemedText>
                <ThemedText style={[styles.feedbackDate, { color: '#9CA3AF' }]}>
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Button
            title="Start Chat"
            size="medium"
            onPress={() => router.push(`/chat/${patient.id}` as any)}
            leftIcon={<Ionicons name="chatbubble-outline" size={20} color="white" />}
            style={styles.actionButton}
          />
          
          <Button
            title="Edit Patient"
            size="medium"
            variant="outline"
            onPress={() => router.push(`/patients/edit/${patient.id}` as any)}
            leftIcon={<Ionicons name="create-outline" size={20} color="#3B82F6" />}
            style={styles.actionButton}
          />
        </View>
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
  errorTitle: {
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 8,
    fontSize: 20,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  doctorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  doctorSpecialization: {
    fontSize: 14,
  },
  chatButton: {
    padding: 8,
  },
  feedbackRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  feedbackText: {
    marginBottom: 4,
    lineHeight: 20,
    fontSize: 14,
  },
  feedbackDate: {
    fontSize: 12,
  },
  actionSection: {
    gap: 12,
    marginTop: 16,
    marginBottom: 32,
  },
}); 