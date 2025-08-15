// Common enums used across the platform
export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  CLINIC = 'CLINIC'
}

export enum AuthProvider {
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  EMAIL = 'EMAIL'
}

export enum DoctorSpecialization {
  GENERAL_PHYSICIAN = 'GENERAL_PHYSICIAN',
  CARDIOLOGIST = 'CARDIOLOGIST',
  DERMATOLOGIST = 'DERMATOLOGIST',
  ENDOCRINOLOGIST = 'ENDOCRINOLOGIST',
  GYNECOLOGIST = 'GYNECOLOGIST',
  NEUROSURGEON = 'NEUROSURGEON',
  ORTHOPEDIC_SURGEON = 'ORTHOPEDIC_SURGEON',
  PLASTIC_SURGEON = 'PLASTIC_SURGEON',
  UROLOGIST = 'UROLOGIST',
  ENT_SPECIALIST = 'ENT_SPECIALIST',
  PEDIATRICIAN = 'PEDIATRICIAN',
  PSYCHIATRIST = 'PSYCHIATRIST',
  DENTIST = 'DENTIST'
}

export enum RequirementType {
  ONETIME = 'ONETIME',
  FULLTIME = 'FULLTIME',
  PARTTIME = 'PARTTIME'
}

export enum RequirementStatus {
  POSTED = 'POSTED',
  COMPLETED = 'COMPLETED'
}

export enum PitchStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING'
}

// Common interfaces
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  docUrl: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  latitude?: number;
  longitude?: number;
  address: string;
}

export interface ContactInfo {
  email: string;
  phoneNumber: string;
}

export interface ProfileImage {
  docUrl: string;
}

// Pagination
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
    validationErrors?: ValidationError[];
    timestamp: string;
    path: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
} 