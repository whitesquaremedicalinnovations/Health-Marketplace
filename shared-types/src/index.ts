// Export all types and interfaces
export * from './entities/common';
export * from './entities/doctor';
export * from './entities/clinic';
export * from './entities/job-requirement';

// Re-export commonly used types for convenience
export type {
  ApiResponse,
  PaginatedResponse,
  PaginationMeta,
  ValidationError,
  BaseEntity,
  Document,
  Location,
  ContactInfo,
  ProfileImage
} from './entities/common';

export {
  UserRole,
  AuthProvider,
  DoctorSpecialization,
  RequirementType,
  RequirementStatus,
  PitchStatus,
  PaymentStatus
} from './entities/common'; 