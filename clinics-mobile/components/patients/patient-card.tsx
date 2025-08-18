import { View, Text, TouchableOpacity, Image } from "react-native";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  MoreVertical,
  UserPlus,
  MessageSquare,
  Edit,
  Trash,
} from "lucide-react-native";

interface Patient {
  id: string;
  name: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  status: "ACTIVE" | "COMPLETED";
  profileImage?: {
    docUrl: string;
  };
  assignedDoctors: {
    id: string;
    fullName: string;
  }[];
}

interface Props {
  patient: Patient;
  onAssignDoctor: (patient: Patient) => void;
  onAddFeedback: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patient: Patient) => void;
  onDeassignDoctor: (patientId: string, doctorId: string) => void;
}

export default function PatientCard({
  patient,
  onAssignDoctor,
  onAddFeedback,
  onEditPatient,
  onDeletePatient,
  onDeassignDoctor,
}: Props) {
  return (
    <View className="bg-white rounded-lg p-4 mb-4 shadow-md">
      <View className="flex-row items-center">
        {patient.profileImage ? (
          <Image
            source={{ uri: patient.profileImage.docUrl }}
            className="w-16 h-16 rounded-full"
          />
        ) : (
          <View className="w-16 h-16 rounded-full bg-gray-200 justify-center items-center">
            <User size={32} color="#3b82f6" />
          </View>
        )}
        <View className="ml-4 flex-1">
          <Text className="text-lg font-bold">{patient.name}</Text>
          <Text
            className={`font-semibold ${
              patient.status === "ACTIVE" ? "text-green-600" : "text-gray-500"
            }`}
          >
            {patient.status}
          </Text>
        </View>
        <TouchableOpacity>
          <MoreVertical size={24} color="gray" />
        </TouchableOpacity>
      </View>

      <View className="mt-4 border-t border-gray-200 pt-2">
        <InfoRow icon={<Phone size={14} color="gray" />} text={patient.phoneNumber} />
        <InfoRow icon={<MapPin size={14} color="gray" />} text={patient.address} />
        <InfoRow
          icon={<Calendar size={14} color="gray" />}
          text={new Date(patient.dateOfBirth).toLocaleDateString()}
        />
      </View>

      <View className="mt-4">
        <Text className="font-semibold">Assigned Doctors:</Text>
        {patient.assignedDoctors.length > 0 ? (
          patient.assignedDoctors.map((doctor) => (
            <View key={doctor.id} className="flex-row justify-between items-center mt-1">
              <Text>{doctor.fullName}</Text>
              <TouchableOpacity onPress={() => onDeassignDoctor(patient.id, doctor.id)}>
                <Text className="text-red-500">De-assign</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text className="text-gray-500">No doctors assigned</Text>
        )}
      </View>

      <View className="flex-row justify-end mt-4">
        <ActionButton
          icon={<UserPlus size={20} color="#8b5cf6" />}
          onPress={() => onAssignDoctor(patient)}
        />
        <ActionButton
          icon={<MessageSquare size={20} color="#3b82f6" />}
          onPress={() => onAddFeedback(patient)}
        />
        <ActionButton
          icon={<Edit size={20} color="orange" />}
          onPress={() => onEditPatient(patient)}
        />
        <ActionButton
          icon={<Trash size={20} color="red" />}
          onPress={() => onDeletePatient(patient)}
        />
      </View>
    </View>
  );
}

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View className="flex-row items-center mt-2">
      {icon}
      <Text className="ml-2 text-gray-600">{text}</Text>
    </View>
  );
}

function ActionButton({ icon, onPress }: { icon: React.ReactNode; onPress: () => void }) {
  return (
    <TouchableOpacity className="p-2" onPress={onPress}>
      {icon}
    </TouchableOpacity>
  );
} 