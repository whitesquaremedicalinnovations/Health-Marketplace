import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { setAuthCookie } from "./set-auth-cookie"
import { axiosInstance } from "./axios"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//get user from db
export const getUser = async (id: string) => {
  try {
    const user = await axiosInstance.get(`/api/clinic/get-clinic/${id}`)
    console.log("user", user)
    return {status: user.status, data: user.data}
  } catch (error) {
    console.error("Error fetching user:", error)
    // Return error status so the calling code can handle it
    return {status: 404, data: null}
  }
}

export const onboardingClinic = async (data: {
  clinicId: string;
  ownerName: string;
  ownerPhoneNumber: string;
  email: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhoneNumber: string;
  clinicAdditionalDetails: string;
  clinicProfileImage: string | null;
  documents: string[];
  location: { lat: number; lng: number; } | null;
  preferredRadius: number;
}) => {
  try {
    console.log("data", data)  
    const user = await axiosInstance.post("/api/user/onboarding/clinic", data)
    if(user.status === 200){
      setAuthCookie("onboarded", "true")
      return {status: user.status, data: user.data}
    }
    return {status: user.status, data: user.data}
  } catch (error) {
    console.error("Error during clinic onboarding:", error)
    return {status: 500, data: null}
  }
}