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
  
  export const normalizeMessage = (message: any): ChatMessage => {
    return {
      id: message.id,
      content: message.content,
      senderId: message.senderId || message.senderClinicId || message.senderDoctorId,
      senderType: message.senderType || (message.senderDoctorId ? 'doctor' : 'clinic'),
      timestamp: message.timestamp || message.createdAt,
      read: message.read || false,
      attachments: message.attachments || [],
    };
  }; 