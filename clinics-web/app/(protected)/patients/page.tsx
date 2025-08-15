"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Plus } from "lucide-react";
import { Loading } from "@/components/ui/loading";

// Component imports
import PatientStats from "@/components/patients/patient-stats";
import PatientSearchFilters from "@/components/patients/patient-search-filters";
import PatientCard from "@/components/patients/patient-card";
import PatientForm from "@/components/patients/patient-form";
import PatientAssignmentDialog from "@/components/patients/patient-assignment-dialog";
import PatientFeedbackDialog from "@/components/patients/patient-feedback-dialog";
import PatientDeleteDialog from "@/components/patients/patient-delete-dialog";

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
  _count: {
    feedbacks: number;
    assignedDoctors: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface ConnectedDoctor {
  id: string;
  fullName: string;
  specialization: string;
  phoneNumber: string;
  profileImage?: {
    docUrl: string;
  };
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

export default function PatientsPage() {
  const { userId } = useAuth();

  // State management
  const [patients, setPatients] = useState<Patient[]>([]);
  const [connectedDoctors, setConnectedDoctors] = useState<ConnectedDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  // Selected items
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<ConnectedDoctor | null>(null);

  // Form states
  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    phoneNumber: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    latitude: "",
    longitude: ""
  });

  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPatients = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/patient/get-clinic-patients/${userId}`);
      const patientsData = response.data?.success ? response.data.data : response.data;
      setPatients(patientsData || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchConnectedDoctors = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await axiosInstance.get(`/api/clinic/connected-doctors/${userId}`);
      const doctorsData = response.data?.success ? response.data.data : response.data;
      setConnectedDoctors(doctorsData || []);
    } catch (error) {
      console.error("Error fetching connected doctors:", error);
      setConnectedDoctors([]);
    }
  }, [userId]);

  // Fetch data
  useEffect(() => {
    fetchPatients();
    fetchConnectedDoctors();
  }, [fetchPatients, fetchConnectedDoctors]);

  // Filter and sort patients
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

  // Form handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (place: google.maps.places.PlaceResult | null) => {
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
      gender: "",
      dateOfBirth: "",
      address: "",
      latitude: "",
      longitude: ""
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setGenderFilter("all");
    setSortBy("newest");
  };

  // CRUD operations
  const handleCreatePatient = async () => {
    if (!formData.name || !formData.phoneNumber || !formData.gender || !formData.dateOfBirth || !formData.address) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      await axiosInstance.post("/api/patient/create-patient", {
        ...formData,
        clinicId: userId,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null
      });
      
      setShowCreateDialog(false);
      resetForm();
      fetchPatients();
    } catch (error) {
      console.error("Error creating patient:", error);
      alert("Failed to create patient");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPatient = async () => {
    if (!selectedPatient || !formData.name || !formData.phoneNumber || !formData.gender || !formData.dateOfBirth || !formData.address) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      await axiosInstance.put(`/api/patient/update-patient/${selectedPatient.id}`, {
        ...formData,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null
      });
      
      setShowEditDialog(false);
      resetForm();
      setSelectedPatient(null);
      fetchPatients();
    } catch (error) {
      console.error("Error updating patient:", error);
      alert("Failed to update patient");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!selectedPatient) return;

    try {
      setSubmitting(true);
      await axiosInstance.delete(`/api/patient/delete-patient/${selectedPatient.id}`);
      
      setShowDeleteDialog(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (error) {
      console.error("Error deleting patient:", error);
      alert("Failed to delete patient");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignDoctor = async () => {
    if (!selectedPatient || !selectedDoctor) return;

    try {
      setSubmitting(true);
      await axiosInstance.patch(`/api/patient/assign-doctor-to-patient/${selectedPatient.id}`, {
        doctorId: selectedDoctor.id
      });
      
      setShowAssignDialog(false);
      setSelectedPatient(null);
      setSelectedDoctor(null);
      fetchPatients();
    } catch (error) {
      console.error("Error assigning doctor:", error);
      alert("Failed to assign doctor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeassignDoctor = async (patientId: string, doctorId: string) => {
    try {
      await axiosInstance.patch(`/api/patient/de-assign-doctor-from-patient/${patientId}`, {
        doctorId
      });
      fetchPatients();
    } catch (error) {
      console.error("Error deassigning doctor:", error);
      alert("Failed to deassign doctor");
    }
  };

  const handleAddFeedback = async () => {
    if (!selectedPatient || !feedbackText.trim()) {
      alert("Please enter feedback text");
      return;
    }

    try {
      setSubmitting(true);
      await axiosInstance.post(`/api/patient/add-feedback/${selectedPatient.id}`, {
        feedback: feedbackText.trim()
      });
      
      setShowFeedbackDialog(false);
      setSelectedPatient(null);
      setFeedbackText("");
      fetchPatients();
    } catch (error) {
      console.error("Error adding feedback:", error);
      alert("Failed to add feedback");
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
    return <Loading variant="page" text="Loading patients..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 shadow-2xl">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-white mb-2">
                Patient Management
              </h1>
              <p className="text-blue-100 text-lg">
                Manage your patients, assign doctors, and track their progress
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <PatientStats 
          patients={patients} 
          connectedDoctors={connectedDoctors} 
        />

        {/* Search and Filters */}
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
          onClearFilters={clearFilters}
        />

        {/* Patients List */}
        <div className="space-y-4 grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-2">
          {filteredPatients.length === 0 ? (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
              <CardContent className="text-center py-16">
                <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No Patients Found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchTerm || statusFilter !== "all" || genderFilter !== "all"
                    ? "Try adjusting your filters to see more patients"
                    : "Start by adding your first patient"
                  }
                </p>
                {!searchTerm && statusFilter === "all" && genderFilter === "all" && (
                  <div
                    onClick={() => setShowCreateDialog(true)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 text-white rounded-lg cursor-pointer transition-all"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Patient
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                connectedDoctorsCount={connectedDoctors.length}
                onAssignDoctor={openAssignDialog}
                onAddFeedback={openFeedbackDialog}
                onEditPatient={openEditDialog}
                onDeletePatient={openDeleteDialog}
                onDeassignDoctor={handleDeassignDoctor}
              />
            ))
          )}
        </div>

        {/* Dialogs */}
        <PatientForm
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          formData={formData}
          onFormDataChange={handleInputChange}
          onLocationSelect={handleLocationSelect}
          onSubmit={handleCreatePatient}
          submitting={submitting}
          mode="create"
        />

        <PatientForm
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          formData={formData}
          onFormDataChange={handleInputChange}
          onLocationSelect={handleLocationSelect}
          onSubmit={handleEditPatient}
          submitting={submitting}
          mode="edit"
        />

        <PatientAssignmentDialog
          open={showAssignDialog}
          onOpenChange={setShowAssignDialog}
          patient={selectedPatient}
          connectedDoctors={connectedDoctors}
          selectedDoctor={selectedDoctor}
          setSelectedDoctor={setSelectedDoctor}
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
      </div>
    </div>
  );
}