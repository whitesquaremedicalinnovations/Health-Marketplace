"use client";

import { useEffect, useState, useCallback } from "react";
import { axiosInstance } from "@/lib/axios";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, Users, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface OngoingPatient {
  id: string;
  name: string;
  phoneNumber: string;
  status: 'ACTIVE' | 'COMPLETED';
  assignedDoctors: {
    id: string;
    fullName: string;
  }[];
  lastChatActivity?: string;
  unreadMessages?: number;
  profileImage?: {
    docUrl: string;
  };
}

interface PatientChatOverviewProps {
  userId: string | null | undefined;
  onPatientClick: (patientId: string) => void;
}

export default function PatientChatOverview({ userId, onPatientClick }: PatientChatOverviewProps) {
  const [ongoingPatients, setOngoingPatients] = useState<OngoingPatient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOngoingPatients = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/patient/get-clinic-patients/${userId}`);
      const allPatients = response.data?.success ? response.data.data : response.data;
      
      // Filter for active patients only and limit to 3 most recent
      const activePatients = (allPatients || [])
        .filter((patient: OngoingPatient) => patient.status === 'ACTIVE')
        .slice(0, 3);
      
      setOngoingPatients(activePatients);
    } catch (error) {
      console.error("Error fetching ongoing patients:", error);
      setOngoingPatients([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOngoingPatients();
  }, [fetchOngoingPatients]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (ongoingPatients.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <MessageSquare className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm">No active patients</p>
        <p className="text-gray-400 text-xs mt-1">Patient chats will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ongoingPatients.map((patient) => (
        <div
          key={patient.id}
          className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100 cursor-pointer hover:shadow-md transition-all duration-200 group"
          onClick={() => onPatientClick(patient.id)}
        >
          <ProfileAvatar
            src={patient.profileImage?.docUrl}
            fallback={patient.name[0]}
            size="md"
            profileId={patient.id}
            className="shadow-sm"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-gray-900 truncate">
                {patient.name}
              </p>
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                Active
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{patient.assignedDoctors.length} doctor{patient.assignedDoctors.length !== 1 ? 's' : ''}</span>
              </div>
              
              {patient.lastChatActivity && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(patient.lastChatActivity).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            {patient.assignedDoctors.length > 0 && (
              <p className="text-xs text-gray-400 mt-1 truncate">
                With: {patient.assignedDoctors.map(d => d.fullName).join(", ")}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {patient.unreadMessages && patient.unreadMessages > 0 && (
              <Badge variant="destructive" className="text-xs">
                {patient.unreadMessages}
              </Badge>
            )}
            <MessageSquare className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
        </div>
      ))}
      
      {ongoingPatients.length >= 3 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={() => onPatientClick("")}
        >
          View all patients <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      )}
    </div>
  );
}