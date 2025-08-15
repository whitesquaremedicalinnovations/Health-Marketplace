import { BaseEntity, DoctorSpecialization, RequirementType, RequirementStatus, PitchStatus, ProfileImage } from './common';

export interface JobRequirement extends BaseEntity {
  title: string;
  description: string;
  location: string;
  specialization?: DoctorSpecialization;
  additionalInformation?: string;
  date?: string;
  type: RequirementType;
  requirementStatus: RequirementStatus;
  clinicId: string;
  clinic?: {
    id: string;
    clinicName: string;
    clinicAddress: string;
    profileImage?: ProfileImage;
  };
  pitches?: Pitch[];
  pitchCount?: number;
}

export interface Pitch extends BaseEntity {
  doctorId: string;
  jobRequirementId: string;
  message?: string;
  status: PitchStatus;
  doctor?: {
    id: string;
    fullName: string;
    specialization: DoctorSpecialization;
    experience: number;
    profileImage?: ProfileImage;
  };
  jobRequirement?: {
    id: string;
    title: string;
    type: RequirementType;
    clinic: {
      id: string;
      clinicName: string;
      profileImage?: ProfileImage;
    };
  };
}

export interface AcceptedWork extends BaseEntity {
  doctorId: string;
  clinicId: string;
  jobId: string;
  connectedAt: string;
  doctor?: {
    id: string;
    fullName: string;
    specialization: DoctorSpecialization;
  };
  clinic?: {
    id: string;
    clinicName: string;
    profileImage?: ProfileImage;
  };
  job?: {
    id: string;
    title: string;
    type: RequirementType;
  };
}

// API specific types
export interface JobRequirementListItem {
  id: string;
  title: string;
  description: string;
  type: RequirementType;
  specialization?: DoctorSpecialization;
  date?: string;
  location: string;
  requirementStatus: RequirementStatus;
  createdAt: string;
  clinicName: string;
  clinicProfileImage?: ProfileImage;
  pitchCount: number;
  hasUserApplied?: boolean;
}

export interface JobRequirementDetail extends JobRequirement {
  clinic: {
    id: string;
    clinicName: string;
    clinicAddress: string;
    clinicPhoneNumber: string;
    ownerName: string;
    profileImage?: ProfileImage;
    isVerified: boolean;
  };
  pitches: Pitch[];
} 