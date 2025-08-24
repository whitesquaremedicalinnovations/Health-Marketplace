import { axiosInstance } from "./axios";

export const getDoctor = async (doctorId: string) => {
  try {
    const response = await axiosInstance.get(`/api/doctor/get-doctor/${doctorId}`);
    return response;
  } catch (error) {
    console.log(error)
    return { status: 404, data: null };
  }
};

export const onboardingDoctor = async (data: any) => {
  try {
    const response = await axiosInstance.post("/api/user/onboarding/doctor", data);
    return response;
  } catch (error) {
    console.log("Error during doctor onboarding:", error);
    throw error;
  }
};

export const getDashboardOverview = async (userId: string) => {
  try {
    const endpoint = `/api/doctor/get-dashboard-overview/${userId}`;
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    console.log("Error fetching dashboard overview:", error);
    throw error;
  }
};

export const getRequirementsByClinic = async (clinicId: string) => {
  try {
    const response = await axiosInstance.get(`/api/clinic/get-requirements-by-clinic/${clinicId}`);
    return response.data.requirements;
  } catch (error) {
    console.log("Error fetching requirements:", error);
    throw error;
  }
};

export const getClinicPatients = async (clinicId: string) => {
  try {
    const response = await axiosInstance.get(`/api/patient/get-clinic-patients/${clinicId}`);
    return response.data?.success ? response.data.data : response.data;
  } catch (error) {
    console.log("Error fetching patients:", error);
    throw error;
  }
};

export const getDoctorPatients = async (doctorId: string) => {
  try {
    const response = await axiosInstance.get(`/api/patient/get-doctor-patients/${doctorId}`);
    return response.data?.success ? response.data.data : response.data;
  } catch (error) {
    console.log("Error fetching doctor patients:", error);
    throw error;
  }
};

export const getClinicConnections = async (clinicId: string) => {
  try {
    const response = await axiosInstance.get(`/api/clinic/get-connections/${clinicId}`);
    return response.data;
  } catch (error) {
    console.log("Error fetching clinic connections:", error);
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
    console.log("Error fetching doctors by location:", error);
    throw error;
  }
};

export const getNews = async () => {
  try {
    const response = await axiosInstance.get('/api/user/news');
    return response.data.news;
  } catch (error) {
    console.log('Error fetching news:', error);
    throw error;
  }
};

export const getChatMessages = async (chatId: string) => {
  try {
    const response = await axiosInstance.get(`/api/messages/chat/${chatId}`);
    const data = response.data?.success ? response.data.data : response.data;
    const formatted = (data.messages || []).map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderDoctorId || msg.senderClinicId || '',
      senderType: msg.senderDoctorId ? 'doctor' : 'clinic',
      timestamp: msg.createdAt,
      read: true,
      attachments: msg.attachments || [],
    }));
    return formatted;
  } catch (error) {
    console.log('Error fetching chat messages:', error);
    throw error;
  }
};

export const sendMessage = async (chatId: string, senderId: string, senderType: 'clinic' | 'doctor', content: string) => {
  try {
    const messageData = {
      chatId,
      content,
      senderId,
      senderType,
      attachments: []
    };

    const response = await axiosInstance.post('/api/chat/send-message', messageData);
    
    const realMessage = response.data?.success ? response.data.data : response.data;
    const serverMessage = {
      id: realMessage.id,
      content: realMessage.content,
      senderId: realMessage.senderDoctorId || realMessage.senderClinicId || '',
      senderType: realMessage.senderDoctorId ? 'doctor' : 'clinic',
      timestamp: realMessage.createdAt,
      read: false,
      attachments: realMessage.attachments || [],
    };
    return serverMessage;
  } catch (error) {
    console.log('Error sending message:', error);
    throw error;
  }
};

export const getOrCreateChat = async (clinicId: string, doctorId: string, patientId: string) => {
  try {
    console.log('Creating/getting chat with:', { clinicId, doctorId, patientId });
    const response = await axiosInstance.post('/api/chat/get-or-create-chat', {
      patientId,
      doctorId,
      clinicId,
    });
    const chatData = response.data?.success ? response.data.data : response.data;
    console.log('Chat created/retrieved:', chatData);
    return chatData;
  } catch (error) {
    console.log('Error getting or creating chat:', error);
    throw error;
  }
};

export const likeNews = async (newsId: string, clinicId: string) => {
  try {
    const response = await axiosInstance.post(`/api/user/news/${newsId}/like`, { clinicId });
    return response.data;
  } catch (error) {
    console.log('Error liking news:', error);
    throw error;
  }
};

export const commentOnNews = async (newsId: string, clinicId: string, content: string, parentId?: string) => {
  try {
    const response = await axiosInstance.post(`/api/user/news/${newsId}/comment`, { clinicId, content, parentId });
    return response.data;
  } catch (error) {
    console.log('Error commenting on news:', error);
    throw error;
  }
};

export const getDoctorConnections = async (doctorId: string) => {
  try {
    const response = await axiosInstance.get(`/api/doctor/get-my-accepted-pitches?doctorId=${doctorId}`);
    return response.data?.success ? response.data.data : response.data;
  } catch (error) {
    console.log("Error fetching doctor connections:", error);
    throw error;
  }
}; 