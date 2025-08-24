import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Calendar, Briefcase, Clock, Users, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface RequirementTypeModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function RequirementTypeModal({ isVisible, onClose }: RequirementTypeModalProps) {
  const router = useRouter();

  const handleSelection = (type: 'appointment' | 'job') => {
    if (type === 'appointment') {
      router.push('/create-appointment-requirement');
    } else {
      router.push('/create-job-requirement');
    }
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl w-11/12 max-w-md shadow-2xl">
          {/* Header */}
          <View className="p-6 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="text-2xl font-bold text-gray-900">
                What do you need?
              </Text>
              <TouchableOpacity onPress={onClose} className="p-2">
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <Text className="text-gray-600 mt-2">
              Choose the type of requirement you want to post
            </Text>
          </View>

          <ScrollView className="p-6">
            {/* Appointment Option */}
            <TouchableOpacity
              onPress={() => handleSelection('appointment')}
              className="mb-4"
            >
              <View className="border-2 border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <View className="flex-row items-start">
                  <View className="p-3 bg-blue-100 rounded-xl mr-4">
                    <Calendar size={32} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900 mb-2">
                      Appointment
                    </Text>
                    <Text className="text-gray-600 mb-3">
                      One-time consultation or medical service
                    </Text>
                    <View className="flex-row items-center">
                      <Clock size={16} color="#6b7280" />
                      <Text className="text-sm text-gray-500 ml-2">
                        Single session
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Job Option */}
            <TouchableOpacity
              onPress={() => handleSelection('job')}
              className="mb-4"
            >
              <View className="border-2 border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <View className="flex-row items-start">
                  <View className="p-3 bg-purple-100 rounded-xl mr-4">
                    <Briefcase size={32} color="#8b5cf6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900 mb-2">
                      Job Position
                    </Text>
                    <Text className="text-gray-600 mb-3">
                      Part-time or full-time employment opportunity
                    </Text>
                    <View className="flex-row items-center">
                      <Users size={16} color="#6b7280" />
                      <Text className="text-sm text-gray-500 ml-2">
                        Ongoing position
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer */}
          <View className="p-6 border-t border-gray-200">
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-100 p-3 rounded-lg"
            >
              <Text className="text-center text-gray-700 font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
} 