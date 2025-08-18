import { View, Text } from "react-native";
import { Users, UserCheck, UserPlus } from "lucide-react-native";

interface Patient {
  id: string;
  status: "ACTIVE" | "COMPLETED";
}

interface ConnectedDoctor {
  id: string;
}

interface Props {
  patients: Patient[];
  connectedDoctors: ConnectedDoctor[];
}

export default function PatientStats({ patients, connectedDoctors }: Props) {
  const totalPatients = patients.length;
  const activePatients = patients.filter((p) => p.status === "ACTIVE").length;
  const doctorsAvailable = connectedDoctors.length;

  return (
    <View className="mb-6">
      <View className="flex-row justify-between gap-4">
        <StatCard
          icon={<Users color="#3b82f6" size={24} />}
          label="Total Patients"
          value={totalPatients}
        />
        <StatCard
          icon={<UserCheck color="#10b981" size={24} />}
          label="Active Cases"
          value={activePatients}
        />
        <StatCard
          icon={<UserPlus color="#8b5cf6" size={24} />}
          label="Doctors Available"
          value={doctorsAvailable}
        />
      </View>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <View className="flex-1 bg-white p-4 rounded-lg shadow-md items-center">
      {icon}
      <Text className="text-2xl font-bold mt-2">{value}</Text>
      <Text className="text-gray-500">{label}</Text>
    </View>
  );
} 