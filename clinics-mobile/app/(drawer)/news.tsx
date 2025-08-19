import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, FlatList, Image, TouchableOpacity } from 'react-native';
import { getNews } from '../../lib/utils';
import { useRouter } from 'expo-router';
import { Newspaper, Heart, MessageCircle } from 'lucide-react-native';

interface News {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  _count: {
    likes: number;
    comments: number;
  };
}

export default function NewsScreen() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNews();
        setNews(data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading news...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={news}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={{ padding: 16 }}>
          <View style={{ padding: 24, backgroundColor: '#3b82f6', borderRadius: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>Healthcare News</Text>
            <Text style={{ fontSize: 16, color: 'white', opacity: 0.8, marginTop: 4 }}>Stay updated with the latest insights</Text>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={{ backgroundColor: 'white', borderRadius: 12, marginHorizontal: 16, marginBottom: 12, overflow: 'hidden' }}
          onPress={() => router.push(`/news/${item.id}` as any)}
        >
          {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: 150 }} />}
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.title}</Text>
            <Text style={{ color: 'gray', marginVertical: 8, lineHeight: 20 }} numberOfLines={3}>{item.content}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Heart size={16} color="red" />
                <Text style={{ marginLeft: 4 }}>{item._count.likes}</Text>
                <MessageCircle size={16} color="#3b82f6" style={{ marginLeft: 16 }} />
                <Text style={{ marginLeft: 4 }}>{item._count.comments}</Text>
              </View>
              <Text style={{ color: 'gray', fontSize: 12 }}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}