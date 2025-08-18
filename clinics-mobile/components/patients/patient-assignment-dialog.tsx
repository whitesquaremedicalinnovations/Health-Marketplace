import { View, Text, Modal, TouchableOpacity, FlatList } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { X } from "lucide-react-native";
import { useState } from "react";

interface Patient {
  id: string;
  name: string;
}

interface ConnectedDoctor {
  id: string;
  fullName: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  connectedDoctors: ConnectedDoctor[];
  onAssign: (doctorId: string) => void;
  submitting: boolean;
}

export default function PatientAssignmentDialog({
  open,
  onOpenChange,
  patient,
  connectedDoctors,
  onAssign,
  submitting,
}: Props) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  return (
    <Modal visible={open} transparent>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white p-6 rounded-lg w-4/5">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold">Assign Doctor to {patient?.name}</Text>
            <TouchableOpacity onPress={() => onOpenChange(false)}>
              <X size={24} color="gray" />
            </TouchableOpacity>
          </View>

          <Picker
            selectedValue={selectedDoctorId}
            onValueChange={(itemValue) => setSelectedDoctorId(itemValue)}
            style={{ marginVertical: 20 }}
          >
            <Picker.Item label="Select a doctor" value={null} />
            {connectedDoctors.map((doctor) => (
              <Picker.Item key={doctor.id} label={doctor.fullName} value={doctor.id} />
            ))}
          </Picker>

          <TouchableOpacity
            onPress={() => onAssign(selectedDoctorId!)}
            disabled={!selectedDoctorId || submitting}
            className="bg-blue-600 p-3 rounded-md"
          >
            <Text className="text-white text-center font-bold">
              {submitting ? "Assigning..." : "Assign Doctor"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
} 