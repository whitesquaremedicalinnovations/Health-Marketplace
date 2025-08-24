"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Briefcase, Clock, Users } from "lucide-react";

interface RequirementTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RequirementTypeModal({ isOpen, onClose }: RequirementTypeModalProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<"appointment" | "job" | null>(null);

  const handleSelection = (type: "appointment" | "job") => {
    setSelectedType(type);
    if (type === "appointment") {
      router.push("/requirements/new/appointment");
    } else {
      router.push("/requirements/new/job");
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            What do you need?
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Choose the type of requirement you want to post
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 mt-6">
          {/* Appointment Option */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
              selectedType === "appointment" 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-200 hover:border-blue-300"
            }`}
            onClick={() => handleSelection("appointment")}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Appointment
                  </h3>
                  <p className="text-gray-600 mb-3">
                    One-time consultation or medical service
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Single session</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Option */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
              selectedType === "job" 
                ? "border-purple-500 bg-purple-50" 
                : "border-gray-200 hover:border-purple-300"
            }`}
            onClick={() => handleSelection("job")}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Briefcase className="h-8 w-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Job Position
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Part-time or full-time employment opportunity
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>Ongoing position</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 