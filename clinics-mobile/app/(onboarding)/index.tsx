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
  Dimensions,
  Alert,
  Platform,
  PermissionsAndroid,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@clerk/clerk-expo";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { 
  Trash2, 
  Upload, 
  Camera, 
  MapPin, 
  Phone, 
  User as UserIcon, 
  Building, 
  FileText, 
  CheckCircle2,
  CreditCard,
  Shield,
  Clock,
  Loader2,
  Navigation,
} from "lucide-react-native";
import { axiosInstance } from "../../lib/axios";
import { onboardingClinic } from "../../lib/utils";
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import RazorpayWebView from "../../components/razorpay-webview";

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [ownerFirstName, setOwnerFirstName] = useState("");
  const [ownerLastName, setOwnerLastName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhoneNumber, setOwnerPhoneNumber] = useState("");

  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [clinicPhoneNumber, setClinicPhoneNumber] = useState("");
  const [clinicAdditionalDetails, setClinicAdditionalDetails] = useState("");
  const [clinicDocuments, setClinicDocuments] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [clinicProfileImage, setClinicProfileImage] = useState<ImagePicker.ImagePickerAsset | null>(
    null
  );
  const [clinicLocation, setClinicLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [preferredRadius, setPreferredRadius] = useState(5);

  const [loading, setLoading] = useState(false);
  const [onboardingAmount, setOnboardingAmount] = useState(0);
  const [hasEmailPaid, setHasEmailPaid] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationAttempted, setLocationAttempted] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
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
      setClinicLocation({ lat: latitude, lng: longitude });

      // Try to get address from coordinates
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (reverseGeocode.length > 0) {
          const address = reverseGeocode[0];
          const formattedAddress = [
            address.street,
            address.district,
            address.city,
            address.region,
            address.country,
          ].filter(Boolean).join(', ');
          
          setClinicAddress(formattedAddress);
          
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
  
  // Razorpay payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      // Validate owner information
      if (!ownerFirstName.trim() || !ownerLastName.trim() || !ownerPhoneNumber.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Missing Information',
          text2: 'Please fill in all required owner information fields.',
        });
        return;
      }
    }
    
    if (step === 2) {
      // Validate clinic details
      if (!clinicName.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Clinic Name Required',
          text2: 'Please enter your clinic name.',
        });
        return;
      }
      
      if (!clinicPhoneNumber.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Phone Number Required',
          text2: 'Please enter your clinic phone number.',
        });
        return;
      }
      
      if (!clinicAddress.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Address Required',
          text2: 'Please enter your clinic address or use current location.',
        });
        return;
      }
      
      if (!clinicLocation) {
        Toast.show({
          type: 'error',
          text1: 'Location Required',
          text2: 'Please use the "Use Current" button to get your location coordinates.',
        });
        return;
      }
    }
    
    setStep((s) => s + 1);
  };
  const handlePrev = () => setStep((s) => s - 1);

  

  useEffect(() => {
    const fetchOnboardingAmount = async () => {
      try {
        const res = await axiosInstance.get("/api/admin/get-onboarding-fee");
        const data = res.data;
        setOnboardingAmount(data.onboardingFee.fee);
      } catch (error) {
        console.error("Error fetching onboarding fee:", error);
        setOnboardingAmount(500); // Default fallback
      }
    };

    const checkEmailPayment = async () => {
      if (ownerEmail) {
        try {
          const res = await axiosInstance.get("/api/payments/get-email-payment", {
            params: {
              email: ownerEmail,
              userType: "CLINIC",
            }
          });
          const data = res.data;
          setHasEmailPaid(data.data.payment !== null);
        } catch (error) {
          console.error("Error checking payment status:", error);
          setHasEmailPaid(false);
        }
      }
    };

    fetchOnboardingAmount();
    checkEmailPayment();
  }, [ownerEmail]);

  useEffect(() => {
    const initializeOnboarding = async () => {
      if (user) {
        setOwnerFirstName(user.firstName ?? "");
        setOwnerLastName(user.lastName ?? "");
        setOwnerEmail(user.emailAddresses[0]?.emailAddress ?? "");
        setOwnerPhoneNumber(user.phoneNumbers[0]?.phoneNumber ?? "");
        setIsCheckingUser(false);
      }
    };
    initializeOnboarding();
  }, [user]);

  // Automatically get location when component mounts
  useEffect(() => {
    if (!isCheckingUser && step === 2) {
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
      setClinicProfileImage(result.assets[0]);
    }
  };

  const handleChooseDocuments = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      setClinicDocuments(result.assets);
    }
  };


  const handlePayment = async () => {
    try {
      setIsProcessingPayment(true);
      
      // Create order on backend
      const orderResponse = await axiosInstance.post("/api/payments", {
        amount: onboardingAmount,
        currency: "INR",
        receipt: `clinic_onboarding_${Date.now()}`,
        email: ownerEmail,
        userType: "CLINIC",
      });

      const orderData = orderResponse.data.data;
      
      if (!orderData || !orderData.id) {
        throw new Error('Invalid order response from server');
      }
      
      setPaymentOrderId(orderData.id);
      setShowPaymentModal(true);
      
    } catch (error: any) {
      console.error("Error creating payment order:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to initialize payment';
      Toast.show({
        type: 'error',
        text1: 'Payment Error',
        text2: errorMessage,
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = async (paymentId: string, signature: string) => {
    try {
      // Verify payment on backend
      await axiosInstance.post("/api/payments/verify", {
        razorpay_order_id: paymentOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      });

      setShowPaymentModal(false);
      setHasEmailPaid(true);
      
      Toast.show({
        type: 'success',
        text1: 'Payment Successful',
        text2: 'Your payment has been processed successfully.',
      });
      
    } catch (error) {
      console.error("Error verifying payment:", error);
      Toast.show({
        type: 'error',
        text1: 'Payment Verification Failed',
        text2: 'Please contact support if payment was deducted.',
      });
    }
  };

  const handlePaymentError = (error: string) => {
    setShowPaymentModal(false);
    Toast.show({
      type: 'error',
      text1: 'Payment Failed',
      text2: error,
    });
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
  };

  const handleSubmit = async () => {
    setLoading(true);

    let profileImageUrl = null;
    if (clinicProfileImage) {
      const profileImageFormData = new FormData();
      profileImageFormData.append('file', {
        uri: clinicProfileImage.uri,
        name: clinicProfileImage.fileName,
        type: clinicProfileImage.mimeType,
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
    for (const doc of clinicDocuments) {
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
      const data = {
        clinicId: user?.id ?? "",
        ownerName: `${ownerFirstName} ${ownerLastName}`,
        ownerPhoneNumber,
        email: ownerEmail,
        clinicName,
        clinicAddress,
        clinicPhoneNumber,
        clinicAdditionalDetails,
        clinicProfileImage: profileImageUrl,
        documents: documentUrls,
        location: clinicLocation,
        preferredRadius,
      };

      const response = await onboardingClinic(data);
      if (response.status === 200) {
        await AsyncStorage.setItem("hasOnboarded", "true");
        
        // Cache the user data for quicker subsequent loads
        if (user?.id && response.data) {
          await AsyncStorage.setItem(`user_data_${user.id}`, JSON.stringify(response.data));
        }
        
        Toast.show({
          type: 'success',
          text1: 'Registration Complete!',
          text2: 'Your clinic is now under verification. You will be notified once verified.',
        });
        router.replace("/verification-status");
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
      
      {/* Animated Background */}
      <View style={{ position: 'absolute', inset: 0 }}>
        <LinearGradient
          colors={['#f8fafc', '#e0e7ff', '#ddd6fe']}
          style={{ flex: 1 }}
        />
        <View
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 200,
            height: 200,
            backgroundColor: '#2563EB',
            opacity: 0.1,
            borderRadius: 100,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 160,
            height: 160,
            backgroundColor: '#2563EB',
            opacity: 0.1,
            borderRadius: 80,
          }}
        />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <LinearGradient
          colors={['#2563EB', '#06B6D4']}
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
              <Building size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-white text-center mb-2">
              Welcome to HealthCare Platform
            </Text>
            <Text className="text-blue-100 text-base text-center">
              Let's set up your clinic profile in just 3 simple steps
            </Text>
          </View>

          {/* Progress Indicator */}
          <View className="flex-row items-center justify-center">
            <View className="flex-row items-center">
              <View className={`w-10 h-10 rounded-full items-center justify-center ${step >= 1 ? 'bg-white' : 'bg-white/30'}`}>
                {step > 1 ? (
                  <CheckCircle2 size={20} color="#2563EB" />
                ) : (
                  <UserIcon size={20} color={step >= 1 ? "#2563EB" : "white"} />
                )}
              </View>
              <Text className="text-white text-xs font-medium ml-2 mr-4">Owner Info</Text>
            </View>
            <View className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
            <View className="flex-row items-center">
              <Text className="text-white text-xs font-medium mr-2 ml-4">Clinic Details</Text>
              <View className={`w-10 h-10 rounded-full items-center justify-center ${step >= 2 ? 'bg-white' : 'bg-white/30'}`}>
                {step > 2 ? (
                  <CheckCircle2 size={20} color="#2563EB" />
                ) : (
                  <Building size={20} color={step >= 2 ? "#2563EB" : "white"} />
                )}
              </View>
            </View>
            <View className={`flex-1 h-1 rounded-full ${step >= 3 ? 'bg-white' : 'bg-white/30'}`} />
            <View className="flex-row items-center">
              <Text className="text-white text-xs font-medium mr-2 ml-4">Payment</Text>
              <View className={`w-10 h-10 rounded-full items-center justify-center ${step >= 3 ? 'bg-white' : 'bg-white/30'}`}>
                <CreditCard size={20} color={step >= 3 ? "#2563EB" : "white"} />
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
                  clinicProfileImage ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-100'
                }`}
              >
                {clinicProfileImage ? (
                  <Image 
                    source={{ uri: clinicProfileImage.uri }} 
                    className="w-32 h-32 rounded-full" 
                  />
                ) : (
                  <View className="items-center">
                    <Upload size={24} color="#9ca3af" />
                    <Text className="text-gray-500 text-xs mt-2 text-center">Upload Logo</Text>
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
                  <Text className="text-2xl font-bold text-gray-900 mb-2">Owner Information</Text>
                  <Text className="text-gray-600 text-center">Tell us about yourself</Text>
                </View>
                
                <View className="space-y-4">
                  <View>
                    <View className="flex-row items-center mb-2">
                      <UserIcon size={16} color="#6b7280" />
                      <Text className="text-gray-700 font-medium ml-2">First Name *</Text>
                    </View>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900"
                      placeholder="John"
                      value={ownerFirstName}
                      onChangeText={setOwnerFirstName}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  <View>
                    <View className="flex-row items-center mb-2">
                      <UserIcon size={16} color="#6b7280" />
                      <Text className="text-gray-700 font-medium ml-2">Last Name *</Text>
                    </View>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900"
                      placeholder="Doe"
                      value={ownerLastName}
                      onChangeText={setOwnerLastName}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 font-medium mb-2">Email Address</Text>
                    <TextInput
                      className="bg-gray-100 border border-gray-200 p-4 rounded-xl text-gray-700"
                      value={ownerEmail}
                      editable={false}
                    />
                    <Text className="text-gray-500 text-xs mt-1">This email is from your account and cannot be changed</Text>
                  </View>

                  <View>
                    <View className="flex-row items-center mb-2">
                      <Phone size={16} color="#6b7280" />
                      <Text className="text-gray-700 font-medium ml-2">Phone Number *</Text>
                    </View>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900"
                      placeholder="+1 (555) 123-4567"
                      value={ownerPhoneNumber}
                      onChangeText={setOwnerPhoneNumber}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>
              </View>
            )}

            {step === 2 && (
              <View>
                <View className="items-center mb-6">
                  <Text className="text-2xl font-bold text-gray-900 mb-2">Clinic Details</Text>
                  <Text className="text-gray-600 text-center">Setup your clinic information</Text>
                </View>
                
                <View className="space-y-4">
                  <View>
                    <View className="flex-row items-center mb-2">
                      <Building size={16} color="#6b7280" />
                      <Text className="text-gray-700 font-medium ml-2">Clinic Name *</Text>
                    </View>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900"
                      placeholder="HealthCare Plus Medical Center"
                      value={clinicName}
                      onChangeText={setClinicName}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  <View>
                    <View className="flex-row items-center mb-2">
                      <Phone size={16} color="#6b7280" />
                      <Text className="text-gray-700 font-medium ml-2">Clinic Phone Number</Text>
                    </View>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900"
                      placeholder="+1 (555) 987-6543"
                      value={clinicPhoneNumber}
                      onChangeText={setClinicPhoneNumber}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  <View>
                    <View className="flex-row items-center mb-2">
                      <MapPin size={16} color="#6b7280" />
                      <Text className="text-gray-700 font-medium ml-2">Clinic Address</Text>
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
                      value={clinicAddress}
                      onChangeText={setClinicAddress}
                      placeholderTextColor="#9ca3af"
                    />
                    {clinicLocation && (
                      <View className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <View className="flex-row items-center">
                          <CheckCircle2 size={12} color="#10b981" />
                          <Text className="text-green-800 text-xs ml-1 font-medium">
                            Location detected successfully
                          </Text>
                        </View>
                        <Text className="text-green-600 text-xs mt-1">
                          Coordinates: {clinicLocation.lat.toFixed(6)}, {clinicLocation.lng.toFixed(6)}
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
                    
                    {locationAttempted && !clinicLocation && !locationError && (
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

                  <View>
                    <View className="flex-row items-center mb-2">
                      <FileText size={16} color="#6b7280" />
                      <Text className="text-gray-700 font-medium ml-2">Additional Details</Text>
                    </View>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900 h-24"
                      placeholder="Describe your services, timings, specializations, or any other important information..."
                      value={clinicAdditionalDetails}
                      onChangeText={setClinicAdditionalDetails}
                      multiline
                      textAlignVertical="top"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  {/* Document Upload */}
                  <View>
                    <View className="flex-row items-center mb-2">
                      <FileText size={16} color="#6b7280" />
                      <Text className="text-gray-700 font-medium ml-2">Clinic Documents & Certifications</Text>
                    </View>
                    
                    <TouchableOpacity 
                      className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center bg-gray-50"
                      onPress={handleChooseDocuments}
                    >
                      <Upload size={24} color="#9ca3af" />
                      <Text className="text-gray-600 text-sm mt-2 text-center">Click to upload or drag and drop</Text>
                      <Text className="text-gray-500 text-xs">PDF, JPG, PNG up to 10MB each</Text>
                    </TouchableOpacity>

                    {clinicDocuments.length > 0 && (
                      <View className="mt-4 space-y-2">
                        {clinicDocuments.map((doc, index) => (
                          <View key={index} className="flex-row items-center justify-between bg-gray-100 p-3 rounded-lg">
                            <View className="flex-row items-center flex-1">
                              <FileText size={16} color="#6b7280" />
                              <Text className="text-gray-700 ml-2 flex-1" numberOfLines={1}>
                                {doc.fileName}
                              </Text>
                            </View>
                            <TouchableOpacity 
                              onPress={() => setClinicDocuments(clinicDocuments.filter((_, i) => i !== index))}
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
              </View>
            )}

            {step === 3 && (
              <View>
                <View className="items-center mb-6">
                  <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
                    <CreditCard size={32} color="#3b82f6" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-900 mb-2">Complete Registration</Text>
                  <Text className="text-gray-600 text-center">
                    Secure your clinic account with a one-time registration fee
                  </Text>
                </View>

                <View className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                  <Text className="text-lg font-semibold text-gray-900 mb-2">Registration Fee</Text>
                  <Text className="text-3xl font-bold text-blue-600 mb-2">₹{onboardingAmount}</Text>
                  <Text className="text-gray-600 text-sm">
                    This one-time fee helps us maintain a secure and professional platform for healthcare providers.
                  </Text>
                </View>

                {hasEmailPaid ? (
                  <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                    <View className="flex-row items-center">
                      <CheckCircle2 size={20} color="#2563EB" />
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
                      Please complete the payment to proceed with your clinic registration.
                    </Text>
                  </View>
                )}
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
              <>
                {hasEmailPaid ? (
                  <TouchableOpacity 
                    onPress={handleSubmit}
                    disabled={loading}
                    className={`rounded-xl px-8 py-4 flex-row items-center shadow-lg ${
                      loading ? 'bg-gray-400' : 'bg-green-600'
                    }`}
                  >
                    {loading ? (
                      <Loader2 size={16} color="white" />
                    ) : (
                      <CheckCircle2 size={16} color="white" />
                    )}
                    <Text className="text-white font-medium ml-2">
                      {loading ? 'Setting up...' : 'Complete Setup'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    onPress={handlePayment}
                    disabled={isProcessingPayment}
                    className={`rounded-xl px-8 py-4 flex-row items-center shadow-lg ${
                      isProcessingPayment ? 'bg-gray-400' : 'bg-blue-600'
                    }`}
                  >
                    {isProcessingPayment ? (
                      <Loader2 size={16} color="white" />
                    ) : (
                      <CreditCard size={16} color="white" />
                    )}
                    <Text className="text-white font-medium ml-2">
                      {isProcessingPayment ? 'Processing...' : `Pay ₹${onboardingAmount}`}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Razorpay Payment Modal */}
      {paymentOrderId && (
        <RazorpayWebView
          visible={showPaymentModal}
          onClose={handlePaymentClose}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          orderId={paymentOrderId}
          amount={onboardingAmount}
          currency="INR"
          customerName={`${ownerFirstName} ${ownerLastName}`}
          customerEmail={ownerEmail}
          customerPhone={ownerPhoneNumber}
          description="Clinic Onboarding Registration Fee"
        />
      )}
    </SafeAreaView>
  );
}
