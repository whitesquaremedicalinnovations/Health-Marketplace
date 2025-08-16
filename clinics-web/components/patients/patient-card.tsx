"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Phone,
  MapPin,
  MessageSquare,
  Clock,
  MoreVertical,
  UserPlus,
  Edit,
  Trash2,
  UserX,
  Check,
  X
} from "lucide-react";
import FeedbackModal from "./feedbackModal";
import { axiosInstance } from "@/lib/axios";
import { useState } from "react";

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
  changeStatusRequests: {
    id: string;
    status: "ACTIVE" | "COMPLETED";
    hasDoctorAccepted: boolean;
    hasClinicAccepted: boolean;
  }[] | [];
  createdAt: string;
  updatedAt: string;
}

interface PatientCardProps {
  patient: Patient;
  connectedDoctorsCount: number;
  onAssignDoctor: (patient: Patient) => void;
  onAddFeedback: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patient: Patient) => void;
  onDeassignDoctor: (patientId: string, doctorId: string) => void;
  changeStatus: (patientId: string, status: "ACTIVE"|"COMPLETED") => void;
}

export default function PatientCard({
  patient,
  connectedDoctorsCount,
  onAssignDoctor,
  onAddFeedback,
  onEditPatient,
  onDeletePatient,
  onDeassignDoctor,
  changeStatus
}: PatientCardProps) {
  const [feedbacks, setFeedbacks] = useState<{id: string, feedback: string, createdAt: string}[]>([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

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

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 hover:shadow-2xl transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Patient Info */}
          <div className="flex items-start gap-3 flex-1">
            <ProfileAvatar
              src={patient.profileImage?.docUrl}
              fallback={patient.name[0]}
              className="h-12 w-12 border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900 dark:text-white truncate">
                  {patient.name}
                </h3>
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(patient.dateOfBirth)} ({getAge(patient.dateOfBirth)} years)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{patient.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{patient.address}</span>
                </div>
              </div>

              {/* Assigned Doctors */}
              <div className="mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Assigned Doctors ({patient.assignedDoctors.length})
                  </span>
                </div>
                {patient.assignedDoctors.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {patient.assignedDoctors.slice(0, 2).map((doctor) => (
                      <div key={doctor.id} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">
                        <span className="text-xs text-gray-700 dark:text-gray-300">{doctor.fullName}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeassignDoctor(patient.id, doctor.id)}
                          className="h-auto p-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <UserX className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {patient.assignedDoctors.length > 2 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{patient.assignedDoctors.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
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
              </div>
            </div>
          </div>

          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
              <DropdownMenuItem
                onClick={() => onAssignDoctor(patient)}
                disabled={connectedDoctorsCount === 0}
                className="dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Doctor
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAddFeedback(patient)}
                className="dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Feedback
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => viewFeedbacks(patient)}
                className="dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                View Feedbacks
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => changeStatus(patient.id, patient.status === "ACTIVE" ? "COMPLETED" : "ACTIVE")}
                className={`${patient.status === "ACTIVE" ? "text-green-600 dark:text-green-400 dark:hover:bg-gray-700" : "text-red-600 dark:text-red-400 dark:hover:bg-gray-700"}`}
              >
                {patient.changeStatusRequests.length > 0 && patient.changeStatusRequests[0].hasClinicAccepted ? "Requested" : 
                <>
                  {patient.status === "ACTIVE" ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />}
                  {patient.status === "ACTIVE" ? "Mark as Completed" : "Mark as Active"}
                </>
                }
              </DropdownMenuItem>
              <DropdownMenuSeparator className="dark:bg-gray-600" />
              <DropdownMenuItem
                onClick={() => onEditPatient(patient)}
                className="dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Patient
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeletePatient(patient)}
                className="text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Patient
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      <FeedbackModal feedbacks={feedbacks} onClose={() => setShowFeedbackModal(false)} open={showFeedbackModal} />
    </Card>
  );
} 