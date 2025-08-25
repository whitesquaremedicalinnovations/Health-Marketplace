import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  const features = [
    {
      icon: 'business',
      title: 'Connect with Clinics',
      description: 'Find and connect with healthcare clinics in your area',
    },
    {
      icon: 'calendar',
      title: 'Manage Appointments',
      description: 'Efficiently schedule and manage patient appointments',
    },
    {
      icon: 'people',
      title: 'Patient Care',
      description: 'Comprehensive patient records and care coordination',
    },
    {
      icon: 'chatbubbles',
      title: 'Secure Communication',
      description: 'Secure messaging and file sharing with healthcare teams',
    },
  ];

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  const handleSignUp = () => {
    router.push('/sign-up');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <LinearGradient
        colors={['#2563EB', '#1D4ED8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.logo}>HealthConnect</Text>
          <Text style={styles.tagline}>
            Connecting Doctors with Healthcare Clinics
          </Text>
          <Text style={styles.subtitle}>
            Expand your practice and enhance patient care
          </Text>
        </View>
      </LinearGradient>

      {/* Features Section */}
      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Why Choose HealthConnect?</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.iconContainer}>
                <Ionicons name={feature.icon as any} size={24} color="#2563EB" />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>2000+</Text>
          <Text style={styles.statLabel}>Doctors</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>500+</Text>
          <Text style={styles.statLabel}>Clinics</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>15K+</Text>
          <Text style={styles.statLabel}>Patients</Text>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaContainer}>
        <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
        <Text style={styles.ctaDescription}>
          Join thousands of healthcare professionals already using HealthConnect
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleSignIn}>
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2024 HealthConnect. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresContainer: {
    padding: 20,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 30,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 30,
    backgroundColor: '#2563EB',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  ctaContainer: {
    padding: 30,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  ctaDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
}); 