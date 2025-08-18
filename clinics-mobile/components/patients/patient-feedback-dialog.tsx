import { View, Text, Modal, TouchableOpacity, TextInput } from "react-native";
import { X } from "lucide-react-native";

interface Patient {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  feedbackText: string;
  setFeedbackText: (text: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export default function PatientFeedbackDialog({
  open,
  onOpenChange,
  patient,
  feedbackText,
  setFeedbackText,
  onSubmit,
  submitting,
}: Props) {
  return (
    <Modal visible={open} transparent>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white p-6 rounded-lg w-4/5">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold">Add Feedback for {patient?.name}</Text>
            <TouchableOpacity onPress={() => onOpenChange(false)}>
              <X size={24} color="gray" />
            </TouchableOpacity>
          </View>

          <TextInput
            className="border border-gray-300 p-2 rounded-md h-24 mt-4"
            placeholder="Write feedback..."
            multiline
            value={feedbackText}
            onChangeText={setFeedbackText}
          />

          <TouchableOpacity
            onPress={onSubmit}
            disabled={!feedbackText.trim() || submitting}
            className="bg-blue-600 p-3 rounded-md mt-4"
          >
            <Text className="text-white text-center font-bold">
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
} 