import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StyleSheet,
  Alert,
  Modal,
  FlatList
} from "react-native";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import GooglePlacesAutocomplete from "@/components/ui/google-places-autocomplete";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from '@/contexts/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';

interface PatientFormData {
  name: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  latitude: string;
  longitude: string;
  medicalProcedure: string;
}

interface FormErrors {
  name?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
}

interface PatientFormProps {
  formData: PatientFormData;
  onFormDataChange: (field: string, value: string) => void;
  onLocationSelect: (place: any) => void;
  onSubmit: () => void;
  submitting: boolean;
  mode: "create" | "edit";
}

export default function PatientForm({
  formData,
  onFormDataChange,
  onLocationSelect,
  onSubmit,
  submitting,
  mode,
}: PatientFormProps) {
  const { colors } = useTheme();
  const [errors, setErrors] = useState<FormErrors>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const isEdit = mode === 'edit';

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.dateOfBirth = 'Date of birth must be in the past';
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit();
    } else {
      Alert.alert('Validation Error', 'Please fix the errors before submitting');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      onFormDataChange("dateOfBirth", selectedDate.toISOString().split('T')[0]);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const genderOptions = [
    { label: 'Male', value: 'MALE' },
    { label: 'Female', value: 'FEMALE' },
    { label: 'Other', value: 'OTHER' }
  ];

  const getGenderLabel = (value: string) => {
    return genderOptions.find(option => option.value === value)?.label || 'Select Gender';
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 16,
    },
    card: {
      backgroundColor: '#FFFFFF',
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: 20,
      textAlign: 'center',
    },
    fieldContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: '#000000',
      marginBottom: 6,
    },
    requiredLabel: {
      color: '#EF4444',
    },
    input: {
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 6,
      padding: 10,
      fontSize: 16,
      color: '#000000',
      backgroundColor: '#FFFFFF',
    },
    inputFocused: {
      borderColor: '#2563EB',
    },
    inputError: {
      borderColor: '#EF4444',
    },
    errorText: {
      color: '#EF4444',
      fontSize: 14,
      marginTop: 4,
    },
    pickerButton: {
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 6,
      padding: 10,
      backgroundColor: '#FFFFFF',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pickerButtonError: {
      borderColor: '#EF4444',
    },
    pickerText: {
      fontSize: 16,
      color: '#000000',
    },
    pickerPlaceholder: {
      color: '#9CA3AF',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      padding: 16,
      width: '80%',
      maxHeight: '60%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: 16,
      textAlign: 'center',
    },
    optionItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    optionText: {
      fontSize: 16,
      color: '#000000',
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    locationContainer: {
      marginTop: 4,
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <Text style={styles.title}>
            {isEdit ? 'Edit Patient' : 'Add New Patient'}
          </Text>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Full Name <Text style={styles.requiredLabel}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors.name && styles.inputError
              ]}
              placeholder="Enter patient's full name"
              placeholderTextColor="#9CA3AF"
              value={formData.name}
              onChangeText={(value) => {
                onFormDataChange("name", value);
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: undefined }));
                }
              }}
              autoCapitalize="words"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Phone Number <Text style={styles.requiredLabel}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors.phoneNumber && styles.inputError
              ]}
              placeholder="Enter phone number"
              placeholderTextColor="#9CA3AF"
              value={formData.phoneNumber}
              onChangeText={(value) => {
                onFormDataChange("phoneNumber", value);
                if (errors.phoneNumber) {
                  setErrors(prev => ({ ...prev, phoneNumber: undefined }));
                }
              }}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Gender <Text style={styles.requiredLabel}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.pickerButton,
                errors.gender && styles.pickerButtonError
              ]}
              onPress={() => setShowGenderPicker(true)}
            >
              <Text style={[
                styles.pickerText,
                !formData.gender && styles.pickerPlaceholder
              ]}>
                {formData.gender ? getGenderLabel(formData.gender) : 'Select gender'}
              </Text>
              <Text style={styles.pickerText}>▼</Text>
            </TouchableOpacity>
            {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Date of Birth <Text style={styles.requiredLabel}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.pickerButton,
                errors.dateOfBirth && styles.pickerButtonError
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[
                styles.pickerText,
                !formData.dateOfBirth && styles.pickerPlaceholder
              ]}>
                {formData.dateOfBirth ? formatDate(formData.dateOfBirth) : 'Select date of birth'}
              </Text>
              <Text style={styles.pickerText}>📅</Text>
            </TouchableOpacity>
            {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Address <Text style={styles.requiredLabel}>*</Text>
            </Text>
            <View style={styles.locationContainer}>
              <GooglePlacesAutocomplete 
                onPlaceSelect={onLocationSelect}
                value={formData.address}
                onChange={(value) => onFormDataChange("address", value)}
                placeholder="Enter patient's address"
                error={!!errors.address}
              />
            </View>
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Medical Procedure</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter medical procedure (optional)"
              placeholderTextColor="#9CA3AF"
              value={formData.medicalProcedure}
              onChangeText={(value) => onFormDataChange("medicalProcedure", value)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => {
                // Handle cancel - you might want to add navigation back
                Alert.alert('Cancel', 'Are you sure you want to cancel?', [
                  { text: 'No', style: 'cancel' },
                  { text: 'Yes', onPress: () => {/* Navigate back */} }
                ]);
              }}
              style={{ flex: 1 }}
            />
            <Button
              title={submitting 
                ? (isEdit ? "Updating..." : "Creating...") 
                : (isEdit ? "Update Patient" : "Create Patient")
              }
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
              style={{ flex: 1 }}
            />
          </View>
        </Card>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Gender Picker Modal */}
      <Modal
        visible={showGenderPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            <FlatList
              data={genderOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    onFormDataChange("gender", item.value);
                    setShowGenderPicker(false);
                    if (errors.gender) {
                      setErrors(prev => ({ ...prev, gender: undefined }));
                    }
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setShowGenderPicker(false)}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
} 