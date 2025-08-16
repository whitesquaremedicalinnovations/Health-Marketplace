"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/axios";
import { Loading } from "@/components/ui/loading";
import DoctorsList from "@/components/chat/doctors-list";
import PatientsList from "@/components/chat/patients-list";
import ChatInterface from "@/components/chat/chat-interface";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

interface ConnectedDoctor {
  id: string;
  fullName: string;
  specialization: string;
  phoneNumber: string;
  profileImage?: {
    docUrl: string;
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
  assignedDoctors: {
    id: string;
    fullName: string;
  }[];
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

interface SocketMessage {
  id: string;
  content: string;
  senderClinicId?: string;
  senderDoctorId?: string;
  createdAt: string;
  attachments?: {
    url: string;
    filename: string;
    type: "image" | "video" | "audio" | "document" | "other";
  }[];
}

export default function ChatPage() {
  const { userId } = useAuth();

  // State management
  const [connectedDoctors, setConnectedDoctors] = useState<ConnectedDoctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientsLoading, setPatientsLoading] = useState(false);
  
  // Selection states
  const [selectedDoctor, setSelectedDoctor] = useState<ConnectedDoctor | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Chat states
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // View states - for mobile navigation
  const [currentView, setCurrentView] = useState<'doctors' | 'patients' | 'chat'>('doctors');

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
      
      // Don't add our own messages from Socket.IO since we already have them optimistically
      const isMyMessage = (message.senderClinicId === userId) || (message.senderDoctorId === userId);
      if (isMyMessage) {
        console.log('⚠️ Ignoring own message from Socket.IO (already added optimistically)');
        return;
      }
      
      // Format the message to match our ChatMessage interface
      const formattedMessage: ChatMessage = {
        id: message.id,
        content: message.content,
        senderId: message.senderDoctorId || message.senderClinicId || "",
        senderType: message.senderDoctorId ? 'doctor' : 'clinic',
        timestamp: message.createdAt,
        read: false,
        attachments: message.attachments || []
      };

      // Prevent duplicate messages
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

    newSocket.on('error', (error: Error) => {
      console.error('❌ Socket.IO error:', error);
      toast(error.message || 'A Socket.IO error occurred');
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Cleaning up Socket.IO connection');
      newSocket.disconnect();
    };
  }, [userId]);

  const fetchConnectedDoctors = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/clinic/connected-doctors/${userId}`);
      const doctorsData = response.data?.success ? response.data.data : response.data;
      setConnectedDoctors(doctorsData || []);
    } catch (error) {
      console.error("Error fetching connected doctors:", error);
      setConnectedDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchConnectedDoctors();
  }, [fetchConnectedDoctors]);

  const fetchPatientsForDoctor = async (doctorId: string) => {
    try {
      setPatientsLoading(true);
      const response = await axiosInstance.get(`/api/patient/get-clinic-patients/${userId}`);
      const allPatients = response.data?.success ? response.data.data : response.data;
      
      // Filter patients assigned to the selected doctor
      const filteredPatients = (allPatients || []).filter((patient: Patient) =>
        patient.assignedDoctors.some(doctor => doctor.id === doctorId)
      );
      
      setPatients(filteredPatients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    } finally {
      setPatientsLoading(false);
    }
  };

  const getOrCreateChat = async (doctorId: string, patientId: string) => {
    try {
      setMessagesLoading(true);
      
      console.log(`🔄 Creating/loading chat for doctor: ${doctorId}, patient: ${patientId}, clinic: ${userId}`);
      
      // Get or create chat
      const chatResponse = await axiosInstance.post('/api/chat/get-or-create-chat', {
        patientId,
        doctorId,
        clinicId: userId
      });

      const chatData = chatResponse.data?.success ? chatResponse.data.data : chatResponse.data;
      console.log(`💬 Chat data received:`, chatData);
      setCurrentChat(chatData);

      if (chatData && socket) {
        console.log(`🏠 Joining Socket.IO room: ${chatData.id}`);
        
        // Join the chat room
        socket.emit('join_chat', chatData.id);
        
        // Load existing messages
        console.log(`📥 Loading existing messages for chat: ${chatData.id}`);
        const messagesResponse = await axiosInstance.get(`/api/messages/chat/${chatData.id}`);
        const messagesData = messagesResponse.data?.success ? messagesResponse.data.data : messagesResponse.data;
        
        console.log(`📨 Loaded ${messagesData.messages?.length || 0} existing messages`);
        
        const formattedMessages = (messagesData.messages || []).map((msg: SocketMessage) => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.senderDoctorId || msg.senderClinicId || "",
          senderType: msg.senderDoctorId ? 'doctor' : 'clinic',
          timestamp: msg.createdAt,
          read: true, // Assuming existing messages are read
          attachments: msg.attachments
        }));

        setMessages(formattedMessages);
        console.log(`✅ Set ${formattedMessages.length} messages in state`);
      } else {
        console.error(`❌ Missing chatData or socket:`, { chatData: !!chatData, socket: !!socket });
      }
    } catch (error) {
      console.error("❌ Error creating/loading chat:", error);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleDoctorSelect = (doctor: ConnectedDoctor) => {
    setSelectedDoctor(doctor);
    setSelectedPatient(null);
    setCurrentChat(null);
    setMessages([]);
    setCurrentView('patients');
    fetchPatientsForDoctor(doctor.id);
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView('chat');
    if (selectedDoctor) {
      getOrCreateChat(selectedDoctor.id, patient.id);
    }
  };

  const handleSendMessage = async (messageContent: string, attachments?: { url: string; filename: string; type: string }[]) => {
    if (!currentChat || !selectedDoctor || !selectedPatient || !socket) {
      console.error(`❌ Cannot send message - missing requirements:`, {
        currentChat: !!currentChat,
        selectedDoctor: !!selectedDoctor,
        selectedPatient: !!selectedPatient,
        socket: !!socket
      });
      return;
    }

    // Generate optimistic message ID and timestamp
    const optimisticMessageId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Create optimistic message for instant UI update
    const optimisticMessage: ChatMessage = {
      id: optimisticMessageId,
      content: messageContent,
      senderId: userId || "",
      senderType: 'clinic',
      timestamp,
      read: false,
      attachments: (attachments || []).map(att => ({
        ...att,
        type: att.type as 'image' | 'video' | 'audio' | 'document' | 'other'
      }))
    };

    console.log(`⚡ Adding optimistic message:`, optimisticMessage);
    
    // Add optimistic message immediately to UI
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      console.log(`📤 Sending message to chat: ${currentChat.id}`);
      console.log(`📝 Message content: "${messageContent}"`);
      
      // Send message via API
      const messageData = {
        chatId: currentChat.id,
        content: messageContent,
        senderId: userId,
        senderType: 'clinic',
        attachments
      };

      console.log(`🚀 Sending message via API:`, messageData);
      const response = await axiosInstance.post('/api/chat/send-message', messageData);
      console.log(`✅ Message sent successfully via API:`, response.data);

      // Replace optimistic message with real message from server
      const realMessage = response.data?.success ? response.data.data : response.data;
      const serverMessage: ChatMessage = {
        id: realMessage.id,
        content: realMessage.content,
        senderId: realMessage.senderClinicId || realMessage.senderDoctorId,
        senderType: realMessage.senderClinicId ? 'clinic' : 'doctor',
        timestamp: realMessage.createdAt,
        read: false,
        attachments: realMessage.attachments || []
      };

      console.log(`🔄 Replacing optimistic message with server message:`, serverMessage);

      // Replace the optimistic message with the real one
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessageId ? serverMessage : msg
      ));

      console.log(`⏳ Waiting for Socket.IO to deliver to other participants...`);
    } catch (error) {
      console.error("❌ Error sending message:", error);
      
      // Remove the optimistic message on error and show error state
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessageId 
          ? { ...msg, content: `❌ Failed to send: ${msg.content}`, read: false }
          : msg
      ));
      
      toast("Failed to send message");
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
      setCurrentView('doctors');
      setSelectedDoctor(null);
      setPatients([]);
    }
  };

  if (loading) {
    return <Loading variant="page" text="Loading chat..." />;
  }

  return (
    <div className="h-[92vh] bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Mobile Layout */}
      <div className="md:hidden flex-1 flex flex-col">
        {currentView === 'doctors' && (
          <div className="flex-1 bg-white dark:bg-gray-900">
            <DoctorsList
              doctors={connectedDoctors}
              onDoctorSelect={handleDoctorSelect}
            />
          </div>
        )}
        
        {currentView === 'patients' && selectedDoctor && (
          <div className="flex-1 bg-white dark:bg-gray-900">
            <PatientsList
              doctor={selectedDoctor}
              patients={patients}
              loading={patientsLoading}
              onPatientSelect={handlePatientSelect}
              onBack={handleBack}
            />
          </div>
        )}
        
        {currentView === 'chat' && selectedDoctor && selectedPatient && (
          <div className="flex-1">
            <ChatInterface
              doctor={selectedDoctor}
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
        {/* Left Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-900 border-r dark:border-gray-700 flex flex-col">
          {!selectedDoctor ? (
            <DoctorsList
              doctors={connectedDoctors}
              onDoctorSelect={handleDoctorSelect}
            />
          ) : (
            <PatientsList
              doctor={selectedDoctor}
              patients={patients}
              loading={patientsLoading}
              onPatientSelect={handlePatientSelect}
              onBack={handleBack}
            />
          )}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedDoctor && selectedPatient ? (
            <ChatInterface
              doctor={selectedDoctor}
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
                <div className="w-64 h-64 mx-auto mb-8 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <div className="w-32 h-32 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  {!selectedDoctor ? "Select a Doctor" : "Select a Patient"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  {!selectedDoctor
                    ? "Choose a connected doctor from the list to view their assigned patients and start chatting."
                    : "Choose a patient to start discussing their case with " + selectedDoctor.fullName + "."
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