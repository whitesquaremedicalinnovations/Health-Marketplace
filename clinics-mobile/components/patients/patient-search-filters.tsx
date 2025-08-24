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
  genderFilter: string;
  setGenderFilter: (gender: string) => void;
  doctorFilter: string;
  setDoctorFilter: (doctor: string) => void;
  ageRangeFilter: string;
  setAgeRangeFilter: (ageRange: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
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
  genderFilter,
  setGenderFilter,
  doctorFilter,
  setDoctorFilter,
  ageRangeFilter,
  setAgeRangeFilter,
  sortBy,
  setSortBy,
  connectedDoctors,
  filteredCount,
  totalCount,
  onClearFilters,
}: Props) {
  return (
    <ScrollView className="bg-white rounded-lg shadow-md mb-6" showsVerticalScrollIndicator={false}>
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
          <View className="flex-1 ml-2 border border-gray-200 rounded-lg">
            <Picker
              selectedValue={genderFilter}
              onValueChange={setGenderFilter}
              style={{ height: 50 }}
            >
              <Picker.Item label="All Genders" value="all" />
              <Picker.Item label="Male" value="MALE" />
              <Picker.Item label="Female" value="FEMALE" />
              <Picker.Item label="Other" value="OTHER" />
            </Picker>
          </View>
        </View>

        {/* Second Row: Doctor Assignment and Age Range */}
        <View className="flex-row justify-between mb-4">
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
          <View className="flex-1 ml-2 border border-gray-200 rounded-lg">
            <Picker
              selectedValue={ageRangeFilter}
              onValueChange={setAgeRangeFilter}
              style={{ height: 50 }}
            >
              <Picker.Item label="All Ages" value="all" />
              <Picker.Item label="0-18 years" value="0-18" />
              <Picker.Item label="19-35 years" value="19-35" />
              <Picker.Item label="36-50 years" value="36-50" />
              <Picker.Item label="51-65 years" value="51-65" />
              <Picker.Item label="65+ years" value="65+" />
            </Picker>
          </View>
        </View>

        {/* Sort Section */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-600 mb-2">Sort by</Text>
          <View className="border border-gray-200 rounded-lg">
            <Picker selectedValue={sortBy} onValueChange={setSortBy} style={{ height: 50 }}>
              <Picker.Item label="Newest First" value="newest" />
              <Picker.Item label="Oldest First" value="oldest" />
              <Picker.Item label="Name (A-Z)" value="name" />
              <Picker.Item label="Status" value="status" />
              <Picker.Item label="Age (Oldest First)" value="age" />
              <Picker.Item label="Most Assigned Doctors" value="assignedDoctors" />
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