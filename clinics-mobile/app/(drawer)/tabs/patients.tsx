import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useCallback, useEffect, useState } from "react";

import { useUser } from "@clerk/clerk-expo";
import Toast from "react-native-toast-message";

import PatientAssignmentDialog from "../../../components/patients/patient-assignment-dialog";
import PatientCard from "../../../components/patients/patient-card";
import PatientDeleteDialog from "../../../components/patients/patient-delete-dialog";
import PatientFeedbackDialog from "../../../components/patients/patient-feedback-dialog";
import PatientForm from "../../../components/patients/patient-form";
import PatientSearchFilters from "../../../components/patients/patient-search-filters";
import PatientStats from "../../../components/patients/patient-stats";
import { axiosInstance } from "../../../lib/axios";

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

  const [patients, setPatients] = useState<Patient[]>([]);
  const [connectedDoctors, setConnectedDoctors] = useState<ConnectedDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    phoneNumber: "",
    gender: "MALE",
    dateOfBirth: "",
    address: "",
    latitude: "",
    longitude: ""
  });

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

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = searchTerm === "" ||
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNumber.includes(searchTerm) ||
      patient.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
    const matchesGender = genderFilter === "all" || patient.gender === genderFilter;
    return matchesSearch && matchesStatus && matchesGender;
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
      default:
        return 0;
    }
  });
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (place: any) => {
    if (place) {
      setFormData(prev => ({
        ...prev,
        address: place.formatted_address || "",
        latitude: place.geometry?.location?.lat()?.toString() || "",
        longitude: place.geometry?.location?.lng()?.toString() || ""
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phoneNumber: "",
      gender: "MALE",
      dateOfBirth: "",
      address: "",
      latitude: "",
      longitude: ""
    });
  };

  const handleCreatePatient = async () => {
    setSubmitting(true);
    try {
      await axiosInstance.post("/api/patient/create-patient", { ...formData, clinicId: user?.id });
      fetchPatients();
      setShowCreateDialog(false);
      resetForm();
      Toast.show({ type: 'success', text1: 'Patient created successfully' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to create patient' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPatient = async () => {
    if (!selectedPatient) return;
    setSubmitting(true);
    try {
      await axiosInstance.put(`/api/patient/update-patient/${selectedPatient.id}`, formData);
      fetchPatients();
      setShowEditDialog(false);
      resetForm();
      Toast.show({ type: 'success', text1: 'Patient updated successfully' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to update patient' });
    } finally {
      setSubmitting(false);
    }
  };

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
  
  const openEditDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name,
      phoneNumber: patient.phoneNumber,
      gender: patient.gender,
      dateOfBirth: patient.dateOfBirth.split('T')[0],
      address: patient.address,
      latitude: patient.latitude?.toString() || "",
      longitude: patient.longitude?.toString() || ""
    });
    setShowEditDialog(true);
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
      <PatientStats patients={patients} connectedDoctors={connectedDoctors} />
      <PatientSearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        genderFilter={genderFilter}
        setGenderFilter={setGenderFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filteredCount={filteredPatients.length}
        totalCount={patients.length}
        onCreatePatient={() => setShowCreateDialog(true)}
        onClearFilters={() => {
            setSearchTerm("");
            setStatusFilter("all");
            setGenderFilter("all");
            setSortBy("newest");
        }}
      />
      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PatientCard
            patient={item}
            onAssignDoctor={openAssignDialog}
            onAddFeedback={openFeedbackDialog}
            onEditPatient={openEditDialog}
            onDeletePatient={openDeleteDialog}
            onDeassignDoctor={handleDeassignDoctor}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      
      <Modal visible={showCreateDialog} transparent>
          <PatientForm
            formData={formData}
            onFormDataChange={handleInputChange}
            onLocationSelect={handleLocationSelect}
            onSubmit={handleCreatePatient}
            submitting={submitting}
            mode="create"
          />
      </Modal>

      <Modal visible={showEditDialog} transparent>
          <PatientForm
            formData={formData}
            onFormDataChange={handleInputChange}
            onLocationSelect={handleLocationSelect}
            onSubmit={handleEditPatient}
            submitting={submitting}
            mode="edit"
          />
      </Modal>
      
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