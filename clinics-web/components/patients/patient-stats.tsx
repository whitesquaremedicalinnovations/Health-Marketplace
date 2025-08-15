"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Star, UserPlus } from "lucide-react";

interface Patient {
  id: string;
  status: 'ACTIVE' | 'COMPLETED';
}

interface ConnectedDoctor {
  id: string;
}

interface PatientStatsProps {
  patients: Patient[];
  connectedDoctors: ConnectedDoctor[];
}

export default function PatientStats({ patients, connectedDoctors }: PatientStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Patients</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {patients.filter(p => p.status === 'ACTIVE').length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {patients.filter(p => p.status === 'COMPLETED').length}
              </p>
            </div>
            <Star className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Connected Doctors</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{connectedDoctors.length}</p>
            </div>
            <UserPlus className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 