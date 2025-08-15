"use client";

import { useState, useRef, useEffect } from "react";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Send,
  Paperclip,
  MoreVertical,
  Check,
  CheckCheck,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  Download,
  ExternalLink
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import AttachmentModal from "./attachment-modal";
import Image from "next/image";
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
  doctor: ConnectedDoctor;
  patient: Patient;
  messages: ChatMessage[];
  messagesLoading: boolean;
  onSendMessage: (message: string, attachments?: { url: string; filename: string; type: string }[]) => void;
  onBack: () => void;
  currentUserId: string;
}

export default function ChatInterface({
  doctor,
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

  const handleSendMessage = () => {
    if(patient.status === 'COMPLETED'){
      toast.error("Patient is completed");
      return;
    }
    if (!newMessage.trim()) return;
    onSendMessage(newMessage.trim());
    setNewMessage("");
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
    const type = file.type;
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return 'document';
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
    return message.senderType === 'clinic' && message.senderId === currentUserId;
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [key: string]: ChatMessage[] }, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

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

  return (
    <div className="flex flex-col h-[92vh] bg-gray-50 dark:bg-gray-900 overflow-y-scroll">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <ProfileAvatar
            src={doctor.profileImage?.docUrl}
            fallback={doctor.fullName[0]}
            className="h-10 w-10 flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              Dr. {doctor.fullName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              Discussing {patient.name}
            </p>
          </div>
          
          <Button variant="ghost" size="sm" className="p-2 dark:hover:bg-gray-700">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loading variant="default" text="Loading messages..." />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mx-auto max-w-md">
              <div className="mb-4">
                <ProfileAvatar
                  src={doctor.profileImage?.docUrl}
                  fallback={doctor.fullName[0]}
                  className="h-16 w-16 mx-auto mb-3"
                />
                <h3 className="font-semibold text-gray-900 dark:text-white">Dr. {doctor.fullName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{doctor.specialization}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Start discussing <strong>{patient.name}</strong> with Dr. {doctor.fullName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Messages are encrypted and secure
                </p>
              </div>
            </div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex justify-center mb-4">
                <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-500 dark:text-gray-400 shadow-sm">
                  {formatDate(dateMessages[0].timestamp)}
                </span>
              </div>
              
              {/* Messages for this date */}
              <div className="space-y-2">
                {dateMessages.map((message, index) => {
                  const isMine = isMyMessage(message);
                  const showAvatar = !isMine && (
                    index === 0 || 
                    isMyMessage(dateMessages[index - 1]) ||
                    dateMessages[index - 1].senderType !== message.senderType
                  );

                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-2 ${
                        isMine ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isMine && (
                        <div className="w-8 h-8 flex-shrink-0">
                          {showAvatar && (
                            <ProfileAvatar
                              src={doctor.profileImage?.docUrl}
                              fallback={doctor.fullName[0]}
                              className="h-8 w-8"
                            />
                          )}
                        </div>
                      )}
                      
                      <div
                        className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                          isMine
                            ? 'bg-green-500 text-white rounded-br-md'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md shadow-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        
                        {/* Render attachments */}
                        {message.attachments && message.attachments.map((attachment, attachIndex) => (
                          <div key={attachIndex}>
                            {renderAttachment(attachment, isMine)}
                          </div>
                        ))}
                        
                        <div className={`flex items-center justify-end gap-1 mt-1 ${
                          isMine ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          <span className="text-xs">
                            {formatTime(message.timestamp)}
                          </span>
                          {isMine && (
                            <div className="flex">
                              {message.read ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30"
            onClick={() => setShowAttachmentModal(true)}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          )}
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message Dr. ${doctor.fullName}...`}
              className="pr-12 py-3 rounded-full border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              maxLength={1000}
            />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || patient.status==="COMPLETED"}
            size="sm"
            className={`p-3 rounded-full ${
              newMessage.trim() 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
            }`}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex justify-between items-center mt-2 px-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Press Enter to send
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {newMessage.length}/1000
          </p>
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