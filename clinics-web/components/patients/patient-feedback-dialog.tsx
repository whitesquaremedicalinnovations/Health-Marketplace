"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Patient {
  id: string;
  name: string;
}

interface PatientFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  feedbackText: string;
  setFeedbackText: (text: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export default function PatientFeedbackDialog({
  open,
  onOpenChange,
  patient,
  feedbackText,
  setFeedbackText,
  onSubmit,
  submitting
}: PatientFeedbackDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-900 dark:text-white">
            Add Feedback for {patient?.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Feedback *
            </label>
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Enter your feedback about this patient..."
              rows={4}
              className="dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
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
            onClick={onSubmit}
            disabled={submitting || !feedbackText.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500"
          >
            {submitting ? "Adding..." : "Add Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 