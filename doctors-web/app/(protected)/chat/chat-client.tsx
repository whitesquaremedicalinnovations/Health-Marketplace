"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import { Loading } from "@/components/ui/loading";
import ClinicsList from "@/components/chat/clinics-list";
import PatientsList from "@/components/chat/patients-list";
import ChatInterface from "@/components/chat/chat-interface";
import { io, Socket } from "socket.io-client";

interface ConnectedClinic {
  id: string;
  connectedAt: string;
  clinic: {
    id: string;
    clinicName: string;
    clinicAddress: string;
    clinicPhoneNumber: string;
    profileImage?: string;
  };
  job: {
    id: string;
    title: string;
    description: string;
    type: string;
    specialization: string;
    location: string;
  };
}

interface Patient {
  id: string;
  name: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  status: 'ACTIVE' | 'COMPLETED';
  clinic: {
    id: string;
    clinicName: string;
    clinicAddress: string;
  };
  _count: {
    feedbacks: number;
    assignedDoctors: number;
  };
  createdAt: string;
}

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderType: 'clinic' | 'doctor';
  timestamp: string;
  read: boolean;
  attachments?: {
    url: string;
    filename: string;
    type: 'image' | 'video' | 'audio' | 'document' | 'other';
  }[];
}

interface SocketMessage {
  id: string;
  content: string;
  senderDoctorId?: string;
  senderClinicId?: string;
  createdAt: string;
  attachments?: {
    url: string;
    filename: string;
    type: 'image' | 'video' | 'audio' | 'document' | 'other';
  }[];
}

interface SocketError {
  message: string;
}

interface Chat {
  id: string;
  patientId: string;
  patient: {
    id: string;
    name: string;
    phoneNumber: string;
    status: string;
  };
  participants: {
    id: string;
    doctorId?: string;
    clinicId?: string;
    doctor?: {
      id: string;
      fullName: string;
      specialization: string;
    };
    clinic?: {
      id: string;
      clinicName: string;
      clinicAddress: string;
    };
  }[];
  _count: {
    messages: number;
  };
  lastMessageAt?: string;
  createdAt: string;
}

export default function ChatClient() {
  const { userId } = useAuth();
  const searchParams = useSearchParams();

  // State management
  const [connectedClinics, setConnectedClinics] = useState<ConnectedClinic[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientsLoading, setPatientsLoading] = useState(false);
  
  // Selection states
  const [selectedClinic, setSelectedClinic] = useState<ConnectedClinic | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Chat states
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // View states - for mobile navigation
  const [currentView, setCurrentView] = useState<'clinics' | 'patients' | 'chat'>('clinics');

  // Initialize Socket.IO connection
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    console.log('Connecting to Socket.IO server at:', backendUrl);
    
    const newSocket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000
    });
    
    newSocket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.IO server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
    });

    newSocket.on('receive_message', (message: SocketMessage) => {
      console.log('📨 Received message via Socket.IO:', message);
      
      const isMyMessage = (message.senderDoctorId === userId) || (message.senderClinicId === userId);
      if (isMyMessage) {
        console.log('⚠️ Ignoring own message from Socket.IO (already added optimistically)');
        return;
      }
      
      const formattedMessage: ChatMessage = {
        id: message.id,
        content: message.content,
        senderId: message.senderDoctorId || message.senderClinicId || '',
        senderType: message.senderDoctorId ? 'doctor' : 'clinic',
        timestamp: message.createdAt,
        read: false,
        attachments: message.attachments || []
      };

      setMessages(prev => {
        const exists = prev.some(msg => msg.id === formattedMessage.id);
        if (exists) {
          console.log('⚠️ Message already exists, skipping duplicate');
          return prev;
        }
        console.log('✅ Adding new message from other participant to state');
        return [...prev, formattedMessage];
      });
    });

    newSocket.on('error', (error: SocketError) => {
      console.error('❌ Socket.IO error:', error);
      alert(error.message || 'A Socket.IO error occurred');
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Cleaning up Socket.IO connection');
      newSocket.disconnect();
    };
  }, [userId]);

  const getOrCreateChat = useCallback(async (clinicId: string, patientId: string) => {
    try {
      setMessagesLoading(true);
      
      const chatResponse = await axiosInstance.post('/api/chat/get-or-create-chat', {
        patientId,
        doctorId: userId,
        clinicId
      });

      const chatData = chatResponse.data?.success ? chatResponse.data.data : chatResponse.data;
      setCurrentChat(chatData);

      if (chatData && socket) {
        socket.emit('join_chat', chatData.id);
        
        const messagesResponse = await axiosInstance.get(`/api/messages/chat/${chatData.id}`);
        const messagesData = messagesResponse.data?.success ? messagesResponse.data.data : messagesResponse.data;
        
        const formattedMessages = (messagesData.messages || []).map((msg: SocketMessage) => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.senderDoctorId || msg.senderClinicId || '',
          senderType: msg.senderDoctorId ? 'doctor' : 'clinic' as const,
          timestamp: msg.createdAt,
          read: true,
          attachments: msg.attachments || []
        }));

        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Error creating/loading chat:", error);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, [userId, socket]);

  const handlePatientSelect = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView('chat');
    if (selectedClinic) {
      getOrCreateChat(selectedClinic.clinic.id, patient.id);
    }
  }, [selectedClinic, getOrCreateChat]);

  const fetchPatientsForClinic = useCallback(async (clinicId: string) => {
    try {
      setPatientsLoading(true);
      const response = await axiosInstance.get(`/api/patient/get-clinic-patients/${clinicId}`);
      const allPatients = response.data.patients || [];
      
      const filteredPatients = (allPatients || []).filter((patient: Patient) =>
        patient.clinic.id === clinicId
      );
      
      setPatients(filteredPatients);
      
      const patientId = searchParams.get('patient');
      if (patientId) {
        const patient = filteredPatients.find((p: Patient) => p.id === patientId);
        if (patient) {
          handlePatientSelect(patient);
        }
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    } finally {
      setPatientsLoading(false);
    }
  }, [searchParams, handlePatientSelect]);

  const fetchConnectedClinics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/doctor/get-my-accepted-pitches?doctorId=${userId}`);
      const clinicsData = response.data?.success ? response.data.data.connections : response.data?.connections || [];
      setConnectedClinics(clinicsData);
    } catch (error) {
      console.error("Error fetching connected clinics:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleClinicSelect = useCallback((clinic: ConnectedClinic) => {
    setSelectedClinic(clinic);
    setSelectedPatient(null);
    setCurrentChat(null);
    setMessages([]);
    setCurrentView('patients');
    fetchPatientsForClinic(clinic.clinic.id);
  }, [fetchPatientsForClinic]);

  const handleSendMessage = async (messageContent: string, attachments?: { url: string; filename: string; type: string }[]) => {
    if (!currentChat || !selectedClinic || !selectedPatient || !socket) return;

    const optimisticMessageId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const optimisticMessage: ChatMessage = {
      id: optimisticMessageId,
      content: messageContent,
      senderId: userId || "",
      senderType: 'doctor',
      timestamp,
      read: false,
      attachments: (attachments || []).map(att => ({
        ...att,
        type: att.type as 'image' | 'video' | 'audio' | 'document' | 'other'
      }))
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const messageData = {
        chatId: currentChat.id,
        content: messageContent,
        senderId: userId,
        senderType: 'doctor',
        attachments
      };

      const response = await axiosInstance.post('/api/chat/send-message', messageData);
      
      const realMessage = response.data?.success ? response.data.data : response.data;
      const serverMessage: ChatMessage = {
        id: realMessage.id,
        content: realMessage.content,
        senderId: realMessage.senderDoctorId || realMessage.senderClinicId || '',
        senderType: realMessage.senderDoctorId ? 'doctor' : 'clinic',
        timestamp: realMessage.createdAt,
        read: false,
        attachments: realMessage.attachments || []
      };

      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessageId ? serverMessage : msg
      ));
    } catch (error) {
      console.error("❌ Error sending message:", error);
      
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessageId 
          ? { ...msg, content: `❌ Failed to send: ${msg.content}`, read: false }
          : msg
      ));
      
      alert("Failed to send message");
    }
  };

  const handleBack = () => {
    if (currentView === 'chat') {
      setCurrentView('patients');
      setSelectedPatient(null);
      setCurrentChat(null);
      setMessages([]);
      if (socket && currentChat) {
        socket.emit('leave_chat', currentChat.id);
      }
    } else if (currentView === 'patients') {
      setCurrentView('clinics');
      setSelectedClinic(null);
      setPatients([]);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchConnectedClinics();
    }
  }, [userId, fetchConnectedClinics]);

  useEffect(() => {
    if (connectedClinics.length > 0 && !selectedClinic) {
      handleClinicSelect(connectedClinics[0]);
    }
  }, [connectedClinics, selectedClinic, handleClinicSelect]);

  useEffect(() => {
    const patientId = searchParams.get('patient');
    const clinicId = searchParams.get('clinic');
    
    if (patientId && clinicId && connectedClinics.length > 0) {
      const clinic = connectedClinics.find(c => c.clinic.id === clinicId);
      if (clinic) {
        handleClinicSelect(clinic);
      }
    }
  }, [searchParams, connectedClinics, handleClinicSelect]);

  if (loading) {
    return <Loading variant="page" text="Loading chat..." />;
  }

  return (
    <div className="h-[92vh] bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Mobile Layout */}
      <div className="md:hidden flex-1 flex flex-col">
        {currentView === 'clinics' && (
          <div className="flex-1 bg-white dark:bg-gray-900">
            <ClinicsList
              clinics={connectedClinics}
              onClinicSelect={handleClinicSelect}
            />
          </div>
        )}
        
        {currentView === 'patients' && selectedClinic && (
          <div className="flex-1 bg-white dark:bg-gray-900">
            <PatientsList
              clinic={selectedClinic}
              patients={patients}
              loading={patientsLoading}
              onPatientSelect={handlePatientSelect}
              onBack={handleBack}
            />
          </div>
        )}
        
        {currentView === 'chat' && selectedClinic && selectedPatient && (
          <div className="flex-1">
            <ChatInterface
              clinic={selectedClinic}
              patient={selectedPatient}
              messages={messages}
              messagesLoading={messagesLoading}
              onSendMessage={handleSendMessage}
              onBack={handleBack}
              currentUserId={userId || ""}
            />
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1">
        <div className="w-80 bg-white dark:bg-gray-900 border-r dark:border-gray-700 flex flex-col">
          {!selectedClinic ? (
            <ClinicsList
              clinics={connectedClinics}
              onClinicSelect={handleClinicSelect}
            />
          ) : (
            <PatientsList
              clinic={selectedClinic}
              patients={patients}
              loading={patientsLoading}
              onPatientSelect={handlePatientSelect}
              onBack={handleBack}
            />
          )}
        </div>

        <div className="flex-1 flex flex-col">
          {selectedClinic && selectedPatient ? (
            <ChatInterface
              clinic={selectedClinic}
              patient={selectedPatient}
              messages={messages}
              messagesLoading={messagesLoading}
              onSendMessage={handleSendMessage}
              onBack={handleBack}
              currentUserId={userId || ""}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center p-8">
                <div className="w-64 h-64 mx-auto mb-8 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <div className="w-32 h-32 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  {!selectedClinic ? "Select a Clinic" : "Select a Patient"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  {!selectedClinic
                    ? "Choose a connected clinic from the list to view their assigned patients and start chatting."
                    : "Choose a patient to start discussing their case with " + selectedClinic.clinic.clinicName + "."
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 