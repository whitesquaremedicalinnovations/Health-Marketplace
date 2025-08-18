import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@clerk/clerk-expo';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Send,
  Paperclip,
  MoreVertical,
  Check,
  CheckCheck,
  Phone,
  Video,
  Info,
  Camera,
  Image as ImageIcon,
  FileText,
  Smile,
} from 'lucide-react-native';
import { axiosInstance } from '../../lib/axios';
import { getChatMessages, sendMessage, getOrCreateChat } from '../../lib/utils';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

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

interface Patient {
  id: string;
  name: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  status: 'ACTIVE' | 'COMPLETED';
}

interface ConnectedDoctor {
  id: string;
  fullName: string;
  specialization: string;
  phoneNumber: string;
  profileImage?: {
    docUrl: string;
  };
}

export default function ChatScreen() {
  const { user } = useUser();
  const router = useRouter();
  const { patientId } = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctor, setDoctor] = useState<ConnectedDoctor | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);

  const fetchChatData = useCallback(async () => {
    if (!user?.id || !patientId) return;

    try {
      // Get or create chat
      const chatData = await getOrCreateChat(user.id, '', patientId as string);
      setChatId(chatData.chat.id);
      setPatient(chatData.patient);
      setDoctor(chatData.doctor);

      // Get messages
      const messagesData = await getChatMessages(chatData.chat.id);
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching chat data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load chat',
      });
    } finally {
      setLoading(false);
    }
  }, [user, patientId]);

  useEffect(() => {
    fetchChatData();
  }, [fetchChatData]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId || sending) return;

    setSending(true);
    const tempMessage = newMessage.trim();
    setNewMessage('');

    // Optimistically add message to UI
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: tempMessage,
      senderId: user?.id || '',
      senderType: 'clinic',
      timestamp: new Date().toISOString(),
      read: false,
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const sentMessage = await sendMessage(chatId, user?.id || '', 'clinic', tempMessage);
      
      // Replace optimistic message with real one
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id ? sentMessage : msg
        )
      );
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      setNewMessage(tempMessage); // Restore message
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send message',
      });
    } finally {
      setSending(false);
    }
  };

  const handleImagePicker = async () => {
    Alert.alert(
      'Add Attachment',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openGallery() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      // Handle image upload
      Toast.show({
        type: 'info',
        text1: 'Coming Soon',
        text2: 'Image sharing will be available in the next update',
      });
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      // Handle image upload
      Toast.show({
        type: 'info',
        text1: 'Coming Soon',
        text2: 'Image sharing will be available in the next update',
      });
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isMyMessage = message.senderId === user?.id;
    const showDate = index === 0 || 
      formatDate(message.timestamp) !== formatDate(messages[index - 1]?.timestamp);

    return (
      <View key={message.id}>
        {/* Date Separator */}
        {showDate && (
          <View style={{ alignItems: 'center', marginVertical: 16 }}>
            <View style={{ backgroundColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '500' }}>
                {formatDate(message.timestamp)}
              </Text>
            </View>
          </View>
        )}

        {/* Message Bubble */}
        <View style={{
          flexDirection: 'row',
          justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
          marginBottom: 8,
          paddingHorizontal: 16,
        }}>
          {!isMyMessage && (
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              {doctor?.profileImage?.docUrl ? (
                <Image
                  source={{ uri: doctor.profileImage.docUrl }}
                  style={{ width: 32, height: 32, borderRadius: 16 }}
                />
              ) : (
                <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                  {doctor?.fullName?.[0] || 'D'}
                </Text>
              )}
            </View>
          )}
          
          <View style={{
            maxWidth: width * 0.75,
            backgroundColor: isMyMessage ? '#3b82f6' : '#ffffff',
            borderRadius: 16,
            padding: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
            borderWidth: isMyMessage ? 0 : 1,
            borderColor: '#e5e7eb',
          }}>
            <Text style={{
              color: isMyMessage ? 'white' : '#111827',
              fontSize: 16,
              lineHeight: 20,
            }}>
              {message.content}
            </Text>
            
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginTop: 4,
            }}>
              <Text style={{
                fontSize: 11,
                color: isMyMessage ? 'rgba(255,255,255,0.7)' : '#6b7280',
                marginRight: 4,
              }}>
                {formatTime(message.timestamp)}
              </Text>
              {isMyMessage && (
                message.read ? (
                  <CheckCheck size={14} color="rgba(255,255,255,0.7)" />
                ) : (
                  <Check size={14} color="rgba(255,255,255,0.7)" />
                )
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 16 }}>
            Loading chat...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Chat Header */}
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 12 }}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>

        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
              {patient?.name?.[0] || 'P'}
            </Text>
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }} numberOfLines={1}>
              {patient?.name || 'Patient'}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>
              {doctor ? `with Dr. ${doctor.fullName}` : 'Healthcare Chat'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={{ padding: 8 }}>
            <Phone size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 8 }}>
            <Video size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 8 }}>
            <MoreVertical size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Messages Area */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, backgroundColor: '#f8fafc' }}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.length > 0 ? (
            messages.map((message, index) => renderMessage(message, index))
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 32 }}>👋</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                Start the conversation
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', paddingHorizontal: 32 }}>
                Send a message to begin chatting with {patient?.name || 'the patient'}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Message Input */}
        <View style={{
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingBottom: Platform.OS === 'ios' ? 34 : 12,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            backgroundColor: '#f9fafb',
            borderRadius: 24,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: '#e5e7eb',
          }}>
            <TouchableOpacity
              onPress={handleImagePicker}
              style={{ marginRight: 8, marginBottom: 4 }}
            >
              <Paperclip size={20} color="#6b7280" />
            </TouchableOpacity>

            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                color: '#111827',
                maxHeight: 100,
                paddingVertical: 8,
              }}
              placeholder="Type a message..."
              placeholderTextColor="#9ca3af"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              textAlignVertical="center"
              onSubmitEditing={handleSendMessage}
            />

            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              style={{
                backgroundColor: newMessage.trim() ? '#3b82f6' : '#d1d5db',
                borderRadius: 20,
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 8,
              }}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Send size={18} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}