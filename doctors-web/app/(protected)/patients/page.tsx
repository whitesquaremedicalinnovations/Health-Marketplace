"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Loading } from "@/components/ui/loading";
import {
  Users,
  Building2,
  MessageSquare,
  Calendar,
  Phone,
  MapPin,
  Clock,
  Hospital,
  Stethoscope,
  Check,
  X
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import FeedbackModal from "@/components/chat/feedbackModal";
import { toast } from "sonner";

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
  clinic: {
    id: string;
    clinicName: string;
    clinicAddress: string;
  };
  feedbacks: {
    id: string;
    feedback: string;
    createdAt: string;
  }[];
  _count: {
    feedbacks: number;
    assignedDoctors: number;
  };
  changeStatusRequests: {
    id: string;
    status: "ACTIVE" | "COMPLETED";
    hasDoctorAccepted: boolean;
    hasClinicAccepted: boolean;
    createdAt: string;
    updatedAt: string;
  }[] | [];
  createdAt: string;
  updatedAt: string;
}

interface ConnectedClinic {
  id: string;
  connectedAt: string;
  clinic: {
    id: string;
    clinicName: string;
    clinicAddress: string;
    clinicPhoneNumber: string;
    profileImage?: string;
  };
  job: {
    id: string;
    title: string;
    description: string;
    type: string;
    specialization: string;
    location: string;
  };
}

export default function PatientsPage() {
  const { userId } = useAuth();
  
  // State management
  const [patients, setPatients] = useState<Patient[]>([]);
  const [connectedClinics, setConnectedClinics] = useState<ConnectedClinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<{id: string, feedback: string, createdAt: string}[]>([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Fetch data
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/patient/get-doctor-patients/${userId}`);
      const patientsData = response.data?.success ? response.data.data : response.data;
      setPatients(patientsData || []);
    } catch (error) {
      console.log("Error fetching patients:", error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchConnectedClinics = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/api/doctor/get-my-accepted-pitches?doctorId=${userId}`);
      const clinicsData = response.data?.success ? response.data.data.connections : response.data?.connections || [];
      setConnectedClinics(clinicsData);
    } catch (error) {
      console.log("Error fetching connected clinics:", error);
      setConnectedClinics([]);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchPatients();
      fetchConnectedClinics();
    }
  }, [userId, fetchPatients, fetchConnectedClinics]);

  // Group patients by clinic
  const patientsByClinic = patients.reduce((acc, patient) => {
    const clinicId = patient.clinic.id;
    if (!acc[clinicId]) {
      acc[clinicId] = {
        clinic: patient.clinic,
        patients: []
      };
    }
    acc[clinicId].patients.push(patient);
    return acc;
  }, {} as Record<string, { clinic: Patient['clinic']; patients: Patient[] }>);

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handlePatientChat = (patient: Patient) => {
    // Navigate to chat page with patient and clinic context
    const chatUrl = `/chat?patient=${patient.id}&clinic=${patient.clinic.id}`;
    window.location.href = chatUrl;
  };

  const viewFeedbacks = async (patient: Patient) => {
    try{
      const response = await axiosInstance.get(`/api/patient/get-patient-feedbacks/${patient.id}`);
      const feedbacks = response.data?.success ? response.data.data : response.data;
      setFeedbacks(feedbacks);
      setShowFeedbackModal(true);
    }
    catch(error){
      console.log("Error fetching feedbacks:", error);
    }
  };

  const handleChangeStatus = async (patientId: string, status: "ACTIVE"|"COMPLETED") => {
    try{
      await axiosInstance.patch(`/api/patient/update-patient-status/${patientId}`, {status, userType: "DOCTOR"});
      fetchPatients();
    }
    catch(error){
      console.log("Error changing status:", error);
      toast("Failed to change status");
    }
  }

  if (loading) {
    return <Loading variant="page" text="Loading your patients..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 shadow-2xl">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-white mb-2">
                My Patients
              </h1>
              <p className="text-blue-100 text-lg">
                View and manage patients assigned to you by connected clinics
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{patients.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Connected Clinics</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{connectedClinics.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Patients</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {patients.filter(p => p.status === 'ACTIVE').length}
                  </p>
                </div>
                <Stethoscope className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patients by Clinic */}
        <div className="space-y-8">
          {Object.keys(patientsByClinic).length === 0 ? (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
              <CardContent className="text-center py-16">
                <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No Patients Assigned</h3>
                                 <p className="text-gray-500 dark:text-gray-400 mb-6">
                   You don&apos;t have any patients assigned yet. Patients will appear here when clinics assign them to you.
                 </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(patientsByClinic).map(([clinicId, { clinic, patients: clinicPatients }]) => (
              <Card key={clinicId} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Hospital className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900 dark:text-white">
                          {clinic.clinicName}
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {clinic.clinicAddress}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {clinicPatients.length} Patient{clinicPatients.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clinicPatients.map((patient) => (
                      <Card 
                        key={patient.id} 
                        className="border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500"
                      >
                        <CardContent className="flex items-start justify-between p-4">
                          <div className=""
                            onClick={() => handlePatientChat(patient)}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <ProfileAvatar
                                src={undefined}
                                fallback={patient.name[0]}
                                className="h-10 w-10 border-2 border-gray-200 dark:border-gray-600"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                    {patient.name}
                                  </h4>
                                  <Badge 
                                    variant={patient.status === 'ACTIVE' ? 'default' : 'secondary'}
                                    className={patient.status === 'ACTIVE' 
                                      ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700' 
                                      : 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'
                                    }
                                  >
                                    {patient.status}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(patient.dateOfBirth)} ({getAge(patient.dateOfBirth)} years)</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    <span>{patient.phoneNumber}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  <span>{patient._count.feedbacks} feedbacks</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Added {formatDate(patient.createdAt)}</span>
                                </div>
                              </div>
                              <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                              <DropdownMenuItem
                                onClick={() => viewFeedbacks(patient)}
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                View Feedbacks
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={`${patient.status === "ACTIVE" ? "text-green-600 dark:text-green-400 dark:hover:bg-gray-700" : "text-red-600 dark:text-red-400 dark:hover:bg-gray-700"}`}
                              >
                                <Button variant="ghost" size="sm" className="" onClick={() => handleChangeStatus(patient.id, patient.status === "ACTIVE" ? "COMPLETED" : "ACTIVE")} disabled={patient.changeStatusRequests.length > 0 && patient.changeStatusRequests[0].hasDoctorAccepted}>
                                  {patient.changeStatusRequests.length > 0 && patient.changeStatusRequests[0].hasDoctorAccepted ? "Requested" : 
                                  <>
                                    {patient.status === "ACTIVE" ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />}
                                    {patient.status === "ACTIVE" ? "Mark as Completed" : "Mark as Active"}
                                  </>
                                }
                                </Button>
                              </DropdownMenuItem>

                            </DropdownMenuContent>
                          </DropdownMenu>  
                        </CardContent>   
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {showFeedbackModal && (
          <FeedbackModal feedbacks={feedbacks} onClose={() => setShowFeedbackModal(false)} open={showFeedbackModal} />
        )}
      </div>
    </div>
  );
}