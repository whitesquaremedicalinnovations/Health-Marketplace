import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { getNews } from '../../lib/utils';
import { useRouter } from 'expo-router';
import { Newspaper, Heart, MessageCircle, Clock, Search, Filter } from 'lucide-react-native';

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
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchNews = async () => {
    try {
      const data = await getNews();
      setNews(data);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchNews().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mx-4">
          <ActivityIndicator size="large" color="#6b7280" />
          <Text className="text-gray-700 mt-4 text-center font-medium">Loading news...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={news}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#6b7280", "#374151"]}
            tintColor="#6b7280"
          />
        }
        ListHeaderComponent={
          <View className="p-4">
            {/* Header Section */}
            <View className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-4">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center">
                  <Newspaper size={20} color="#3b82f6" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-xl font-bold text-gray-900">
                    Healthcare News
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Stay updated with the latest insights and developments
                  </Text>
                </View>
              </View>
              
              {/* Stats */}
              <View className="flex-row space-x-3">
                <View className="flex-1 bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <View className="flex-row items-center justify-center">
                    <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-2">
                      <Newspaper size={12} color="#ffffff" />
                    </View>
                    <View>
                      <Text className="text-lg font-bold text-blue-900">{news.length}</Text>
                      <Text className="text-blue-700 text-xs font-medium">Articles</Text>
                    </View>
                  </View>
                </View>
                
                <View className="flex-1 bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <View className="flex-row items-center justify-center">
                    <View className="w-6 h-6 bg-emerald-500 rounded-full items-center justify-center mr-2">
                      <Heart size={12} color="#ffffff" />
                    </View>
                    <View>
                      <Text className="text-lg font-bold text-emerald-900">
                        {news.reduce((total, item) => total + item._count.likes, 0)}
                      </Text>
                      <Text className="text-emerald-700 text-xs font-medium">Total Likes</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Search Bar */}
              <View className="flex-row space-x-2 mt-3">
                <View className="flex-1 bg-gray-50 rounded-lg border border-gray-200 flex-row items-center px-3 py-2">
                  <Search size={16} color="#6b7280" />
                  <Text className="text-gray-500 ml-2 text-sm">Search articles...</Text>
                </View>
                <TouchableOpacity className="bg-gray-50 rounded-lg border border-gray-200 p-2">
                  <Filter size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            {news.length === 0 ? (
              <View className="items-center justify-center mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4 border border-gray-200">
                  <Newspaper size={32} color="#9ca3af" />
                </View>
                <Text className="text-xl font-bold text-gray-900 mb-2 text-center">No News Available</Text>
                <Text className="text-gray-600 text-center text-sm leading-5 mb-6 px-4">
                  Check back later for the latest healthcare news and updates.
                </Text>
              </View>
            ) : (
              <View />
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="bg-white rounded-xl mx-4 mb-3 shadow-sm border border-gray-100 overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
            onPress={() => router.push(`/news/${item.id}` as any)}
          >
            {item.imageUrl && (
              <Image 
                source={{ uri: item.imageUrl }} 
                className="w-full h-32"
                resizeMode="cover"
              />
            )}
            <View className="p-4">
              <Text className="text-lg font-bold text-gray-900 mb-2" numberOfLines={2}>
                {item.title}
              </Text>
              <Text className="text-gray-600 text-sm leading-5 mb-3" numberOfLines={3}>
                {item.content}
              </Text>
              
              <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                <View className="flex-row items-center space-x-4">
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 bg-red-50 rounded-full items-center justify-center mr-1">
                      <Heart size={12} color="#ef4444" />
                    </View>
                    <Text className="text-gray-700 text-sm font-medium">{item._count.likes}</Text>
                  </View>
                  
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 bg-blue-50 rounded-full items-center justify-center mr-1">
                      <MessageCircle size={12} color="#3b82f6" />
                    </View>
                    <Text className="text-gray-700 text-sm font-medium">{item._count.comments}</Text>
                  </View>
                </View>
                
                <View className="flex-row items-center">
                  <Clock size={12} color="#6b7280" />
                  <Text className="text-gray-500 text-xs ml-1">{formatDate(item.createdAt)}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100 mx-4">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4 border border-gray-200">
              <Newspaper size={32} color="#9ca3af" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2 text-center">No News Available</Text>
            <Text className="text-gray-600 text-center text-sm leading-5 mb-6 px-4">
              Check back later for the latest healthcare news and updates.
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}