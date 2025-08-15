"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LocationSearch from "@/components/ui/location-search";
import { APIProvider } from "@vis.gl/react-google-maps";

interface PatientFormData {
  name: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  latitude: string;
  longitude: string;
}

interface PatientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PatientFormData;
  onFormDataChange: (field: string, value: string) => void;
  onLocationSelect: (place: google.maps.places.PlaceResult | null) => void;
  onSubmit: () => void;
  submitting: boolean;
  mode: 'create' | 'edit';
}

export default function PatientForm({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onLocationSelect,
  onSubmit,
  submitting,
  mode
}: PatientFormProps) {
  const isEdit = mode === 'edit';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-900 dark:text-white">
            {isEdit ? 'Edit Patient' : 'Add New Patient'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => onFormDataChange("name", e.target.value)}
                placeholder="Enter patient's full name"
                className="dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number *
              </label>
              <Input
                value={formData.phoneNumber}
                onChange={(e) => onFormDataChange("phoneNumber", e.target.value)}
                placeholder="Enter phone number"
                className="dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender *
              </label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => onFormDataChange("gender", value)}
              >
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date of Birth *
              </label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => onFormDataChange("dateOfBirth", e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address *
            </label>
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
              <LocationSearch
                onPlaceSelect={onLocationSelect}
                value={formData.address}
                onChange={(value) => onFormDataChange("address", value)}
              />
            </APIProvider>
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
            disabled={submitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500"
          >
            {submitting 
              ? (isEdit ? "Updating..." : "Creating...") 
              : (isEdit ? "Update Patient" : "Create Patient")
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 