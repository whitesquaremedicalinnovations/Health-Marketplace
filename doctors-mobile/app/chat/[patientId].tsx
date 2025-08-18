import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getOrCreateChat, getChatMessages, sendMessage } from '../../lib/utils';
import { Send } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import { socket } from '../../lib/socket';

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderType: 'clinic' | 'doctor';
  timestamp: string;
}

export default function ChatInterfaceScreen() {
  const { patientId, doctorId } = useLocalSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const { user } = useUser();

  const initializeChat = useCallback(async () => {
    if (user?.id && typeof doctorId === 'string' && typeof patientId === 'string') {
      try {
        const chat = await getOrCreateChat(user.id, doctorId, patientId);
        setChatId(chat.id);
        const fetchedMessages = await getChatMessages(chat.id);
        setMessages(fetchedMessages);
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
    if (!chatId) return;

    socket.connect();
    socket.emit('join_chat', chatId);

    socket.on('receive_message', (message: ChatMessage) => {
      // Don't add our own messages from Socket.IO since we already have them optimistically
      if (message.senderId === user?.id) {
        return;
      }
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('receive_message');
      socket.disconnect();
    };
  }, [chatId, user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id || !chatId) return;

    const optimisticMessage: ChatMessage = {
      id: Math.random().toString(),
      content: newMessage.trim(),
      senderId: user.id,
      senderType: 'clinic',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      // We don't need to emit a socket event here, the backend will do it
      const sentMessage = await sendMessage(chatId, user.id, 'clinic', newMessage.trim());
      setMessages(prev => prev.map(msg => msg.id === optimisticMessage.id ? sentMessage : msg));
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={100}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ alignSelf: item.senderType === 'clinic' ? 'flex-end' : 'flex-start', margin: 8 }}>
            <Text style={{ padding: 8, backgroundColor: item.senderType === 'clinic' ? '#dcf8c6' : '#fff', borderRadius: 8 }}>
              {item.content}
            </Text>
          </View>
        )}
        keyboardShouldPersistTaps="handled"
      />
      <View style={{ flexDirection: 'row', padding: 8, borderTopWidth: 1, borderColor: '#eee' }}>
          <TextInput
            style={{ flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, padding: 8 }}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
          />
          <TouchableOpacity onPress={handleSendMessage} style={{ marginLeft: 8, justifyContent: 'center' }}>
            <Send size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>
    </KeyboardAvoidingView>
  );
} 