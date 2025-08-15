import { BaseEntity, Document, Location, ContactInfo, ProfileImage } from './common';
import { JobRequirement } from './job-requirement';

export interface Clinic extends BaseEntity, ContactInfo, Location {
  clinicName: string;
  ownerName: string;
  ownerPhoneNumber: string;
  clinicPhoneNumber: string;
  clinicAdditionalDetails?: string;
  isVerified: boolean;
  preferredRadius?: number;
  profileImage?: ProfileImage;
  documents?: Document[];
}

export interface ClinicProfile extends Clinic {
  jobRequirements?: JobRequirement[];
  reviews?: ClinicReview[];
  galleryImages?: ClinicGalleryImage[];
  averageRating?: number;
  totalReviews?: number;
}

export interface ClinicReview {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  doctor: {
    id: string;
    fullName: string;
    specialization: string;
    profileImage?: ProfileImage;
  };
}

export interface ClinicGalleryImage {
  id: string;
  imageUrl: string;
  caption?: string;
  isActive: boolean;
  createdAt: string;
}

// API specific types
export interface ClinicListItem {
  id: string;
  clinicName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  isVerified: boolean;
  profileImage?: ProfileImage;
  openPositionsCount: number;
}

export interface ClinicCardData extends ClinicListItem {
  clinicAdditionalDetails?: string;
  averageRating?: number;
  totalReviews?: number;
  recentJobRequirements?: Array<{
    id: string;
    title: string;
    type: string;
    specialization?: string;
  }>;
}

export interface ClinicDashboardData {
  totalRequirements: number;
  totalPitches: number;
  totalAccepted: number;
  requirementsByStatus: Array<{
    requirementStatus: string;
    _count: { requirementStatus: number };
  }>;
  pitchesByStatus: Array<{
    status: string;
    _count: { status: number };
  }>;
  recentPitches: Array<{
    id: string;
    status: string;
    createdAt: string;
    doctor: {
      fullName: string;
      specialization: string;
      profileImage?: ProfileImage;
    };
    jobRequirement: {
      title: string;
    };
  }>;
} 