"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageCircle, 
  Send, 
  Search, 
  Phone, 
  Video, 
  MoreVertical,
  Circle,
  Clock,
  CheckCheck,
  Paperclip,
  Smile
} from "lucide-react";
import { Loading } from "@/components/ui/loading";

interface ChatUser {
  id: string;
  name: string;
  avatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  isOnline: boolean;
  unreadCount: number;
  role: "doctor" | "admin";
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  type: "text" | "image" | "file";
  status: "sent" | "delivered" | "read";
}

export default function ChatPage() {
  const { userId } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, fetch from API
  const [chatUsers] = useState<ChatUser[]>([
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      avatar: null,
      lastMessage: "Thank you for the opportunity to work with your clinic.",
      lastMessageTime: "2 min ago",
      isOnline: true,
      unreadCount: 2,
      role: "doctor"
    },
    {
      id: "2", 
      name: "Dr. Michael Chen",
      avatar: null,
      lastMessage: "I'm available for the upcoming procedure.",
      lastMessageTime: "1 hour ago",
      isOnline: false,
      unreadCount: 0,
      role: "doctor"
    },
    {
      id: "3",
      name: "Dr. Emily Rodriguez", 
      avatar: null,
      lastMessage: "Could we schedule a meeting to discuss the requirements?",
      lastMessageTime: "3 hours ago",
      isOnline: true,
      unreadCount: 1,
      role: "doctor"
    },
    {
      id: "4",
      name: "Healthcare Admin",
      avatar: null,
      lastMessage: "New updates available for your dashboard.",
      lastMessageTime: "1 day ago", 
      isOnline: true,
      unreadCount: 0,
      role: "admin"
    }
  ]);

  const [messages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm very interested in the cardiology position you posted.",
      senderId: "1",
      timestamp: "10:30 AM",
      type: "text",
      status: "read"
    },
    {
      id: "2", 
      content: "Thank you for your interest! Could you tell me more about your experience?",
      senderId: userId || "",
      timestamp: "10:32 AM",
      type: "text",
      status: "read"
    },
    {
      id: "3",
      content: "I have 8 years of experience in cardiology and have worked with several leading hospitals.",
      senderId: "1", 
      timestamp: "10:35 AM",
      type: "text",
      status: "read"
    },
    {
      id: "4",
      content: "That sounds excellent! We'd love to schedule an interview with you.",
      senderId: userId || "",
      timestamp: "10:38 AM", 
      type: "text",
      status: "delivered"
    },
    {
      id: "5",
      content: "Thank you for the opportunity to work with your clinic.",
      senderId: "1",
      timestamp: "10:45 AM",
      type: "text", 
      status: "sent"
    }
  ]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
      if (chatUsers.length > 0) {
        setSelectedChat(chatUsers[0].id);
      }
    }, 1000);
  }, [chatUsers]);

  const selectedUser = chatUsers.find(user => user.id === selectedChat);
  const filteredUsers = chatUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In real app, send message via API
      setNewMessage("");
    }
  };

  // const getTimeAgo = (timeString: string) => {
  //   // Simple time formatter - in real app use proper date library
  //   return timeString;
  // };

  if (loading) {
    return <Loading variant="page" icon="message" text="Loading conversations..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-300px)]">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  Conversations
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto">
                <div className="space-y-1">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedChat(user.id)}
                      className={`flex items-center gap-3 p-4 cursor-pointer transition-all duration-200 hover:bg-blue-50 ${
                        selectedChat === user.id ? 'bg-blue-100 border-r-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                          <AvatarImage src={user.avatar || ""} alt={user.name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                            {user.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        {user.isOnline && (
                          <div className="absolute -bottom-0 -right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                          <div className="flex items-center gap-1">
                            {user.unreadCount > 0 && (
                              <Badge className="bg-blue-600 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                                {user.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{user.lastMessage}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">{user.lastMessageTime}</span>
                          <Badge variant="outline" className={`text-xs ${
                            user.role === 'doctor' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-3">
            {selectedUser ? (
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm h-full flex flex-col">
                {/* Chat Header */}
                <CardHeader className="pb-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                          <AvatarImage src={selectedUser.avatar || ""} alt={selectedUser.name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                            {selectedUser.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        {selectedUser.isOnline && (
                          <div className="absolute -bottom-0 -right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{selectedUser.name}</h3>
                        <div className="flex items-center gap-2">
                                                     {selectedUser.isOnline ? (
                             <div className="flex items-center gap-1 text-emerald-600">
                               <Circle className="h-3 w-3 fill-current" />
                               <span className="text-sm">Online</span>
                             </div>
                           ) : (
                            <div className="flex items-center gap-1 text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span className="text-sm">Last seen 2h ago</span>
                            </div>
                          )}
                          <Badge variant="outline" className={`text-xs ${
                            selectedUser.role === 'doctor' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {selectedUser.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-green-200 text-green-600 hover:bg-green-50">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-200 text-gray-600 hover:bg-gray-50">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${
                        message.senderId === userId 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      } rounded-2xl px-4 py-3 shadow-lg`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <div className={`flex items-center gap-1 mt-2 justify-end ${
                          message.senderId === userId ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span className="text-xs">{message.timestamp}</span>
                          {message.senderId === userId && (
                            <CheckCheck className={`h-3 w-3 ${
                              message.status === 'read' ? 'text-blue-200' : 
                              message.status === 'delivered' ? 'text-blue-300' : 'text-blue-400'
                            }`} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>

                {/* Message Input */}
                <div className="p-6 border-t border-gray-200">
                  <div className="flex items-end gap-3">
                    <Button variant="outline" size="sm" className="border-gray-200 text-gray-600 hover:bg-gray-50">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <Textarea
                        placeholder="Type your message..."
                        className="min-h-[44px] max-h-32 resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 pr-12"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 bottom-2 text-gray-500 hover:text-gray-700"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm h-full">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Conversation</h3>
                    <p className="text-gray-600">Choose a conversation from the sidebar to start chatting.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}