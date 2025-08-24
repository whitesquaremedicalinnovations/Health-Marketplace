import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import Toast from "react-native-toast-message";
import PatientAssignmentDialog from "../../../components/patients/patient-assignment-dialog";
import PatientCard from "../../../components/patients/patient-card";
import PatientDeleteDialog from "../../../components/patients/patient-delete-dialog";
import PatientFeedbackDialog from "../../../components/patients/patient-feedback-dialog";
import PatientSearchFilters from "../../../components/patients/patient-search-filters";
import { axiosInstance } from "../../../lib/axios";
import { Filter, Plus } from "lucide-react-native";
import { useRouter } from "expo-router";

interface Patient {
  id: string;
  name: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  latitude?: number;
  longitude?: number;
  status: 'ACTIVE' | 'COMPLETED';
  clinicId: string;
  profileImage?: {
    docUrl: string;
  };
  assignedDoctors: {
    id: string;
    fullName: string;
  }[];
  feedbacks: {
    id: string;
    feedback: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface ConnectedDoctor {
  id: string;
  fullName: string;
}

interface PatientFormData {
  name: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  latitude: string;
  longitude: string;
}

export default function PatientsScreen() {
  const { user } = useUser();
  const router = useRouter();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [connectedDoctors, setConnectedDoctors] = useState<ConnectedDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [ageRangeFilter, setAgeRangeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const fetchPatients = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await axiosInstance.get(`/api/patient/get-clinic-patients/${user.id}`);
      setPatients(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    }
  }, [user]);

  const fetchConnectedDoctors = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await axiosInstance.get(`/api/clinic/connected-doctors/${user.id}`);
      setConnectedDoctors(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching connected doctors:", error);
      setConnectedDoctors([]);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPatients(), fetchConnectedDoctors()]).finally(() => setLoading(false));
  }, [fetchPatients, fetchConnectedDoctors]);
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchPatients(), fetchConnectedDoctors()]).finally(() => setRefreshing(false));
  }, [fetchPatients, fetchConnectedDoctors]);

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = searchTerm === "" ||
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNumber.includes(searchTerm) ||
      patient.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
    const matchesGender = genderFilter === "all" || patient.gender === genderFilter;
    
    // Doctor filter - check if patient is assigned to the selected doctor
    const matchesDoctor = doctorFilter === "all" || 
      (doctorFilter === "unassigned" && patient.assignedDoctors.length === 0) ||
      patient.assignedDoctors.some(doctor => doctor.id === doctorFilter);
    
    // Age range filter
    let matchesAgeRange = true;
    if (ageRangeFilter !== "all") {
      const age = calculateAge(patient.dateOfBirth);
      switch (ageRangeFilter) {
        case "0-18":
          matchesAgeRange = age <= 18;
          break;
        case "19-35":
          matchesAgeRange = age >= 19 && age <= 35;
          break;
        case "36-50":
          matchesAgeRange = age >= 36 && age <= 50;
          break;
        case "51-65":
          matchesAgeRange = age >= 51 && age <= 65;
          break;
        case "65+":
          matchesAgeRange = age > 65;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesGender && matchesDoctor && matchesAgeRange;
  }).sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "name":
        return a.name.localeCompare(b.name);
      case "status":
        return a.status.localeCompare(b.status);
      case "age":
        return calculateAge(b.dateOfBirth) - calculateAge(a.dateOfBirth);
      case "assignedDoctors":
        return b.assignedDoctors.length - a.assignedDoctors.length;
      default:
        return 0;
    }
  });
  
  const handleDeletePatient = async () => {
    if (!selectedPatient) return;
    setSubmitting(true);
    try {
      await axiosInstance.delete(`/api/patient/delete-patient/${selectedPatient.id}`);
      fetchPatients();
      setShowDeleteDialog(false);
      Toast.show({ type: 'success', text1: 'Patient deleted successfully' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to delete patient' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignDoctor = async (doctorId: string) => {
    if (!selectedPatient) return;
    setSubmitting(true);
    try {
      await axiosInstance.patch(`/api/patient/assign-doctor-to-patient/${selectedPatient.id}`, { doctorId });
      fetchPatients();
      setShowAssignDialog(false);
      Toast.show({ type: 'success', text1: 'Doctor assigned successfully' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to assign doctor' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeassignDoctor = async (patientId: string, doctorId: string) => {
    setSubmitting(true);
    try {
        await axiosInstance.patch(`/api/patient/de-assign-doctor-from-patient/${patientId}`, { doctorId });
        fetchPatients();
        Toast.show({ type: 'success', text1: 'Doctor de-assigned successfully' });
    } catch (error) {
        Toast.show({ type: 'error', text1: 'Failed to de-assign doctor' });
    } finally {
        setSubmitting(false);
    }
  };
  
  const handleAddFeedback = async () => {
    if (!selectedPatient || !feedbackText.trim()) return;
    setSubmitting(true);
    try {
        await axiosInstance.post(`/api/patient/add-feedback/${selectedPatient.id}`, { feedback: feedbackText.trim() });
        fetchPatients();
        setShowFeedbackDialog(false);
        setFeedbackText("");
        Toast.show({ type: 'success', text1: 'Feedback added successfully' });
    } catch (error) {
        Toast.show({ type: 'error', text1: 'Failed to add feedback' });
    } finally {
        setSubmitting(false);
    }
  };
  
  const openEditPage = (patient: Patient) => {
    router.push(`/patients/edit/${patient.id}`);
  };
  
  const openAssignDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowAssignDialog(true);
  };
  
  const openFeedbackDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowFeedbackDialog(true);
  };

  const openDeleteDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDeleteDialog(true);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text>Loading patients...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold">Patients</Text>
        <View className="flex-row">
          <TouchableOpacity onPress={() => router.push('/create-patient')} className="p-2">
            <Plus size={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)} className="p-2 relative">
            <Filter size={24} color={showFilters ? "#2563EB" : "gray"} />
            {/* Active filters indicator */}
            {(searchTerm !== "" || statusFilter !== "all" || genderFilter !== "all" || doctorFilter !== "all" || ageRangeFilter !== "all" || sortBy !== "newest") && (
              <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {showFilters && (
        <PatientSearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          doctorFilter={doctorFilter}
          setDoctorFilter={setDoctorFilter}
          connectedDoctors={connectedDoctors}
          filteredCount={filteredPatients.length}
          totalCount={patients.length}
          onClearFilters={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setGenderFilter("all");
              setDoctorFilter("all");
              setAgeRangeFilter("all");
              setSortBy("newest");
          }}
        />
      )}
      
      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PatientCard
            patient={item}
            onAssignDoctor={openAssignDialog}
            onAddFeedback={openFeedbackDialog}
            onEditPatient={openEditPage}
            onDeletePatient={openDeleteDialog}
            onDeassignDoctor={handleDeassignDoctor}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      
      <PatientAssignmentDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        patient={selectedPatient}
        connectedDoctors={connectedDoctors}
        onAssign={handleAssignDoctor}
        submitting={submitting}
      />
      
      <PatientFeedbackDialog
        open={showFeedbackDialog}
        onOpenChange={setShowFeedbackDialog}
        patient={selectedPatient}
        feedbackText={feedbackText}
        setFeedbackText={setFeedbackText}
        onSubmit={handleAddFeedback}
        submitting={submitting}
      />

      <PatientDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        patient={selectedPatient}
        onConfirm={handleDeletePatient}
        submitting={submitting}
      />
    </View>
  );
} 