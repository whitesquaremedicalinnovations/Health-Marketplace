// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/admin",
  ADMIN_BASE_PATH: "/api/admin",
} as const;

// Authentication
export const AUTH_CONFIG = {
  TOKEN_KEY: "admin_token",
  TOKEN_EXPIRY_DAYS: 7,
} as const;

// API Endpoints
export const ADMIN_ENDPOINTS = {
  LOGIN: "/login",
  LOGOUT: "/logout",
  OVERVIEW: "/get-overview",
  ALL_USERS: "/get-all-users",
  ALL_DOCTORS: "/get-all-doctors",
  ALL_CLINICS: "/get-all-clinics",
  ALL_PAYMENTS: "/get-all-payments",
  ONBOARDING_FEE: "/get-onboarding-fee",
  SET_ONBOARDING_FEE: "/set-onboarding-fee",
  VERIFY_DOCTOR: "/verify-doctor",
  VERIFY_CLINIC: "/verify-clinic",
  ALL_NEWS: "/get-all-news",
  CREATE_NEWS: "/create-news",
  UPDATE_NEWS: "/update-news",
  DELETE_NEWS: "/delete-news",
  NEWS_BY_ID: "/get-news-by-id",
  TOTAL_NEWS_LIKES: "/total-news-likes",
  TOTAL_NEWS_COMMENTS: "/total-news-comments",
  // Admin Management
  CREATE_ADMIN: "/create-admin",
  GET_ADMINS: "/get-admins",
  GET_ADMIN_BY_ID: "/get-admin",
  UPDATE_ADMIN: "/update-admin",
  CHANGE_PASSWORD: "/change-password",
  DELETE_ADMIN: "/delete-admin",
} as const; 