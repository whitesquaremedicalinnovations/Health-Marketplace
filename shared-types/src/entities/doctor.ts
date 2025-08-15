import { BaseEntity, Document, Location, ContactInfo, ProfileImage, DoctorSpecialization } from './common';

export interface Doctor extends BaseEntity, ContactInfo, Location {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  specialization: DoctorSpecialization;
  additionalInformation?: string;
  experience: number;
  about: string;
  certifications: string[];
  isVerified: boolean;
  preferredRadius?: number;
  locationRange: number;
  profileImage?: ProfileImage;
  documents?: Document[];
}

export interface DoctorProfile extends Doctor {
  pitches?: DoctorPitch[];
  acceptedWork?: DoctorAcceptedWork[];
}

export interface DoctorPitch {
  id: string;
  status: string;
  message?: string;
  createdAt: string;
  jobRequirement: {
    id: string;
    title: string;
    clinic: {
      id: string;
      clinicName: string;
    };
  };
}

export interface DoctorAcceptedWork {
  id: string;
  connectedAt: string;
  clinic: {
    id: string;
    clinicName: string;
    profileImage?: ProfileImage;
  };
  job: {
    id: string;
    title: string;
    type: string;
  };
}

// API specific types
export interface DoctorListItem {
  id: string;
  fullName: string;
  specialization: DoctorSpecialization;
  experience: number;
  latitude?: number;
  longitude?: number;
  isVerified: boolean;
  profileImage?: ProfileImage;
}

export interface DoctorCardData extends DoctorListItem {
  about: string;
  certifications: string[];
  averageRating?: number;
  totalReviews?: number;
} 