// Re-export from shared types package
// TODO: Install @health-platform/shared-types package
export enum DoctorSpecialization {
  GENERAL_PHYSICIAN = "GENERAL_PHYSICIAN",
  CARDIOLOGIST = "CARDIOLOGIST",
  DERMATOLOGIST = "DERMATOLOGIST",
  ENDOCRINOLOGIST = "ENDOCRINOLOGIST",
  GYNECOLOGIST = "GYNECOLOGIST",
  NEUROSURGEON = "NEUROSURGEON",
  ORTHOPEDIC_SURGEON = "ORTHOPEDIC_SURGEON",
  PLASTIC_SURGEON = "PLASTIC_SURGEON",
  UROLOGIST = "UROLOGIST",
  ENT_SPECIALIST = "ENT_SPECIALIST",
  PEDIATRICIAN = "PEDIATRICIAN",
  PSYCHIATRIST = "PSYCHIATRIST",
  DENTIST = "DENTIST",
}

// Additional frontend-specific types
export interface ClinicFormData {
  clinicName: string;
  ownerName: string;
  ownerPhoneNumber: string;
  clinicPhoneNumber: string;
  clinicAddress: string;
  email: string;
  clinicAdditionalDetails?: string;
  profileImage?: File;
  documents?: File[];
  location?: {
    lat: number;
    lng: number;
  };
}

export interface DoctorFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  specialization: DoctorSpecialization;
  experience: number;
  about: string;
  additionalInformation?: string;
  certifications: string[];
  profileImage?: File;
  documents?: File[];
  locationRange: number;
  location?: {
    lat: number;
    lng: number;
  };
  preferredRadius?: number;
}