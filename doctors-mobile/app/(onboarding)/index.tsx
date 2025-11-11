import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  Dimensions,
  PermissionsAndroid,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@clerk/clerk-expo";
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { 
  Trash2, 
  Upload, 
  Camera, 
  MapPin, 
  Phone, 
  User as UserIcon, 
  Stethoscope, 
  FileText, 
  CheckCircle2,
  CreditCard,
  Clock,
  Loader2,
  Award,
  Calendar,
  Navigation,
} from "lucide-react-native";
import { axiosInstance } from "../../lib/axios";
import { onboardingDoctor } from "../../lib/utils";
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';

// Doctor specializations enum
enum DoctorSpecialization {
  GENERAL_PHYSICIAN = "GENERAL_PHYSICIAN",
  CARDIOLOGIST = "CARDIOLOGIST", 
  DERMATOLOGIST = "DERMATOLOGIST",
  ENDOCRINOLOGIST = "ENDOCRINOLOGIST",
  GYNECOLOGIST = "GYNECOLOGIST",
  NEUROSURGEON = "NEUROSURGEON",
  ORTHOPEDIC_SURGEON = "ORTHOPEDIC_SURGEON",
  PLASTIC_SURGEON = "PLASTIC_SURGEON",
  UROLOGIST = "UROLOGIST",
  ENT_SPECIALIST = "ENT_SPECIALIST",
  PEDIATRICIAN = "PEDIATRICIAN",
  PSYCHIATRIST = "PSYCHIATRIST",
  DENTIST = "DENTIST"
}

export default function OnboardingScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Personal Information
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Professional Information
  const [specialization, setSpecialization] = useState<DoctorSpecialization>(DoctorSpecialization.GENERAL_PHYSICIAN);
  const [experience, setExperience] = useState(0);
  const [about, setAbout] = useState("");
  const [additionalInformation, setAdditionalInformation] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [currentCertification, setCurrentCertification] = useState("");

  // Location and Documents
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [preferredRadius, setPreferredRadius] = useState(25);
  const [locationRange, setLocationRange] = useState(50);
  const [documents, setDocuments] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [profileImage, setProfileImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const [loading, setLoading] = useState(false);
  // const [onboardingAmount, setOnboardingAmount] = useState(0);
  // const [hasEmailPaid, setHasEmailPaid] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationAttempted, setLocationAttempted] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  // Automatic location fetching
  const getLocation = async () => {
    setIsGettingLocation(true);
    setLocationAttempted(true);
    setLocationError(null);
    
    try {
      // Request permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Permission to access location was denied");
        setIsGettingLocation(false);
        return;
      }

      // Get current location
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 15000,
        distanceInterval: 50,
      });
      
      const { latitude, longitude } = currentLocation.coords;
      
      // Set location coordinates
      setLocation({ lat: latitude, lng: longitude });

      // Try to get address from coordinates
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (reverseGeocode.length > 0) {
          const addressData = reverseGeocode[0];
          const formattedAddress = [
            addressData.street,
            addressData.district,
            addressData.city,
            addressData.region,
            addressData.country,
          ].filter(Boolean).join(', ');
          
          setAddress(formattedAddress);
          
          Toast.show({
            type: 'success',
            text1: 'Location Found',
            text2: 'Your address has been automatically filled.',
          });
        }
      } catch (geocodeError) {
        console.log('Reverse geocoding failed, but coordinates saved');
      }

    } catch (error: any) {
      console.error('Error getting location:', error);
      setLocationError('Could not get your current location. Please enter address manually.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios');
    setSelectedDate(currentDate);
    // Format date as YYYY-MM-DD for the dateOfBirth state
    const formattedDate = currentDate.toISOString().split('T')[0];
    setDateOfBirth(formattedDate);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // COMMENTED OUT - Payment related useEffect
  // useEffect(() => {
  //   const fetchOnboardingAmount = async () => {
  //     try {
  //       const res = await axiosInstance.get("/api/admin/get-onboarding-fee");
  //       const data = res.data;
  //       setOnboardingAmount(data.onboardingFee.fee);
  //     } catch (error) {
  //       console.error("Error fetching onboarding fee:", error);
  //       setOnboardingAmount(500); // Default fallback
  //     }
  //   };

  //   const checkEmailPayment = async () => {
  //     if (email) {
  //       try {
  //         const res = await axiosInstance.get("/api/payments/get-email-payment", {
  //           params: {
  //             email: email,
  //             userType: "DOCTOR",
  //           }
  //         });
  //         const data = res.data;
  //         setHasEmailPaid(data.data.payment !== null);
  //       } catch (error) {
  //         console.error("Error checking payment status:", error);
  //         setHasEmailPaid(false);
  //       }
  //     }
  //   };

  //   fetchOnboardingAmount();
  //   checkEmailPayment();
  // }, [email]);

  useEffect(() => {
    const initializeOnboarding = async () => {
      if (user) {
        setFullName(`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim());
        setEmail(user.emailAddresses[0]?.emailAddress ?? "");
        setPhoneNumber(user.phoneNumbers[0]?.phoneNumber ?? "");
        setIsCheckingUser(false);
      }
    };
    initializeOnboarding();
  }, [user]);

  // Automatically get location when component mounts and reaches step 3
  useEffect(() => {
    if (!isCheckingUser && step === 3) {
      getLocation();
    }
  }, [isCheckingUser, step]);

  const handleChooseProfileImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0]);
    }
  };

  const handleChooseDocuments = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      setDocuments(result.assets);
    }
  };

  const addCertification = () => {
    if (currentCertification.trim() && !certifications.includes(currentCertification.trim())) {
      setCertifications([...certifications, currentCertification.trim()]);
      setCurrentCertification("");
    }
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  // COMMENTED OUT - Payment handler
  // const handlePayment = async () => {
  //   Alert.alert(
  //     'Payment Required',
  //     `Complete your doctor registration with a one-time fee of ₹${onboardingAmount}`,
  //     [
  //       {
  //         text: 'Cancel',
  //         style: 'cancel',
  //       },
  //       {
  //         text: 'Pay Now',
  //         onPress: () => {
  //           // In a real app, integrate with Razorpay or other payment gateway
  //           // For now, we'll simulate payment success
  //           setTimeout(() => {
  //             setHasEmailPaid(true);
  //             Toast.show({
  //               type: 'success',
  //               text1: 'Payment Successful',
  //               text2: 'You can now complete your registration',
  //             });
  //           }, 2000);
  //         },
  //       },
  //     ]
  //   );
  // };


  const handleSubmit = async () => {
    setLoading(true);

    let profileImageUrl = null;
    if (profileImage) {
      const profileImageFormData = new FormData();
      profileImageFormData.append('file', {
        uri: profileImage.uri,
        name: profileImage.fileName,
        type: profileImage.mimeType,
      } as any);

      try {
        const res = await axiosInstance.post('/api/upload', profileImageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        profileImageUrl = res.data.url;
      } catch (error) {
        console.error("Profile image upload failed:", error);
        Toast.show({ type: 'error', text1: 'Profile image upload failed' });
        setLoading(false);
        return;
      }
    }

    const documentUrls = [];
    for (const doc of documents) {
      const docFormData = new FormData();
      docFormData.append('file', {
        uri: doc.uri,
        name: doc.fileName,
        type: doc.mimeType,
      } as any);

      try {
        const res = await axiosInstance.post('/api/upload', docFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        documentUrls.push(res.data.url);
      } catch (error) {
        console.error("Document upload failed:", error);
        Toast.show({ type: 'error', text1: 'Document upload failed' });
        setLoading(false);
        return;
      }
    }

    try {
      const doctorData = {
        doctorId: user?.id ?? "",
        email,
        fullName,
        gender,
        dateOfBirth,
        phoneNumber,
        address,
        specialization,
        additionalInformation,
        experience,
        about,
        certifications,
        profileImage: profileImageUrl,
        documents: documentUrls,
        locationRange,
        location,
        preferredRadius,
      };

      const response = await onboardingDoctor(doctorData);
      if (response.status === 200) {
        await AsyncStorage.setItem("hasOnboarded", "true");
        Toast.show({
          type: 'success',
          text1: 'Registration Complete!',
          text2: 'Welcome to HealthCare Platform',
        });
        router.replace("/(drawer)/tabs");
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: 'Please try again.',
        });
      }
    } catch (err) {
      console.log("Error during onboarding:", err);
      Toast.show({
        type: 'error',
        text1: 'An error occurred',
        text2: 'Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };


  if (isCheckingUser) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View className="flex-1 justify-center items-center">
          <View className="bg-white rounded-full p-8 shadow-lg mb-4">
            <Clock size={32} color="#3b82f6" />
          </View>
          <Text className="text-lg font-semibold text-gray-800">Checking your profile...</Text>
          <Text className="text-sm text-gray-500 mt-1">Please wait while we verify your account</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Animated Background */}
      <View style={{ position: 'absolute', inset: 0 }}>
        <LinearGradient
          colors={['#f8fafc', '#e0e7ff', '#ddd6fe']}
          style={{ flex: 1 }}
        />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <LinearGradient
          colors={['#3b82f6', '#8b5cf6']}
          style={{ 
            paddingHorizontal: 24, 
            paddingTop: Platform.OS === 'ios' ? 40 : 60, 
            paddingBottom: 40,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-4">
              <Stethoscope size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-white text-center mb-2">
              Join the Medical Professional Network
            </Text>
            <Text className="text-blue-100 text-base text-center">
              Set up your professional profile to start finding great opportunities
            </Text>
          </View>

          {/* Progress Indicator */}
          <View className="flex-row items-center justify-center">
            <View className="flex-row items-center">
              <View className={`w-10 h-10 rounded-full items-center justify-center ${step >= 1 ? 'bg-white' : 'bg-white/30'}`}>
                {step > 1 ? (
                  <CheckCircle2 size={20} color="#3b82f6" />
                ) : (
                  <UserIcon size={20} color={step >= 1 ? "#3b82f6" : "white"} />
                )}
              </View>
              <Text className="text-white text-xs font-medium ml-2 mr-4">Personal Info</Text>
            </View>
            <View className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
            <View className="flex-row items-center">
              <Text className="text-white text-xs font-medium mr-2 ml-4">Professional</Text>
              <View className={`w-10 h-10 rounded-full items-center justify-center ${step >= 2 ? 'bg-white' : 'bg-white/30'}`}>
                {step > 2 ? (
                  <CheckCircle2 size={20} color="#3b82f6" />
                ) : (
                  <Stethoscope size={20} color={step >= 2 ? "#3b82f6" : "white"} />
                )}
              </View>
            </View>
            <View className={`flex-1 h-1 rounded-full ${step >= 3 ? 'bg-white' : 'bg-white/30'}`} />
            <View className="flex-row items-center">
              <Text className="text-white text-xs font-medium mr-2 ml-4">Location & Payment</Text>
              <View className={`w-10 h-10 rounded-full items-center justify-center ${step >= 3 ? 'bg-white' : 'bg-white/30'}`}>
                <MapPin size={20} color={step >= 3 ? "#3b82f6" : "white"} />
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={{ padding: 24, paddingTop: 32 }}>
          {/* Profile Image Upload */}
          <View className="items-center mb-8">
            <TouchableOpacity 
              onPress={handleChooseProfileImage}
              className="relative"
            >
              <View
                className={`w-32 h-32 rounded-full items-center justify-center border-4 border-dashed ${
                  profileImage ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-100'
                }`}
              >
                {profileImage ? (
                  <Image 
                    source={{ uri: profileImage.uri }} 
                    className="w-32 h-32 rounded-full" 
                  />
                ) : (
                  <View className="items-center">
                    <Upload size={24} color="#9ca3af" />
                    <Text className="text-gray-500 text-xs mt-2 text-center">Upload Photo</Text>
                  </View>
                )}
              </View>
              <View className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2">
                <Camera size={16} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Step Content */}
          <View className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            {step === 1 && (
              <View>
                <View className="items-center mb-6">
                  <Text className="text-2xl font-bold text-gray-900 mb-2">Personal Information</Text>
                  <Text className="text-gray-600 text-center">Tell us about yourself</Text>
                </View>
                
                <View className="space-y-4">
                  <View>
                    <View className="flex-row items-center mb-2">
                      <UserIcon size={16} color="#6b7280" />
                      <Text className="text-gray-700 font-medium ml-2">Full Name</Text>
                    </View>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900"
                      placeholder="Dr. John Smith"
                      value={fullName}
                      onChangeText={setFullName}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 font-medium mb-2">Email Address</Text>
                    <TextInput
                      className="bg-gray-100 border border-gray-200 p-4 rounded-xl text-gray-700"
                      value={email}
                      editable={false}
                    />
                    <Text className="text-gray-500 text-xs mt-1">This email is from your account and cannot be changed</Text>
                  </View>

                  <View>
                    <View className="flex-row items-center mb-2">
                      <Phone size={16} color="#6b7280" />
                      <Text className="text-gray-700 font-medium ml-2">Phone Number</Text>
                    </View>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900"
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 font-medium mb-2">Gender</Text>
                    <View className="flex-row gap-2">
                      {['male', 'female', 'other'].map((g) => (
                        <TouchableOpacity
                          key={g}
                          onPress={() => setGender(g)}
                          className={`flex-1 p-3 rounded-xl border ${
                            gender === g ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <Text className={`text-center font-medium capitalize ${
                            gender === g ? 'text-blue-700' : 'text-gray-700'
                          }`}>
                            {g}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View>
                    <View className="flex-row items-center mb-2">
                      <Calendar size={16} color="#6b7280" />
                      <Text className="text-gray-700 font-medium ml-2">Date of Birth</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(true)}
                      className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex-row items-center justify-between"
                    >
                      <Text className={`text-gray-900 ${!dateOfBirth ? 'text-gray-400' : ''}`}>
                        {dateOfBirth ? formatDisplayDate(dateOfBirth) : 'Select your date of birth'}
                      </Text>
                      <Calendar size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {step === 2 && (
              <View>
                <View className="items-center mb-6">
                  <Text className="text-2xl font-bold text-gray-900 mb-2">Professional Information</Text>
                  <Text className="text-gray-600 text-center">Tell us about your medical expertise</Text>
                </View>
                
                <View className="space-y-4">
                  <View>
                    <View className="flex-row items-center mb-2">
                      <Stethoscope size={16} color="#6b7280" />
                      <Text className="text-gray-700 font-medium ml-2">Specialization</Text>
                    </View>
                    <View className="bg-gray-50 border border-gray-200 rounded-xl">
                      <Text className="p-4 text-gray-900">
                        {specialization.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
                      <View className="flex-row gap-2">
                        {Object.values(DoctorSpecialization).slice(0, 5).map((spec) => (
                          <TouchableOpacity
                            key={spec}
                            onPress={() => setSpecialization(spec)}
                            className={`px-3 py-2 rounded-lg ${
                              specialization === spec ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <Text className={`text-xs font-medium ${
                              specialization === spec ? 'text-white' : 'text-gray-700'
                            }`}>
                              {spec.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  <View>
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center">
                        <Award size={16} color="#6b7280" />
                        <Text className="text-gray-700 font-medium ml-2">Years of Experience</Text>
                      </View>
                      <View className="bg-blue-100 rounded-full px-3 py-1">
                        <Text className="text-blue-700 text-sm font-medium">{experience} years</Text>
                      </View>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <TouchableOpacity
                        onPress={() => setExperience(Math.max(0, experience - 1))}
                        className="bg-gray-200 rounded-full w-10 h-10 items-center justify-center"
                      >
                        <Text className="text-gray-700 font-bold">-</Text>
                      </TouchableOpacity>
                      <View className="flex-1 mx-4 bg-gray-200 h-2 rounded-full">
                        <View 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(experience / 50) * 100}%` }}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() => setExperience(Math.min(50, experience + 1))}
                        className="bg-gray-200 rounded-full w-10 h-10 items-center justify-center"
                      >
                        <Text className="text-gray-700 font-bold">+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View>
                    <Text className="text-gray-700 font-medium mb-2">About You</Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900 h-24"
                      placeholder="Tell us about your background, interests, and what drives your passion for medicine..."
                      value={about}
                      onChangeText={setAbout}
                      multiline
                      textAlignVertical="top"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 font-medium mb-2">Additional Information</Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900 h-20"
                      placeholder="Any additional information you'd like to share..."
                      value={additionalInformation}
                      onChangeText={setAdditionalInformation}
                      multiline
                      textAlignVertical="top"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  {/* Certifications */}
                  <View>
                    <View className="flex-row items-center mb-2">
                      <Award size={16} color="#6b7280" />
                      <Text className="text-gray-700 font-medium ml-2">Certifications & Qualifications</Text>
                    </View>
                    
                    <View className="flex-row gap-2 mb-2">
                      <TextInput
                        className="flex-1 bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900"
                        placeholder="Enter certification (e.g., MD, Board Certified)"
                        value={currentCertification}
                        onChangeText={setCurrentCertification}
                        placeholderTextColor="#9ca3af"
                      />
                      <TouchableOpacity
                        onPress={addCertification}
                        className="bg-blue-600 rounded-xl px-4 py-3"
                      >
                        <Text className="text-white font-medium">Add</Text>
                      </TouchableOpacity>
                    </View>

                    {certifications.length > 0 && (
                      <View className="flex-row flex-wrap gap-2">
                        {certifications.map((cert, index) => (
                          <View key={index} className="bg-blue-100 rounded-full px-3 py-2 flex-row items-center">
                            <Text className="text-blue-800 text-sm">{cert}</Text>
                            <TouchableOpacity
                              onPress={() => removeCertification(index)}
                              className="ml-2"
                            >
                              <Trash2 size={14} color="#3b82f6" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {step === 3 && (
              <View>
                <View className="items-center mb-6">
                  <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
                    <MapPin size={32} color="#3b82f6" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-900 mb-2">Location & Payment</Text>
                  <Text className="text-gray-600 text-center">
                    Set your work preferences and complete registration
                  </Text>
                </View>

                <View className="space-y-4 mb-6">
                  <View>
                    <View className="flex-row items-center mb-2">
                      <MapPin size={16} color="#6b7280" />
                      <Text className="text-gray-700 font-medium ml-2">Current Address</Text>
                      {isGettingLocation && (
                        <View className="ml-2 flex-row items-center">
                          <Loader2 size={14} color="#3b82f6" />
                          <Text className="text-blue-600 text-xs ml-1">Getting location...</Text>
                        </View>
                      )}
                    </View>
                    
                    <Text className="text-gray-500 text-xs mb-2">
                      💡 Location will be automatically detected when you reach this step
                    </Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900"
                      placeholder="123 Main St, City, State, Country"
                      value={address}
                      onChangeText={setAddress}
                      placeholderTextColor="#9ca3af"
                    />
                    {location && (
                      <View className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <View className="flex-row items-center">
                          <CheckCircle2 size={12} color="#10b981" />
                          <Text className="text-green-800 text-xs ml-1 font-medium">
                            Location detected successfully
                          </Text>
                        </View>
                        <Text className="text-green-600 text-xs mt-1">
                          Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                        </Text>
                      </View>
                    )}
                    
                    {locationError && (
                      <View className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <Text className="text-red-800 text-xs">
                          {locationError}
                        </Text>
                        <TouchableOpacity 
                          onPress={getLocation}
                          disabled={isGettingLocation}
                          className="mt-2 flex-row items-center"
                        >
                          <Navigation size={12} color="#ef4444" />
                          <Text className="text-red-700 text-xs ml-1 font-medium">
                            {isGettingLocation ? 'Trying again...' : 'Try Again'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    
                    {locationAttempted && !location && !locationError && (
                      <View className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <Text className="text-yellow-800 text-xs">
                          Location couldn't be automatically detected. Please enter your address manually or try again.
                        </Text>
                        <TouchableOpacity 
                          onPress={getLocation}
                          disabled={isGettingLocation}
                          className="mt-2 flex-row items-center"
                        >
                          <Navigation size={12} color="#f59e0b" />
                          <Text className="text-yellow-700 text-xs ml-1 font-medium">
                            {isGettingLocation ? 'Trying again...' : 'Try Again'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* Documents Upload */}
                  <View>
                    <View className="flex-row items-center mb-2">
                      <FileText size={16} color="#6b7280" />
                      <Text className="text-gray-700 font-medium ml-2">Professional Documents (Optional)</Text>
                    </View>
                    
                    <TouchableOpacity 
                      className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center bg-gray-50"
                      onPress={handleChooseDocuments}
                    >
                      <Upload size={24} color="#9ca3af" />
                      <Text className="text-gray-600 text-sm mt-2 text-center">Upload medical license, certifications, resume</Text>
                      <Text className="text-gray-500 text-xs">PDF, JPG, PNG up to 10MB each</Text>
                    </TouchableOpacity>

                    {documents.length > 0 && (
                      <View className="mt-4 space-y-2">
                        {documents.map((doc, index) => (
                          <View key={index} className="flex-row items-center justify-between bg-gray-100 p-3 rounded-lg">
                            <View className="flex-row items-center flex-1">
                              <FileText size={16} color="#6b7280" />
                              <Text className="text-gray-700 ml-2 flex-1" numberOfLines={1}>
                                {doc.fileName}
                              </Text>
                            </View>
                            <TouchableOpacity 
                              onPress={() => setDocuments(documents.filter((_, i) => i !== index))}
                              className="ml-2 p-1"
                            >
                              <Trash2 size={16} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                {/* COMMENTED OUT - Payment Section */}
                {/* <View className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                  <Text className="text-lg font-semibold text-gray-900 mb-2">Registration Fee</Text>
                  <Text className="text-3xl font-bold text-blue-600 mb-2">₹{onboardingAmount}</Text>
                  <Text className="text-gray-600 text-sm">
                    This one-time fee helps us maintain a secure and professional platform for medical professionals.
                  </Text>
                </View>

                {hasEmailPaid ? (
                  <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                    <View className="flex-row items-center">
                      <CheckCircle2 size={20} color="#10b981" />
                      <Text className="text-green-800 font-medium ml-2">Payment Confirmed</Text>
                    </View>
                    <Text className="text-green-600 text-sm mt-1">
                      Your payment has been processed successfully. You can now complete your registration.
                    </Text>
                  </View>
                ) : (
                  <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <View className="flex-row items-center">
                      <Clock size={20} color="#f59e0b" />
                      <Text className="text-yellow-800 font-medium ml-2">Payment Required</Text>
                    </View>
                    <Text className="text-yellow-600 text-sm mt-1">
                      Please complete the payment to proceed with your doctor registration.
                    </Text>
                  </View>
                )} */}

                {/* Terms and Conditions */}
                <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <TouchableOpacity 
                    onPress={() => setAcceptedTerms(!acceptedTerms)}
                    className="flex-row items-start"
                  >
                    <View className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 items-center justify-center ${
                      acceptedTerms ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                    }`}>
                      {acceptedTerms && (
                        <CheckCircle2 size={12} color="white" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-800 text-sm leading-5">
                        I agree to the{' '}
                        <Text className="text-blue-600 font-medium">Terms of Service</Text>
                        {' '}and{' '}
                        <Text className="text-blue-600 font-medium">Privacy Policy</Text>
                        . I understand that my professional credentials will be verified before account activation.
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Navigation Buttons */}
          <View className="flex-row justify-between items-center">
            {step > 1 ? (
              <TouchableOpacity 
                onPress={handlePrev}
                className="bg-gray-200 rounded-xl px-6 py-4 flex-row items-center"
              >
                <Text className="text-gray-700 font-medium">Previous</Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}
            
            {step < 3 ? (
              <TouchableOpacity 
                onPress={handleNext}
                className="bg-blue-600 rounded-xl px-8 py-4 flex-row items-center shadow-lg"
              >
                <Text className="text-white font-medium mr-2">Continue</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={handleSubmit}
                disabled={loading || !acceptedTerms}
                className={`rounded-xl px-8 py-4 flex-row items-center shadow-lg ${
                  loading || !acceptedTerms ? 'bg-gray-400' : 'bg-green-600'
                }`}
              >
                {loading ? (
                  <Loader2 size={16} color="white" />
                ) : (
                  <CheckCircle2 size={16} color="white" />
                )}
                <Text className="text-white font-medium ml-2">
                  {loading ? 'Creating profile...' : 'Complete Profile'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}
    </SafeAreaView>
  );
}
