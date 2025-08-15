"use client";

import { Input } from "@/components/ui/input";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Search, MessageSquare, Building2 } from "lucide-react";
import { useState } from "react";

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

interface ClinicsListProps {
  clinics: ConnectedClinic[];
  onClinicSelect: (clinic: ConnectedClinic) => void;
}

export default function ClinicsList({ clinics, onClinicSelect }: ClinicsListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClinics = clinics.filter(connection =>
    connection.clinic.clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.clinic.clinicAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-white dark:bg-gray-900 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Chats</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search clinics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-gray-800 border-0 focus:ring-1 focus:ring-green-500 dark:text-white dark:placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
        {filteredClinics.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Building2 className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
              No Connected Clinics
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              You don&apos;t have any connected clinics yet. Connected clinics will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredClinics.map((connection) => (
              <div
                key={connection.id}
                onClick={() => onClinicSelect(connection)}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <ProfileAvatar
                      src={connection.clinic.profileImage}
                      fallback={connection.clinic.clinicName[0]}
                      className="h-12 w-12"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {connection.clinic.clinicName}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(connection.connectedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
                      {connection.job.title} • {connection.job.type}
                    </p>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                      {connection.clinic.clinicAddress}
                    </p>
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