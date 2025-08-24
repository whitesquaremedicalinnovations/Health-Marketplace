import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Search, SlidersHorizontal, X } from "lucide-react-native";

interface ConnectedDoctor {
  id: string;
  fullName: string;
}

interface Props {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  doctorFilter: string;
  setDoctorFilter: (doctor: string) => void;
  connectedDoctors: ConnectedDoctor[];
  filteredCount: number;
  totalCount: number;
  onClearFilters: () => void;
}

export default function PatientSearchFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  doctorFilter,
  setDoctorFilter,
  connectedDoctors,
  filteredCount,
  totalCount,
  onClearFilters,
}: Props) {
  return (
    <ScrollView className="bg-white rounded-lg shadow-md mb-6 h-full" showsVerticalScrollIndicator={false}>
      <View className="p-4">
        {/* Search Bar */}
        <View className="flex-row items-center border border-gray-300 rounded-lg p-2 mb-4">
          <Search color="gray" size={20} />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search by name, phone, or address"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Filter Section Header */}
        <View className="flex-row items-center mb-4">
          <SlidersHorizontal size={18} color="#6B7280" />
          <Text className="ml-2 text-base font-semibold text-gray-700">Filters</Text>
        </View>

        {/* First Row: Status and Gender */}
        <View className="flex-row justify-between mb-4">
          <View className="flex-1 mr-2 border border-gray-200 rounded-lg">
            <Picker
              selectedValue={statusFilter}
              onValueChange={setStatusFilter}
              style={{ height: 50 }}
            >
              <Picker.Item label="All Statuses" value="all" />
              <Picker.Item label="Active" value="ACTIVE" />
              <Picker.Item label="Completed" value="COMPLETED" />
            </Picker>
          </View>

          <View className="flex-1 mr-2 border border-gray-200 rounded-lg">
            <Picker
              selectedValue={doctorFilter}
              onValueChange={setDoctorFilter}
              style={{ height: 50 }}
            >
              <Picker.Item label="All Assignments" value="all" />
              <Picker.Item label="Unassigned" value="unassigned" />
              {connectedDoctors.map((doctor) => (
                <Picker.Item 
                  key={doctor.id} 
                  label={doctor.fullName} 
                  value={doctor.id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Results and Clear Filters */}
        <View className="flex-row justify-between items-center pt-4 border-t border-gray-200">
          <View>
            <Text className="text-base font-medium text-gray-800">
              {filteredCount} of {totalCount} patients
            </Text>
            {filteredCount !== totalCount && (
              <Text className="text-sm text-gray-500">
                {totalCount - filteredCount} filtered out
              </Text>
            )}
          </View>
          <TouchableOpacity 
            onPress={onClearFilters}
            className="bg-gray-100 px-4 py-2 rounded-lg"
          >
            <View className="flex-row items-center">
              <X size={16} color="#6B7280" />
              <Text className="ml-1 text-gray-600 font-medium">Clear</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
} 