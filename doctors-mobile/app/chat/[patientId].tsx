import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView,
  StatusBar,
  Image,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getOrCreateChat, getChatMessages, sendMessage } from '../../lib/utils';
import { axiosInstance } from '../../lib/axios';
import { Send, ArrowLeft, User, Calendar, MapPin, Check, CheckCheck, FileText, ImageIcon, Video, Music, File, Download, Paperclip } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import { socket } from '../../lib/socket';
import { LinearGradient } from 'expo-linear-gradient';

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
  clinic: {
    id: string;
    clinicName: string;
    clinicAddress: string;
  };
}

export default function ChatInterfaceScreen() {
  const { patientId, doctorId, clinicId } = useLocalSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const { width } = Dimensions.get('window');

  const initializeChat = useCallback(async () => {
    if (user?.id && typeof doctorId === 'string' && typeof patientId === 'string') {
      try {
        console.log('Initializing chat with params:', { user: user.id, doctorId, patientId, clinicId });
        
        // Create or get chat
        const chat = await getOrCreateChat(String(clinicId), String(doctorId), String(patientId));
        console.log('Chat initialized:', chat);
        setChatId(chat.id);
        
        // Join socket room
        if (socket) {
          socket.emit('join_chat', chat.id);
        }
        
        // Fetch messages
        const fetchedMessages = await getChatMessages(chat.id);
        console.log('Fetched messages:', fetchedMessages);
        setMessages(fetchedMessages);
        
        // Fetch patient details
        // This would typically come from the chat or a separate API call
        // For now, we'll create a mock patient object
        setPatient({
          id: patientId,
          name: 'Patient Name', // This should come from API
          phoneNumber: '',
          gender: '',
          dateOfBirth: '',
          address: '',
          status: 'ACTIVE',
          clinic: {
            id: '',
            clinicName: '',
            clinicAddress: ''
          }
        });
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [user, doctorId, patientId]);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  useEffect(() => {
    if (!chatId || !socket) return;

    socket.on('receive_message', (message: any) => {
      console.log('📨 Received message via Socket.IO:', message);
      
      const isMyMessage = (message.senderDoctorId === user?.id) || (message.senderClinicId === user?.id);
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

    return () => {
      socket.off('receive_message');
    };
  }, [chatId, user, socket]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

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
      Alert.alert('Upload Failed', 'Could not upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async (messageText?: string, attachments?: any[]) => {
    const content = messageText || newMessage.trim();
    if (!content && (!attachments || attachments.length === 0)) return;
    if (!chatId || sending || !user?.id) return;

    setSending(true);
    const tempMessage = content;
    setNewMessage('');

    const optimisticMessageId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const optimisticMessage: ChatMessage = {
      id: optimisticMessageId,
      content: tempMessage,
      senderId: user.id,
      senderType: 'doctor',
      timestamp,
      read: false,
      attachments: attachments || [],
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const messageData = {
        chatId,
        content: tempMessage,
        senderId: user.id,
        senderType: 'doctor',
        attachments: attachments || []
      };

      console.log('Calling sendMessage with:', messageData);
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
      console.log('Message sent successfully:', serverMessage);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessageId 
          ? { ...msg, content: `❌ Failed to send: ${msg.content}`, read: false }
          : msg
      ));
    } finally {
      setSending(false);
    }
  };

  const getAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return '';
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
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return '--:--';
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error, timestamp);
      return '--:--';
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Unknown Date';
      }
      
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
    } catch (error) {
      console.error('Error formatting date:', error, timestamp);
      return 'Unknown Date';
    }
  };

  const isMyMessage = (message: ChatMessage) => {
    return message.senderId === user?.id;
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

  const handleAttachmentPress = (attachment: { url: string; filename: string; type: string }) => {
    if (attachment.type === 'image') {
      // For images, we could open in a modal or full screen view
      Alert.alert('Image', `Viewing: ${attachment.filename}`);
    } else {
      // For other files, open in browser or download
      Linking.openURL(attachment.url).catch(() => {
        Alert.alert('Error', 'Unable to open file');
      });
    }
  };

  const renderAttachment = (attachment: { url: string; filename: string; type: 'image' | 'video' | 'audio' | 'document' | 'other' }, isMine: boolean) => {
    const IconComponent = getFileIcon(attachment.type);

    if (attachment.type === 'image') {
      return (
        <TouchableOpacity
          onPress={() => handleAttachmentPress(attachment)}
          style={{ marginTop: 8 }}
        >
          <Image 
            source={{ uri: attachment.url }} 
            style={{
              width: 200,
              height: 200,
              borderRadius: 12,
              marginBottom: 4,
            }}
            resizeMode="cover"
          />
          <Text style={{
            fontSize: 12,
            color: isMine ? 'rgba(255,255,255,0.7)' : '#9ca3af',
            marginTop: 2,
          }}>
            {attachment.filename}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => handleAttachmentPress(attachment)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isMine ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
          borderRadius: 8,
          padding: 8,
          marginTop: 8,
        }}
      >
        <IconComponent size={16} color={isMine ? 'white' : '#6b7280'} />
        <Text style={{
          flex: 1,
          fontSize: 14,
          color: isMine ? 'white' : '#374151',
          marginLeft: 8,
          marginRight: 4,
        }} numberOfLines={1}>
          {attachment.filename}
        </Text>
        <Download size={14} color={isMine ? 'rgba(255,255,255,0.7)' : '#9ca3af'} />
      </TouchableOpacity>
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

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Chat Header */}
      <LinearGradient
        colors={['#2563EB', '#06B6D4']}
        style={{ 
          paddingHorizontal: 20, 
          paddingTop: 20, 
          paddingBottom: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ marginRight: 16 }}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}>
            <User size={20} color="white" />
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 2 }}>
              {patient?.name || 'Patient'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Calendar size={12} color="#bfdbfe" />
              <Text style={{ fontSize: 12, color: '#bfdbfe', marginLeft: 4 }}>
                {patient?.dateOfBirth ? `${getAge(patient.dateOfBirth)} years` : 'Age not available'}
              </Text>
              <Text style={{ fontSize: 12, color: '#bfdbfe', marginHorizontal: 8 }}>•</Text>
              <Text style={{ fontSize: 12, color: '#bfdbfe' }}>
                {patient?.status || 'ACTIVE'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Messages Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={Object.entries(groupedMessages)}
          keyExtractor={([date]) => date}
          renderItem={({ item: [date, dateMessages] }) => (
            <View>
              {/* Date Separator */}
              <View style={{ alignItems: 'center', marginVertical: 16 }}>
                <View style={{
                  backgroundColor: '#e5e7eb',
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}>
                  <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '500' }}>
                    {date}
                  </Text>
                </View>
              </View>

              {/* Messages for this date */}
              {dateMessages.map((message: ChatMessage) => (
                <View key={message.id} style={{ 
                  marginHorizontal: 16, 
                  marginBottom: 8,
                  alignItems: isMyMessage(message) ? 'flex-end' : 'flex-start'
                }}>
                  <View style={{
                    maxWidth: '80%',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 20,
                    backgroundColor: isMyMessage(message) ? '#3b82f6' : 'white',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}>
                    <Text style={{
                      fontSize: 16,
                      color: isMyMessage(message) ? 'white' : '#111827',
                      lineHeight: 20,
                    }}>
                      {message.content}
                    </Text>
                    
                    {/* Render attachments */}
                    {message.attachments && message.attachments.map((attachment: { url: string; filename: string; type: 'image' | 'video' | 'audio' | 'document' | 'other' }, index: number) => (
                      <View key={index}>
                        {renderAttachment(attachment, isMyMessage(message))}
                      </View>
                    ))}
                    
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      marginTop: 4,
                    }}>
                      <Text style={{
                        fontSize: 12,
                        color: isMyMessage(message) ? 'rgba(255,255,255,0.7)' : '#9ca3af',
                        marginRight: 4,
                      }}>
                        {formatTime(message.timestamp)}
                      </Text>
                      {isMyMessage(message) && (
                        message.read ? (
                          <CheckCheck size={12} color="rgba(255,255,255,0.7)" />
                        ) : (
                          <Check size={12} color="rgba(255,255,255,0.7)" />
                        )
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
          onContentSizeChange={() => {
            // Auto-scroll handled by useEffect
          }}
          onLayout={() => {
            // Auto-scroll handled by useEffect
          }}
        />

        {/* Message Input */}
        <View style={{
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            backgroundColor: '#f9fafb',
            borderRadius: 24,
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}>
            <TouchableOpacity
              onPress={handleImagePicker}
              style={{
                padding: 8,
                marginRight: 8,
              }}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <Paperclip size={20} color="#6b7280" />
              )}
            </TouchableOpacity>
            
            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                color: '#111827',
                maxHeight: 100,
                paddingVertical: 8,
              }}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="#9ca3af"
              multiline
            />
            <TouchableOpacity
              onPress={() => handleSendMessage()}
              disabled={(!newMessage.trim() && !uploading) || sending}
              style={{
                backgroundColor: (newMessage.trim() || uploading) ? '#3b82f6' : '#e5e7eb',
                borderRadius: 20,
                padding: 8,
                marginLeft: 8,
              }}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Send size={20} color={(newMessage.trim() || uploading) ? 'white' : '#9ca3af'} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 