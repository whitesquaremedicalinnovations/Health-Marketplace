import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar , TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import MeetingCalendar from '../../components/calendar';

export default function CalendarScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Calendar Component */}
      <View style={styles.calendarContainer}>
        <MeetingCalendar size="lg" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  placeholder: {
    width: 40,
  },
  calendarContainer: {
    flex: 1,
  },
}); 