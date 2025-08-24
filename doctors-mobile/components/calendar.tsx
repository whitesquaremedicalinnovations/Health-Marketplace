"use client"

import * as React from "react"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native"
import { Calendar } from "./ui/calendar"
import { Card, CardContent } from "./ui/card"
import { axiosInstance } from "@/lib/axios"
import CalendarMap from "./calender-map"
import { useUser } from "@clerk/clerk-expo"
import { useTheme } from "@/contexts/ThemeContext"

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

type CalendarSize = 'sm' | 'lg';

interface MeetingCalendarProps {
  size?: CalendarSize;
}

const dummymeetings: Meeting[] = [
  { 
    id: "1", 
    title: "Client Meeting", 
    clinic: "City Clinic",
    jobDate: "August 21, 2025",
    jobTime: "10:00 AM",
    jobLocation: "123 Main St, City",
    jobLatitude: 40.7128,
    jobLongitude: -74.0060,
  },
  { 
    id: "2", 
    title: "Team Sync", 
    clinic: "Medical Center",
    jobDate: "August 21, 2025",
    jobTime: "2:00 PM",
    jobLocation: "456 Oak Ave, City",
    jobLatitude: 40.7589,
    jobLongitude: -73.9851,
  },
  { 
    id: "3", 
    title: "Project Review", 
    clinic: "Health Hub",
    jobDate: "August 22, 2025",
    jobTime: "4:00 PM",
    jobLocation: "789 Pine St, City",
    jobLatitude: 40.7505,
    jobLongitude: -73.9934,
  },
  { 
    id: "4", 
    title: "Follow-up Call", 
    clinic: "Wellness Clinic",
    jobDate: "August 23, 2025",
    jobTime: "11:00 AM",
    jobLocation: "321 Elm St, City",
    jobLatitude: 40.7829,
    jobLongitude: -73.9654,
  },
  { 
    id: "5", 
    title: "Consultation", 
    clinic: "Family Medical",
    jobDate: "August 23, 2025",
    jobTime: "3:30 PM",
    jobLocation: "654 Maple Dr, City",
    jobLatitude: 40.7549,
    jobLongitude: -73.9840,
  },
];

export default function MeetingCalendar({ size = 'sm' }: MeetingCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [meetings, setMeetings] = React.useState<Meeting[]>(dummymeetings)
  const { user } = useUser()
  const [isLoading, setIsLoading] = React.useState(false)
  const { colors } = useTheme()

  const fetchMeetings = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get(`/api/doctor/get-meetings/${user?.id}`)
      if (response.status === 200) {
        console.log("meetings", response.data.meetings)
        setMeetings(response.data.meetings)
      }
    } catch (error) {
      console.error("Error fetching meetings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    console.log("user data", user)
    if (user) {
      fetchMeetings()    
    }
  }, [user])

  const meetingsByDate = (date: Date) =>
    meetings.filter(m => {
      if (!m.jobDate) return false;
      const meetingDate = new Date(m.jobDate);
      return meetingDate.toDateString() === date.toDateString();
    })

  const selectedMeetings = selectedDate ? meetingsByDate(selectedDate) : []

  // Custom DayButton component to show meeting indicators and titles
  const CustomDayButton = ({ 
    day, 
    modifiers, 
    style, 
    onPress,
    ...props 
  }: { 
    day: { date: Date }; 
    modifiers: { [key: string]: boolean }; 
    style?: any;
    onPress?: () => void;
  } & any) => {
    const dayMeetings = meetingsByDate(day.date)
    const hasMeetings = dayMeetings.length > 0

    return (
      <TouchableOpacity
        style={[
          styles.customDayButton,
          size === 'lg' ? styles.largeDayButton : styles.smallDayButton,
          hasMeetings 
            ? { backgroundColor: colors.primary + '20' }
            : { backgroundColor: 'transparent' },
          style
        ]}
        onPress={onPress}
        {...props}
      >
        <View style={styles.dayContent}>
          <Text style={[
            styles.dayNumber,
            size === 'lg' ? styles.largeDayNumber : styles.smallDayNumber,
            hasMeetings ? { color: colors.primary } : { color: colors.text }
          ]}>
            {day.date.getDate()}
          </Text>
          
          {hasMeetings && (
            <View style={styles.meetingsContainer}>
              {dayMeetings.length} meetings
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Section: Calendar and Jobs */}
      <View style={styles.topSection}>
        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarCard}>
            <Text style={styles.calendarTitle}>
              {size === 'sm' ? 'Your Schedule' : 'Meeting Calendar'}
            </Text>
            <Calendar
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{
                hasMeetings: (day: Date) => meetingsByDate(day).length > 0,
              }}
              components={{
                DayButton: CustomDayButton,
              }}
            />
          </View>
        </View>

        {/* Meeting List */}
        <View style={styles.meetingListContainer}>
          <View style={styles.meetingListCard}>
            <Text style={styles.meetingListTitle}>
              {selectedDate ? (
                `Appointments On ${selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}`
              ) : (
                "Select a date to view jobs"
              )}
            </Text>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading meetings...</Text>
              </View>
            ) : selectedMeetings.length > 0 ? (
              <ScrollView style={styles.meetingsList} showsVerticalScrollIndicator={false}>
                {selectedMeetings.map(meeting => (
                  <Card key={meeting.id} style={styles.meetingCard}>
                    <CardContent style={styles.meetingCardContent}>
                      <View style={styles.meetingHeader}>
                        <View style={styles.meetingInfo}>
                          <Text style={styles.meetingTitleText}>{meeting.title}</Text>
                          <Text style={styles.meetingClinic}>{meeting.clinic}</Text>
                          {meeting.jobTime && (
                            <View style={styles.meetingTimeContainer}>
                              <View style={[styles.timeDot, { backgroundColor: colors.primary }]} />
                              <Text style={styles.meetingTimeText}>{meeting.jobTime}</Text>
                            </View>
                          )}
                          <View style={styles.meetingLocationContainer}>
                            <View style={[styles.locationDot, { backgroundColor: colors.text + '40' }]} />
                            <Text style={styles.meetingLocationText}>{meeting.jobLocation}</Text>
                          </View>
                        </View>
                        <View style={[styles.jobBadge, { backgroundColor: colors.primary + '20' }]}>
                          <Text style={[styles.jobBadgeText, { color: colors.primary }]}>Job</Text>
                        </View>
                      </View>
                    </CardContent>
                  </Card>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <Text style={styles.emptyIconText}>📅</Text>
                </View>
                <Text style={styles.emptyTitle}>No jobs scheduled for this day.</Text>
                <Text style={styles.emptySubtitle}>Select another date or find new job opportunities.</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Bottom Section: Map */}
      {size === 'lg' && selectedMeetings.length > 0 && (
        <View style={styles.mapContainer}>
          <View style={styles.mapCard}>
            <Text style={styles.mapTitle}>Job Locations</Text>
            <View style={styles.mapWrapper}>
              {selectedMeetings.length > 0 && selectedMeetings.some(meeting => meeting.jobLatitude && meeting.jobLongitude) ? (
                <CalendarMap
                  places={selectedMeetings
                    .filter(meeting => meeting.jobLatitude && meeting.jobLongitude)
                    .map(meeting => ({
                      lat: meeting.jobLatitude!,
                      lng: meeting.jobLongitude!,
                      clinicName: meeting.clinic
                    }))}
                  center={{
                    lat: selectedMeetings.find(m => m.jobLatitude)?.jobLatitude || 40.7128,
                    lng: selectedMeetings.find(m => m.jobLongitude)?.jobLongitude || -74.0060
                  }}
                  zoom={12}
                  updateLocation={() => {}} // No-op since we don't need to update locations
                />
              ) : (
                <View style={styles.mapPlaceholder}>
                  <View style={styles.mapPlaceholderIcon}>
                    <Text style={styles.mapPlaceholderIconText}>📍</Text>
                  </View>
                  <Text style={styles.mapPlaceholderTitle}>No jobs selected</Text>
                  <Text style={styles.mapPlaceholderSubtitle}>Select a date with jobs to see locations on the map</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    padding: 16,
  },
  topSection: {
    flexDirection: 'column',
    gap: 24,
    marginBottom: 24,
  },
  calendarContainer: {
    alignItems: 'center',
  },
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: '100%',
    maxWidth: 400,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  meetingListContainer: {
    flex: 1,
  },
  meetingListCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  meetingListTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  meetingsList: {
    maxHeight: 400,
  },
  meetingCard: {
    marginBottom: 12,
    backgroundColor: '#f0f9ff',
    borderColor: '#bfdbfe',
  },
  meetingCardContent: {
    padding: 16,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  meetingClinic: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
    marginBottom: 8,
  },
  meetingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  meetingTimeText: {
    fontSize: 14,
    color: '#4b5563',
  },
  meetingLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  meetingLocationText: {
    fontSize: 12,
    color: '#6b7280',
  },
  jobBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  jobBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#f3f4f6',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  mapContainer: {
    marginTop: 24,
  },
  mapCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  mapWrapper: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#e5e7eb',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mapPlaceholderIconText: {
    fontSize: 32,
  },
  mapPlaceholderTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  mapPlaceholderSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  // Custom day button styles
  customDayButton: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallDayButton: {
    height: 56,
    width: '100%',
    padding: 4,
  },
  largeDayButton: {
    height: 80,
    width: '100%',
    padding: 8,
  },
  dayContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  dayNumber: {
    fontWeight: '600',
  },
  smallDayNumber: {
    fontSize: 14,
  },
  largeDayNumber: {
    fontSize: 16,
  },
  meetingsContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
  },
  meetingItem: {
    width: '100%',
    alignItems: 'center',
  },
  meetingTitle: {
    fontWeight: '500',
    textAlign: 'center',
    color: '#3b82f6',
  },
  smallMeetingTitle: {
    fontSize: 9,
  },
  largeMeetingTitle: {
    fontSize: 12,
  },
  meetingTime: {
    textAlign: 'center',
    color: '#3b82f6',
    fontWeight: '500',
  },
  smallMeetingTime: {
    fontSize: 8,
  },
  largeMeetingTime: {
    fontSize: 10,
  },
  moreMeetings: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  moreMeetingsText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  smallMoreText: {
    fontSize: 8,
  },
  largeMoreText: {
    fontSize: 10,
  },
  meetingDots: {
    position: 'absolute',
    bottom: 4,
    left: '50%',
    transform: [{ translateX: -8 }],
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
