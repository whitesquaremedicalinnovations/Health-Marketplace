import axiosInstance from './axios';
import { ADMIN_ENDPOINTS } from './constants';

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface OverviewData {
  totalDoctors: number;
  totalClinics: number;
  totalPitches: number;
  totalRequirements: number;
  totalPayments: number;
  totalAmount: { _sum: { amount: number | null } };
  totalNews: number;
  totalLikes: number;
  totalComments: number;
}

// Minimal types used by admin pages
export interface Doctor {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  isVerified: boolean;
  createdAt: string;
  specialization?: string;
  location?: string;
  experience?: string | number;
}

export interface Clinic {
  id: string;
  name?: string;
  clinicName?: string;
  email: string;
  phone?: string;
  clinicPhoneNumber?: string;
  clinicAdditionalDetails?: string;
  clinicAddress?: string;
  city?: string;
  state?: string;
  isVerified: boolean;
  createdAt: string;
  description?: string;
}

export interface UsersData {
  doctors: Doctor[];
  clinics: Clinic[];
}

export interface Payment {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  user?: { name: string };
}

export interface PaymentsData {
  payments: Payment[];
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  isPublished?: boolean;
  likes?: number;
  comments?: number;
}

export interface NewsData {
  news: NewsItem[];
}

export interface OnboardingFeeData {
  fee: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminsData {
  admins: AdminUser[];
}

// API service functions
export const adminApi = {
  // Dashboard
  getOverview: async (): Promise<OverviewData> => {
    const response = await axiosInstance.get<ApiResponse<OverviewData>>(ADMIN_ENDPOINTS.OVERVIEW);
    return response.data.data;
  },

  getAllUsers: async (): Promise<UsersData> => {
    const response = await axiosInstance.get<ApiResponse<UsersData>>(ADMIN_ENDPOINTS.ALL_USERS);
    return response.data.data;
  },

  getAllPayments: async (): Promise<PaymentsData> => {
    const response = await axiosInstance.get<ApiResponse<PaymentsData>>(ADMIN_ENDPOINTS.ALL_PAYMENTS);
    return response.data.data;
  },

  // User Management
  getAllDoctors: async (): Promise<{ doctors: Doctor[] }> => {
    const response = await axiosInstance.get<ApiResponse<{ doctors: Doctor[] }>>(ADMIN_ENDPOINTS.ALL_DOCTORS);
    return response.data.data;
  },

  getAllClinics: async (): Promise<{ clinics: Clinic[] }> => {
    const response = await axiosInstance.get<ApiResponse<{ clinics: Clinic[] }>>(ADMIN_ENDPOINTS.ALL_CLINICS);
    return response.data.data;
  },

  verifyDoctor: async (doctorId: string) => {
    const response = await axiosInstance.post<ApiResponse<{ doctor: Doctor }>>(`${ADMIN_ENDPOINTS.VERIFY_DOCTOR}/${doctorId}`);
    return response.data.data;
  },

  verifyClinic: async (clinicId: string) => {
    const response = await axiosInstance.post<ApiResponse<{ clinic: Clinic }>>(`${ADMIN_ENDPOINTS.VERIFY_CLINIC}/${clinicId}`);
    return response.data.data;
  },

  // News Management
  getAllNews: async (): Promise<NewsData> => {
    const response = await axiosInstance.get<ApiResponse<NewsData>>(ADMIN_ENDPOINTS.ALL_NEWS);
    return response.data.data;
  },

  getNewsById: async (newsId: string): Promise<{ news: NewsItem }> => {
    const response = await axiosInstance.get<ApiResponse<{ news: NewsItem }>>(`${ADMIN_ENDPOINTS.NEWS_BY_ID}/${newsId}`);
    return response.data.data;
  },

  createNews: async (newsData: {
    title: string;
    content: string;
    imageUrl?: string;
    adminId: string;
  }) => {
    const response = await axiosInstance.post<ApiResponse<{ news: NewsItem }>>(ADMIN_ENDPOINTS.CREATE_NEWS, newsData);
    return response.data.data;
  },

  updateNews: async (newsId: string, newsData: {
    title: string;
    content: string;
    imageUrl?: string;
  }) => {
    const response = await axiosInstance.post<ApiResponse<{ news: NewsItem }>>(`${ADMIN_ENDPOINTS.UPDATE_NEWS}/${newsId}`, newsData);
    return response.data.data;
  },

  deleteNews: async (newsId: string) => {
    const response = await axiosInstance.post<ApiResponse<{ news: NewsItem }>>(`${ADMIN_ENDPOINTS.DELETE_NEWS}/${newsId}`);
    return response.data.data;
  },

  // Settings
  getOnboardingFee: async (): Promise<OnboardingFeeData> => {
    const response = await axiosInstance.get<ApiResponse<{ onboardingFee: { id: string; fee: number } | null }>>(ADMIN_ENDPOINTS.ONBOARDING_FEE);
    const data = response.data.data;
    return { fee: data.onboardingFee?.fee ?? 0 };
  },

  setOnboardingFee: async (fee: number) => {
    const response = await axiosInstance.post<ApiResponse<{ onboardingFee: { id: string; fee: number } }>>(ADMIN_ENDPOINTS.SET_ONBOARDING_FEE, { fee });
    return response.data.data;
  },

  // Admin Management
  createAdmin: async (adminData: {
    email: string;
    password: string;
    name: string;
    role?: 'admin' | 'super_admin';
  }) => {
    const response = await axiosInstance.post<ApiResponse<{ admin: AdminUser }>>(ADMIN_ENDPOINTS.CREATE_ADMIN, adminData);
    return response.data.data;
  },

  getAllAdmins: async (): Promise<AdminsData> => {
    const response = await axiosInstance.get<ApiResponse<AdminsData>>(ADMIN_ENDPOINTS.GET_ADMINS);
    return response.data.data;
  },

  getAdminById: async (adminId: string) => {
    const response = await axiosInstance.get<ApiResponse<{ admin: AdminUser }>>(`${ADMIN_ENDPOINTS.GET_ADMIN_BY_ID}/${adminId}`);
    return response.data.data;
  },

  updateAdmin: async (adminId: string, updateData: {
    name?: string;
    role?: 'admin' | 'super_admin';
  }) => {
    const response = await axiosInstance.put<ApiResponse<{ admin: AdminUser }>>(`${ADMIN_ENDPOINTS.UPDATE_ADMIN}/${adminId}`, updateData);
    return response.data.data;
  },

  changePassword: async (adminId: string, passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await axiosInstance.post<ApiResponse<{ success: boolean }>>(`${ADMIN_ENDPOINTS.CHANGE_PASSWORD}/${adminId}`, passwordData);
    return response.data.data;
  },

  deleteAdmin: async (adminId: string) => {
    const response = await axiosInstance.delete<ApiResponse<{ success: boolean }>>(`${ADMIN_ENDPOINTS.DELETE_ADMIN}/${adminId}`);
    return response.data.data;
  },
};