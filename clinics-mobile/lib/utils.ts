import { axiosInstance } from "./axios";

export const getClinic = async (clinicId: string) => {
  try {
    const response = await axiosInstance.get(`/api/clinic/get-clinic/${clinicId}`);
    return response;
  } catch (error) {
    console.log("Error fetching user data:", error);
    return { status: 404, data: null };
  }
};

export const onboardingClinic = async (data: any) => {
  try {
    const response = await axiosInstance.post("/api/user/onboarding/clinic", data);
    return response;
  } catch (error) {
    console.error("Error during clinic onboarding:", error);
    throw error;
  }
};

export const getDashboardOverview = async (clinicId: string) => {
  try {
    const response = await axiosInstance.get(`/api/clinic/get-dashboard-overview/${clinicId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    throw error;
  }
};

export const getRequirementsByClinic = async (clinicId: string) => {
  try {
    const response = await axiosInstance.get(`/api/clinic/get-requirements-by-clinic/${clinicId}`);
    console.log(response)
    return response.data.requirements;
  } catch (error) {
    console.error("Error fetching requirements:", error);
    throw error;
  }
};

export const getClinicPatients = async (clinicId: string) => {
  try {
    const response = await axiosInstance.get(`/api/patient/get-clinic-patients/${clinicId}`);
    return response.data?.success ? response.data.data : response.data;
  } catch (error) {
    console.error("Error fetching patients:", error);
    throw error;
  }
};

export const getClinicConnections = async (clinicId: string) => {
  try {
    const response = await axiosInstance.get(`/api/clinic/get-connections/${clinicId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching clinic connections:", error);
    throw error;
  }
};

export const getDoctorsByLocation = async (
  lat: number,
  lng: number,
  radius: number,
  experience_min: number,
  experience_max: number,
  sortBy: string,
  search: string
) => {
  try {
    const response = await axiosInstance.get(
      "/api/clinic/get-doctors-by-location",
      {
        params: {
          lat,
          lng,
          radius,
          experience_min,
          experience_max,
          sortBy,
          search,
        },
      }
    );
    return response.data.doctors;
  } catch (error) {
    console.error("Error fetching doctors by location:", error);
    throw error;
  }
};

export const getNews = async () => {
  try {
    const response = await axiosInstance.get('/api/user/news');
    return response.data.news;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

export const getChatMessages = async (chatId: string) => {
  try {
    const response = await axiosInstance.get(`/api/messages/chat/${chatId}`);
    return response.data.data.messages;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
};

export const sendMessage = async (
  chatId: string,
  senderId: string,
  senderType: "clinic" | "doctor",
  content: string,
  attachments?: any[]
) => {
  try {
    const response = await axiosInstance.post("/api/chat/send-message", {
      chatId,
      senderId,
      senderType,
      content,
      attachments: attachments || [],
    });
    return response.data.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const getOrCreateChat = async (
  clinicId: string,
  doctorId: string,
  patientId: string
) => {
  try {
    const response = await axiosInstance.post('/api/chat/get-or-create-chat', {
      clinicId,
      doctorId,
      patientId,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error getting or creating chat:', error);
    throw error;
  }
};

export const likeNews = async (newsId: string, clinicId: string) => {
  try {
    const response = await axiosInstance.post(`/api/user/news/${newsId}/like`, { clinicId });
    return response.data;
  } catch (error) {
    console.error('Error liking news:', error);
    throw error;
  }
};

export const commentOnNews = async (newsId: string, clinicId: string, content: string, parentId?: string) => {
  try {
    const response = await axiosInstance.post(`/api/user/news/${newsId}/comment`, { clinicId, content, parentId });
    return response.data;
  } catch (error) {
    console.error('Error commenting on news:', error);
    throw error;
  }
}; 