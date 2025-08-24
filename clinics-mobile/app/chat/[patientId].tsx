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
  StyleSheet
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import {
  ArrowLeft,
  Send,
  Paperclip,
  MoreVertical,
  Check,
  CheckCheck,
  FileText,
} from 'lucide-react-native';
import { getChatMessages, sendMessage, getOrCreateChat } from '../../lib/utils';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { axiosInstance } from '../../lib/axios';
import { socket } from '../../lib/socket';
import { normalizeMessage } from '../../lib/chat-utils';

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
  const { patientId, doctorId } = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctor, setDoctor] = useState<ConnectedDoctor | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (chatId) {
      socket.emit('join_chat', chatId);

      const handleNewMessage = (message: any) => {
        const normalized = normalizeMessage(message);
        
        // Don't add our own messages from Socket.IO since we already have them optimistically
        const isMyMessage = (normalized.senderId === user?.id);
        if (isMyMessage) {
          return;
        }

        setMessages((prevMessages) => [...prevMessages, normalized]);
      };

      socket.on('receive_message', handleNewMessage);

      return () => {
        socket.off('receive_message', handleNewMessage);
        socket.emit('leave_chat', chatId);
      };
    }
  }, [chatId, user?.id]);

  const fetchChatData = useCallback(async () => {
    if (!user?.id || !patientId || !doctorId) return;

    try {
      const chatData = await getOrCreateChat(user.id, doctorId as string, patientId as string);
      setChatId(chatData.id);
      setPatient(chatData.patient);
      setDoctor(chatData.doctor);
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
  }, [user, patientId, doctorId]);

  useEffect(()=>{
    if(chatId){
      const fetchMessages = async () => {
        const messagesData = await getChatMessages(chatId);
        setMessages(messagesData.map(normalizeMessage) || []);
      }
      fetchMessages();
    }
  }, [chatId]);

  useEffect(() => {
    fetchChatData();
  }, [fetchChatData]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async (messageText?: string, attachments?: any[]) => {
    const content = messageText || newMessage.trim();
    if (!content && (!attachments || attachments.length === 0)) return;
    if (!chatId || sending) return;

    setSending(true);
    const tempMessage = content;
    setNewMessage('');

    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: tempMessage,
      senderId: user?.id || '',
      senderType: 'clinic',
      timestamp: new Date().toISOString(),
      read: false,
      attachments,
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const sentMessage = await sendMessage(chatId, user?.id || '', 'clinic', tempMessage, attachments);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id ? normalizeMessage(sentMessage) : msg
        )
      );
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      setNewMessage(tempMessage); 
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
    Alert.alert('Add Attachment', 'Choose an option', [
      { text: 'Camera', onPress: openCamera },
      { text: 'Gallery', onPress: openGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      uploadImage(result.assets[0]);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploading(true);
    const formData = new FormData();
    const uriParts = asset.uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('files', {
      uri: asset.uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    try {
      const { data } = await axiosInstance.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const uploadedFile = data.uploaded[0];
      const attachment = {
        url: uploadedFile.url,
        filename: uploadedFile.fieldName,
        type: 'image',
      };
      handleSendMessage(`Sent an image`, [attachment]);
    } catch (error) {
      console.error('Image upload failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: 'Could not upload image.',
      });
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp || isNaN(new Date(timestamp).getTime())) {
      return 'Invalid date';
    }
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

  const renderAttachment = (attachment: NonNullable<ChatMessage['attachments']>[number], isMyMessage: boolean) => {
    if (attachment.type === 'image') {
      return (
        <TouchableOpacity onPress={() => { /* Open image full screen */ }}>
          <Image 
            source={{ uri: attachment.url }} 
            style={{ 
              width: width * 0.6, 
              height: width * 0.6, 
              borderRadius: 12, 
              marginTop: 8 
            }}
          />
        </TouchableOpacity>
      );
    }
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8,
        backgroundColor: isMyMessage ? '#4ade80' : '#e5e7eb',
        padding: 8, borderRadius: 8
      }}>
        <FileText size={24} color={isMyMessage ? 'white' : '#374151'} />
        <Text style={{ marginLeft: 8, color: isMyMessage ? 'white' : '#111827' }}>{attachment.filename}</Text>
      </View>
    );
  };
  
  const renderMessage = (message: ChatMessage, index: number, messages: ChatMessage[]) => {
    const isMyMessage = message.senderId === user?.id;
    const previousMessage = messages[index - 1];
    
    const showAvatar = !isMyMessage && 
      (!previousMessage || isMyMessage || previousMessage.senderId !== message.senderId);

    return (
      <View key={message.id} style={{ 
        flexDirection: 'row', 
        justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
        marginBottom: 8,
        paddingHorizontal: 16,
        alignItems: 'flex-end'
      }}>
        {!isMyMessage && (
          <View style={{ width: 32, height: 32, marginRight: 8 }}>
            {showAvatar && (
              doctor?.profileImage?.docUrl ? (
                <Image
                  source={{ uri: doctor.profileImage.docUrl }}
                  style={{ width: 32, height: 32, borderRadius: 16 }}
                />
              ) : (
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#a5b4fc', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                    {doctor?.fullName?.[0] || 'D'}
                  </Text>
                </View>
              )
            )}
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble
        ]}>
          {message.content && <Text style={{
            color: isMyMessage ? 'white' : '#111827',
            fontSize: 16,
          }}>{message.content}</Text>}

          {message.attachments?.map((att, i) => (
            <View key={att.url || i}>
              {renderAttachment(att, isMyMessage)}
            </View>
          ))}
          
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 }}>
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
    );
  };
  
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 16 }}>
            Loading chat...
          </Text>
        </View>
      </SafeAreaView>
      </>
    );
  }

  return (
    <>
    <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Chat Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ padding: 8, marginLeft: -8 }}
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 12 }}>
          {doctor?.profileImage?.docUrl ? (
            <Image 
              source={{ uri: doctor.profileImage.docUrl }}
              style={styles.headerAvatar}
            />
          ) : (
            <View style={[styles.headerAvatar, { backgroundColor: '#a5b4fc', justifyContent: 'center', alignItems: 'center'}]}>
              <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>{doctor?.fullName?.[0] || 'D'}</Text>
            </View>
          )}
          
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerName} numberOfLines={1}>
              Dr. {doctor?.fullName || 'Doctor'}
            </Text>
            <Text style={styles.headerSubtitle}>
              Discussing {patient?.name || 'Patient'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={{ padding: 8 }}>
          <MoreVertical size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Messages Area */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 80}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, backgroundColor: '#f9fafb' }}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.length > 0 ? (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <View key={date}>
                <View style={styles.dateSeparator}>
                  <View style={styles.dateSeparatorLine} />
                  <Text style={styles.dateText}>{date}</Text>
                  <View style={styles.dateSeparatorLine} />
                </View>
                {dateMessages.map((message, index) => renderMessage(message, index, dateMessages))}
              </View>
            ))
          ) : (
            <View style={styles.noMessagesContainer}>
                {doctor?.profileImage?.docUrl ? (
                  <Image 
                    source={{ uri: doctor.profileImage.docUrl }}
                    style={styles.noMessagesAvatar}
                  />
                ) : (
                  <View style={[styles.noMessagesAvatar, { backgroundColor: '#a5b4fc', justifyContent: 'center', alignItems: 'center'}]}>
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>{doctor?.fullName?.[0] || 'D'}</Text>
                  </View>
                )}
                <Text style={styles.noMessagesTitle}>Dr. {doctor?.fullName}</Text>
                <Text style={styles.noMessagesSubtitle}>{doctor?.specialization}</Text>
              <Text style={styles.noMessagesText}>
                Start discussing <Text style={{fontWeight: 'bold'}}>{patient?.name}</Text> with Dr. {doctor?.fullName}
              </Text>
              <Text style={styles.noMessagesInfo}>Messages are encrypted and secure</Text>
            </View>
          )}
        </ScrollView>

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={handleImagePicker}
            style={styles.attachmentButton}
            disabled={uploading}
          >
            {uploading ? <ActivityIndicator size="small" color="#22c55e" /> : <Paperclip size={22} color="#6b7280" />}
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder={`Message Dr. ${doctor?.fullName}...`}
            placeholderTextColor="#9ca3af"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />

          <TouchableOpacity
            onPress={() => handleSendMessage()}
            disabled={(!newMessage.trim() && !uploading) || sending}
            style={[styles.sendButton, { backgroundColor: newMessage.trim() ? '#22c55e' : '#d1d5db'}]}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Send size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#2563EB',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'white',
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb'
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginHorizontal: 10
  },
  noMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: height * 0.1
  },
  noMessagesAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12
  },
  noMessagesTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937'
  },
  noMessagesSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16
  },
  noMessagesText: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 8
  },
  noMessagesInfo: {
    fontSize: 12,
    color: '#9ca3af'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  attachmentButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    maxHeight: 120,
    marginHorizontal: 8
  },
  sendButton: {
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myMessageBubble: {
    backgroundColor: '#22c55e',
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
  },
});