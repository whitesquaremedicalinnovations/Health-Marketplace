import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Search, SlidersHorizontal, X } from "lucide-react-native";

interface Props {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  genderFilter: string;
  setGenderFilter: (gender: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
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
  sortBy,
  setSortBy,
  filteredCount,
  totalCount,
  onClearFilters,
}: Props) {
  return (
    <View className="bg-white p-4 rounded-lg shadow-md mb-6">
      <View className="flex-row items-center border border-gray-300 rounded-lg p-2">
        <Search color="gray" size={20} />
        <TextInput
          className="flex-1 ml-2 text-base"
          placeholder="Search by name, phone, or address"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <View className="flex-row justify-between mt-4">
        <Picker
          selectedValue={statusFilter}
          onValueChange={setStatusFilter}
          style={{ flex: 1 }}
        >
          <Picker.Item label="All Statuses" value="all" />
          <Picker.Item label="Active" value="ACTIVE" />
          <Picker.Item label="Completed" value="COMPLETED" />
        </Picker>
        <Picker
          selectedValue={genderFilter}
          onValueChange={setGenderFilter}
          style={{ flex: 1 }}
        >
          <Picker.Item label="All Genders" value="all" />
          <Picker.Item label="Male" value="MALE" />
          <Picker.Item label="Female" value="FEMALE" />
          <Picker.Item label="Other" value="OTHER" />
        </Picker>
      </View>

      <View className="mt-4">
        <Picker selectedValue={sortBy} onValueChange={setSortBy}>
          <Picker.Item label="Sort by Newest" value="newest" />
          <Picker.Item label="Sort by Oldest" value="oldest" />
          <Picker.Item label="Sort by Name" value="name" />
          <Picker.Item label="Sort by Status" value="status" />
        </Picker>
      </View>

      <View className="flex-row justify-between items-center mt-4">
        <Text>
          Showing {filteredCount} of {totalCount} patients
        </Text>
        <TouchableOpacity onPress={onClearFilters}>
          <Text className="text-blue-600">Clear Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 