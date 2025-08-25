import axios from './axios';

// Types
export interface DashboardStats {
  totalDoctors: number;
  totalClinics: number;
  totalPitches: number;
  totalRequirements: number;
  totalPayments: number;
  totalAmount: { _sum: { amount: number } };
  totalNews: number;
  totalLikes: number;
  totalComments: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profilePicture?: string;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor extends User {
  specialization?: string;
  experience?: string;
  qualifications?: string;
  location?: string;
  documents?: any[];
}

export interface Clinic extends User {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  description?: string;
  facilities?: string[];
  documents?: any[];
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  type: string;
  status: string;
  razorpayPaymentId?: string;
  createdAt: string;
  user?: User;
}

// API Functions
export const adminApi = {
  // Dashboard
  async getOverview(): Promise<DashboardStats> {
    const response = await axios.get('/api/admin/get-overview');
    return response.data;
  },

  // Users Management
  async getAllUsers(): Promise<{ doctors: Doctor[]; clinics: Clinic[] }> {
    const response = await axios.get('/api/admin/get-all-users');
    return response.data;
  },

  async getAllDoctors(): Promise<{ doctors: Doctor[] }> {
    const response = await axios.get('/api/admin/get-all-doctors');
    return response.data;
  },

  async getAllClinics(): Promise<{ clinics: Clinic[] }> {
    const response = await axios.get('/api/admin/get-all-clinics');
    return response.data;
  },

  async getUsersToVerify(): Promise<{ doctors: Doctor[]; clinics: Clinic[] }> {
    const response = await axios.get('/api/admin/get-users-to-verify');
    return response.data;
  },

  async verifyDoctor(doctorId: string): Promise<void> {
    await axios.post(`/api/admin/verify-doctor/${doctorId}`);
  },

  async verifyClinic(clinicId: string): Promise<void> {
    await axios.post(`/api/admin/verify-clinic/${clinicId}`);
  },

  // Payments
  async getAllPayments(): Promise<{ payments: Payment[] }> {
    const response = await axios.get('/api/admin/get-all-payments');
    return response.data;
  },

  async getOnboardingFee(): Promise<{ fee: number }> {
    const response = await axios.get('/api/admin/get-onboarding-fee');
    return response.data;
  },

  async setOnboardingFee(fee: number): Promise<void> {
    await axios.post('/api/admin/set-onboarding-fee', { fee });
  },

  // News Management
  async getAllNews(): Promise<{ news: NewsItem[] }> {
    const response = await axios.get('/api/admin/get-all-news');
    return response.data;
  },

  async getNewsById(newsId: string): Promise<NewsItem> {
    const response = await axios.get(`/api/admin/get-news-by-id/${newsId}`);
    return response.data;
  },

  async createNews(newsData: {
    title: string;
    content: string;
    imageUrl?: string;
    isPublished?: boolean;
  }): Promise<NewsItem> {
    const response = await axios.post('/api/admin/create-news', newsData);
    return response.data;
  },

  async updateNews(
    newsId: string,
    newsData: {
      title?: string;
      content?: string;
      imageUrl?: string;
      isPublished?: boolean;
    }
  ): Promise<NewsItem> {
    const response = await axios.post(`/api/admin/update-news/${newsId}`, newsData);
    return response.data;
  },

  async deleteNews(newsId: string): Promise<void> {
    await axios.post(`/api/admin/delete-news/${newsId}`);
  },

  async getNewsLikes(newsId: string): Promise<{ totalLikes: number }> {
    const response = await axios.get(`/api/admin/total-news-likes/${newsId}`);
    return response.data;
  },

  async getNewsComments(newsId: string): Promise<{ totalComments: number }> {
    const response = await axios.get(`/api/admin/total-news-comments/${newsId}`);
    return response.data;
  },

  // Requirements and Pitches
  async getAllRequirements(): Promise<any> {
    const response = await axios.get('/api/admin/get-all-requirements');
    return response.data;
  },

  async getAllPitches(): Promise<any> {
    const response = await axios.get('/api/admin/get-all-pitches');
    return response.data;
  },
};