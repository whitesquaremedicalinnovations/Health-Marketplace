"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  Check, 
  CheckCheck,
  Building2,
  User,
  Calendar,
  Download,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  ExternalLink
} from "lucide-react";
import AttachmentModal from "./attachment-modal";
import { toast } from "sonner";

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

interface ChatInterfaceProps {
  clinic: ConnectedClinic;
  patient: Patient;
  messages: ChatMessage[];
  messagesLoading: boolean;
  onSendMessage: (messageContent: string, attachments?: { url: string; filename: string; type: string }[]) => void;
  onBack: () => void;
  currentUserId: string;
}

export default function ChatInterface({
  clinic,
  patient,
  messages,
  messagesLoading,
  onSendMessage,
  onBack,
  currentUserId
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("");
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const isMyMessage = (message: ChatMessage) => {
    return message.senderId === currentUserId;
  };

  const handleSendMessage = () => {
    if(patient.status === 'COMPLETED'){
      toast.error("Patient is completed");
      return;
    }
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const handleSendWithAttachments = (files: File[], urls: string[]) => {
    if(patient.status === 'COMPLETED'){
      toast.error("Patient is completed");
      return;
    }
    const attachments = files.map((file, index) => ({
      url: urls[index],
      filename: file.name,
      type: getFileType(file)
    }));

    const messageContent = newMessage.trim() || `Sent ${files.length} file${files.length !== 1 ? 's' : ''}`;
    onSendMessage(messageContent, attachments);
    setNewMessage("");
  };

  const getFileType = (file: File): string => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) return 'document';
    return 'other';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'audio': return Music;
      case 'document': return FileText;
      default: return File;
    }
  };

  const renderAttachment = (attachment: { url: string; filename: string; type: string }, isMine: boolean) => {
    const IconComponent = getFileIcon(attachment.type);

    if (attachment.type === 'image') {
      return (
        <div className="mt-2">
          <Image
            src={attachment.url}
            alt={attachment.filename}
            width={320}
            height={320}
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(attachment.url, '_blank')}
          />
        </div>
      );
    }

    return (
      <div className={`mt-2 p-3 rounded-lg border ${
        isMine 
          ? 'bg-green-400/20 border-green-300/30' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded flex items-center justify-center ${
            isMine 
              ? 'bg-green-300/30' 
              : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <IconComponent className={`h-5 w-5 ${
              isMine 
                ? 'text-green-200' 
                : 'text-gray-600 dark:text-gray-300'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${
              isMine 
                ? 'text-green-100' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {attachment.filename}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(attachment.url, '_blank')}
              className={`p-1 h-auto ${
                isMine 
                  ? 'text-green-200 hover:text-green-100 hover:bg-green-400/20' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const link = document.createElement('a');
                link.href = attachment.url;
                link.download = attachment.filename;
                link.click();
              }}
              className={`p-1 h-auto ${
                isMine 
                  ? 'text-green-200 hover:text-green-100 hover:bg-green-400/20' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [date: string]: ChatMessage[] }, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-[92vh] bg-gray-50 dark:bg-gray-900">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              <ProfileAvatar
                src={clinic.clinic.profileImage}
                fallback={clinic.clinic.clinicName[0]}
                className="h-10 w-10"
              />
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {clinic.clinic.clinicName}
                </h3>
                <span className="text-gray-400 dark:text-gray-500">•</span>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{patient.name}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{getAge(patient.dateOfBirth)} years old</span>
                </div>
                <Badge 
                  variant={patient.status === 'ACTIVE' ? 'default' : 'secondary'}
                  className={patient.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700' 
                    : 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'
                  }
                >
                  {patient.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loading variant="pulse" />
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs">
                  {date}
                </div>
              </div>

              {/* Messages for this date */}
              {dateMessages.map((message) => (
                <div key={message.id} className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl my-1 ${
                    isMyMessage(message)
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md shadow-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    
                    {message.attachments && message.attachments.map((attachment, attachIndex) => (
                      <div key={attachIndex}>
                        {renderAttachment(attachment, isMyMessage(message))}
                      </div>
                    ))}
                    
                    <div className={`flex items-center justify-end gap-1 mt-1 ${
                      isMyMessage(message) ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <span className="text-xs">{formatTime(message.timestamp)}</span>
                      {isMyMessage(message) && (
                        message.read ? (
                          <CheckCheck className="h-3 w-3" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4">
        <div className="flex items-end gap-2">
          {patient.status!=="COMPLETED" && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAttachmentModal(true)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          )}
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="pr-12 py-3 rounded-full border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || patient.status==="COMPLETED"}
            className={`p-3 rounded-full ${
              newMessage.trim() 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
            }`}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Attachment Modal */}
      <AttachmentModal 
        open={showAttachmentModal} 
        onOpenChange={setShowAttachmentModal} 
        onSend={handleSendWithAttachments} 
      />
    </div>
  );
} 