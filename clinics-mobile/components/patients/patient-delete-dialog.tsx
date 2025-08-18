import { View, Text, Modal, TouchableOpacity } from "react-native";
import { X } from "lucide-react-native";

interface Patient {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  onConfirm: () => void;
  submitting: boolean;
}

export default function PatientDeleteDialog({
  open,
  onOpenChange,
  patient,
  onConfirm,
  submitting,
}: Props) {
  return (
    <Modal visible={open} transparent>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white p-6 rounded-lg w-4/5">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold">Delete Patient</Text>
            <TouchableOpacity onPress={() => onOpenChange(false)}>
              <X size={24} color="gray" />
            </TouchableOpacity>
          </View>

          <Text className="my-4">
            Are you sure you want to delete {patient?.name}? This action cannot be undone.
          </Text>

          <View className="flex-row justify-end mt-4">
            <TouchableOpacity
              className="px-4 py-2"
              onPress={() => onOpenChange(false)}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-600 px-4 py-2 rounded-md ml-2"
              onPress={onConfirm}
              disabled={submitting}
            >
              <Text className="text-white">
                {submitting ? "Deleting..." : "Delete"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
} 