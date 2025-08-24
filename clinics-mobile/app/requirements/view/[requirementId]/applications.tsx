import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { axiosInstance } from '../../../../lib/axios';
import { UserCircle, ArrowLeft, Calendar, MapPin } from 'lucide-react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';

interface Pitch {
  id: string;
  doctor: {
    id: string;
    fullName: string;
    profileImage: { docUrl: string } | null;
  };
  status: string;
}

const { width } = Dimensions.get('window');

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return '#f59e0b';
    case 'accepted':
      return '#10b981';
    case 'rejected':
      return '#ef4444';
    case 'reviewed':
      return '#3b82f6';
    default:
      return '#6b7280';
  }
};

const getStatusBackground = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return '#fef3c7';
    case 'accepted':
      return '#d1fae5';
    case 'rejected':
      return '#fee2e2';
    case 'reviewed':
      return '#dbeafe';
    default:
      return '#f3f4f6';
  }
};

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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading applications...</Text>
      </View>
    );
  }

  const renderApplicationCard = ({ item }: { item: Pitch }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.profileSection}>
            {item.doctor.profileImage ? (
              <Image 
                source={{ uri: item.doctor.profileImage.docUrl }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.profilePlaceholder}>
                <UserCircle size={40} color="#9ca3af" />
              </View>
            )}
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{item.doctor.fullName}</Text>
              <Text style={styles.doctorSubtitle}>Medical Professional</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBackground(item.status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Calendar size={16} color="#6b7280" />
            <Text style={styles.infoText}>Applied recently</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={16} color="#6b7280" />
            <Text style={styles.infoText}>Available for consultation</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
            <Text style={styles.primaryButtonText}>Review Application</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
            options={
                {
                    headerTitle: "Applications",
                    headerStyle: {
                      backgroundColor: "#2563EB"
                    },
                    headerTitleStyle: {
                      color: "white"
                    }
                }
            }
        />

      {/* Content */}
      <FlatList
        data={pitches}
        keyExtractor={(item) => item.id}
        renderItem={renderApplicationCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <UserCircle size={80} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Applications Yet</Text>
            <Text style={styles.emptySubtitle}>
              Applications from doctors will appear here once they submit their pitches.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  headerStats: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerStatsText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#e5e7eb',
  },
  profilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#e5e7eb',
  },
  doctorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  doctorSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardContent: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 