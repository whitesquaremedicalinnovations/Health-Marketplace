"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Input } from "@/components/ui/input";
import {
  Search,
  MessageSquare,
  Stethoscope,
  MessageCircle
} from "lucide-react";

interface ConnectedDoctor {
  id: string;
  fullName: string;
  specialization: string;
  phoneNumber: string;
  profileImage?: {
    docUrl: string;
  };
}

interface DoctorsListProps {
  doctors: ConnectedDoctor[];
  onDoctorSelect: (doctor: ConnectedDoctor) => void;
}

export default function DoctorsList({ doctors, onDoctorSelect }: DoctorsListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter doctors based on search
  const filteredDoctors = doctors.filter(doctor =>
    doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search Header */}
      <div className="p-4 border-b bg-white dark:bg-gray-900 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Chats</h2>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-gray-800 border-0 focus:ring-1 focus:ring-green-500 dark:text-white dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Doctors List */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-16 px-4">
            <MessageSquare className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No Connected Doctors</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {searchTerm 
                ? "No doctors match your search criteria"
                : "You don&apos;t have any connected doctors yet. Accept some applications to start chatting!"
              }
            </p>
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => onDoctorSelect(doctor)}
              >
                <div className="flex items-center gap-3">
                  <ProfileAvatar
                    src={doctor.profileImage?.docUrl}
                    fallback={doctor.fullName[0]}
                    className="h-12 w-12 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        Dr. {doctor.fullName}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {/* Last message time would go here */}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 text-xs">
                        <Stethoscope className="h-2 w-2 mr-1" />
                        {doctor.specialization}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      Tap to view patients and start chatting
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
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