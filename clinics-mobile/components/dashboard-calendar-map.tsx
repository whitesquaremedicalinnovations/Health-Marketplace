import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, MapPin, Clock, Expand } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import { axiosInstance } from '@/lib/axios';
import CalendarMap from './calender-map';
import { useTheme } from '@/contexts/ThemeContext';

type Meeting = {
  id: string;
  title: string;
  clinic: string;
  jobDate: string | null;
  jobTime: string | null;
  jobLocation: string;
  jobLatitude: number | null;
  jobLongitude: number | null;
};

export default function DashboardCalendarMap() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const { colors } = useTheme();
  const router = useRouter();

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/api/clinic/get-meetings/${user?.id}`);
      if (response.status === 200) {
        setMeetings(response.data.meetings || []);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMeetings();
    }
  }, [user]);

  // Get today's meetings
  const today = new Date();
  const todayMeetings = meetings.filter(meeting => {
    if (!meeting.jobDate) return false;
    const meetingDate = new Date(meeting.jobDate);
    return meetingDate.toDateString() === today.toDateString();
  });

  // Get upcoming meetings (next 7 days)
  const upcomingMeetings = meetings.filter(meeting => {
    if (!meeting.jobDate) return false;
    const meetingDate = new Date(meeting.jobDate);
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    return meetingDate >= today && meetingDate <= nextWeek;
  });

  const meetingsWithLocation = upcomingMeetings.filter(
    meeting => meeting.jobLatitude && meeting.jobLongitude
  );

  const centerLocation = meetingsWithLocation.length > 0 
    ? {
        lat: meetingsWithLocation[0].jobLatitude!,
        lng: meetingsWithLocation[0].jobLongitude!
      }
    : { lat: 40.7128, lng: -74.0060 }; // Default to NYC

  const handleExpandPress = () => {
    router.push('/(drawer)/calendar' as any);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Calendar size={20} color={colors.primary} />
            <Text style={styles.title}>Today's Schedule</Text>
          </View>
          <TouchableOpacity onPress={handleExpandPress} style={styles.expandButton}>
            <Expand size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Calendar size={20} color={colors.primary} />
          <Text style={styles.title}>Today's Schedule</Text>
        </View>
        <TouchableOpacity onPress={handleExpandPress} style={styles.expandButton}>
          <Expand size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Today's Meetings Summary */}
      {todayMeetings.length > 0 ? (
        <View style={styles.meetingsSummary}>
          <Text style={styles.summaryTitle}>
            {todayMeetings.length} meeting{todayMeetings.length !== 1 ? 's' : ''} today
          </Text>
          {todayMeetings.slice(0, 2).map((meeting, index) => (
            <View key={meeting.id} style={styles.meetingItem}>
              <View style={styles.meetingInfo}>
                <Text style={styles.meetingTitle} numberOfLines={1}>
                  {meeting.title}
                </Text>
                <Text style={styles.meetingClinic} numberOfLines={1}>
                  {meeting.clinic}
                </Text>
                <View style={styles.meetingDetails}>
                  {meeting.jobTime && (
                    <View style={styles.detailItem}>
                      <Clock size={12} color="#6b7280" />
                      <Text style={styles.detailText}>{meeting.jobTime}</Text>
                    </View>
                  )}
                  <View style={styles.detailItem}>
                    <MapPin size={12} color="#6b7280" />
                    <Text style={styles.detailText} numberOfLines={1}>
                      {meeting.jobLocation}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
          {todayMeetings.length > 2 && (
            <Text style={styles.moreMeetings}>
              +{todayMeetings.length - 2} more meetings
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.noMeetings}>
          <Text style={styles.noMeetingsText}>No meetings scheduled for today</Text>
          <Text style={styles.noMeetingsSubtext}>You&apos;re all caught up!</Text>
        </View>
      )}

      {/* Map Section */}
      {meetingsWithLocation.length > 0 && (
        <View style={styles.mapContainer}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>Upcoming Locations</Text>
            <Text style={styles.mapSubtitle}>
              {meetingsWithLocation.length} location{meetingsWithLocation.length !== 1 ? 's' : ''} in the next 7 days
            </Text>
          </View>
          <View style={styles.mapWrapper}>
            <CalendarMap
              places={meetingsWithLocation.map(meeting => ({
                lat: meeting.jobLatitude!,
                lng: meeting.jobLongitude!,
                clinicName: meeting.clinic
              }))}
              center={centerLocation}
              zoom={10}
              updateLocation={() => {}}
            />
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          onPress={handleExpandPress}
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
        >
          <Calendar size={16} color="white" />
          <Text style={styles.actionButtonText}>View Full Calendar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  expandButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  meetingsSummary: {
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  meetingItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  meetingClinic: {
    fontSize: 12,
    color: '#3b82f6',
    marginBottom: 6,
  },
  meetingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    color: '#6b7280',
    flex: 1,
  },
  moreMeetings: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  noMeetings: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noMeetingsText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  noMeetingsSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
  mapContainer: {
    marginBottom: 16,
  },
  mapHeader: {
    marginBottom: 12,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  mapSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  mapWrapper: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
}); 