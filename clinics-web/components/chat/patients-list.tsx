"use client";

import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  MessageSquare
} from "lucide-react";
import { Loading } from "@/components/ui/loading";

interface ConnectedDoctor {
  id: string;
  fullName: string;
  specialization: string;
  phoneNumber: string;
  profileImage?: {
    docUrl: string;
  };
}

interface Patient {
  id: string;
  name: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  status: 'ACTIVE' | 'COMPLETED';
  assignedDoctors: {
    id: string;
    fullName: string;
  }[];
  _count: {
    feedbacks: number;
    assignedDoctors: number;
  };
  createdAt: string;
}

interface PatientsListProps {
  doctor: ConnectedDoctor;
  patients: Patient[];
  loading: boolean;
  onPatientSelect: (patient: Patient) => void;
  onBack: () => void;
}

export default function PatientsList({ 
  doctor, 
  patients, 
  loading, 
  onPatientSelect, 
  onBack 
}: PatientsListProps) {
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white dark:bg-gray-900 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <ProfileAvatar
              src={doctor.profileImage?.docUrl}
              fallback={doctor.fullName[0]}
              className="h-10 w-10"
            />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Dr. {doctor.fullName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{doctor.specialization}</p>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Select a patient to start discussing with Dr. {doctor.fullName}
        </p>
      </div>

      {/* Patients List */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loading variant="default" text="Loading patients..." />
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-16 px-4">
            <User className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No Assigned Patients</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              This doctor doesn&apos;t have any assigned patients yet.
            </p>
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => onPatientSelect(patient)}
              >
                <div className="flex items-center gap-3">
                  <ProfileAvatar
                    src=""
                    fallback={patient.name[0]}
                    className="h-12 w-12 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {patient.name}
                      </h3>
                      <Badge 
                        variant={patient.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className={`text-xs ${
                          patient.status === 'ACTIVE' 
                            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700' 
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        {patient.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{getAge(patient.dateOfBirth)} years</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{patient.phoneNumber}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {patient._count.feedbacks} feedback{patient._count.feedbacks !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 