import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { setAuthCookie } from "./set-auth-cookie"
import { axiosInstance } from "./axios"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//get doctor from db
export const getUser = async (id: string) => {
  try {
    const user = await axiosInstance.get(`/api/doctor/get-doctor/${id}`)
    console.log("user", user)
    return {status: user.status, data: user.data}
  } catch (error) {
    console.error("Error fetching user:", error)
    // Return error status so the calling code can handle it
    return {status: 404, data: null}
  }
}

export const onboardingDoctor = async (data: {
  doctorId: string;
  email: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  specialization: string;
  additionalInformation: string;
  experience: number;
  about: string;
  certifications: string[];
  profileImage: string | null;
  documents: string[];
  locationRange: number;
  location: { lat: number; lng: number; } | null;
  preferredRadius: number;
}) => {
  try {
    console.log("data", data)  
    const user = await axiosInstance.post("/api/user/onboarding/doctor", data)
    if(user.status === 200){
      setAuthCookie("onboarded", "true")
      return {status: user.status, data: user.data}
    }
    return {status: user.status, data: user.data}
  } catch (error) {
    console.error("Error during doctor onboarding:", error)
    return {status: 500, data: null}
  }
}