"use client";

import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { ArrowLeft, Users, Calendar, Phone } from "lucide-react";

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

interface Patient {
  id: string;
  name: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  status: 'ACTIVE' | 'COMPLETED';
  clinic: {
    id: string;
    clinicName: string;
    clinicAddress: string;
  };
  _count: {
    feedbacks: number;
    assignedDoctors: number;
  };
  createdAt: string;
}

interface PatientsListProps {
  clinic: ConnectedClinic;
  patients: Patient[];
  loading: boolean;
  onPatientSelect: (patient: Patient) => void;
  onBack: () => void;
}

export default function PatientsList({ 
  clinic, 
  patients, 
  loading, 
  onPatientSelect, 
  onBack 
}: PatientsListProps) {
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

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-white dark:bg-gray-900 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <ProfileAvatar
              src={clinic.clinic.profileImage}
              fallback={clinic.clinic.clinicName[0]}
              className="h-10 w-10"
            />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {clinic.clinic.clinicName}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Select a patient to start discussing...
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loading variant="pulse" />
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
              No Patients Assigned
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              This clinic hasn&apos;t assigned you any patients yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {patients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => onPatientSelect(patient)}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ProfileAvatar
                    src={undefined}
                    fallback={patient.name[0]}
                    className="h-12 w-12 flex-shrink-0"
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
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{getAge(patient.dateOfBirth)} years</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{patient.phoneNumber}</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                        Added {formatDate(patient.createdAt)}
                      </p>
                    </div>
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