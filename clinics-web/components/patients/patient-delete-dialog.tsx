"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Patient {
  id: string;
  name: string;
}

interface PatientDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  onConfirm: () => void;
  submitting: boolean;
}

export default function PatientDeleteDialog({
  open,
  onOpenChange,
  patient,
  onConfirm,
  submitting
}: PatientDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-900 dark:text-white">
            Delete Patient
          </DialogTitle>
        </DialogHeader>
        
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete <strong>{patient?.name}</strong>? This action cannot be undone.
        </p>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {submitting ? "Deleting..." : "Delete Patient"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 