"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { UserCheck } from "lucide-react";

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
}

interface PatientAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  connectedDoctors: ConnectedDoctor[];
  selectedDoctor: ConnectedDoctor | null;
  setSelectedDoctor: (doctor: ConnectedDoctor | null) => void;
  onAssign: () => void;
  submitting: boolean;
}

export default function PatientAssignmentDialog({
  open,
  onOpenChange,
  patient,
  connectedDoctors,
  selectedDoctor,
  setSelectedDoctor,
  onAssign,
  submitting
}: PatientAssignmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-900 dark:text-white">
            Assign Doctor to {patient?.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Select a doctor from your connected doctors to assign to this patient:
          </p>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {connectedDoctors.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No connected doctors available
              </p>
            ) : (
              connectedDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedDoctor?.id === doctor.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <div className="flex items-center gap-3">
                    <ProfileAvatar
                      src={doctor.profileImage?.docUrl}
                      fallback={doctor.fullName[0]}
                      className="h-10 w-10"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {doctor.fullName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {doctor.specialization}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {doctor.phoneNumber}
                      </p>
                    </div>
                    {selectedDoctor?.id === doctor.id && (
                      <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={onAssign}
            disabled={submitting || !selectedDoctor}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500"
          >
            {submitting ? "Assigning..." : "Assign Doctor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 