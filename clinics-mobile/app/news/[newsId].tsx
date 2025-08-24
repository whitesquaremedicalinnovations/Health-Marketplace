import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useUser } from "@clerk/clerk-expo";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Heart,
  MessageCircle,
  User,
} from "lucide-react-native";

import { axiosInstance } from "../../lib/axios";
import CommentSection from "../../components/comment-section";

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
  likes: { clinicId: string }[];
}

export default function NewsDetail() {
  const { newsId } = useLocalSearchParams();
  const { user } = useUser();
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axiosInstance.get(`/api/user/news/${newsId}`);
        setNews(response.data.news);
        setLikeCount(response.data.news._count.likes);
        setLiked(
          response.data.news.likes.some(
            (like: { clinicId: string }) => like.clinicId === user?.id
          )
        );
      } catch (error) {
        console.log("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    if (newsId) {
      fetchNews();
    }
  }, [newsId, user?.id]);

  const handleLike = async () => {
    try {
      const response = await axiosInstance.post(`/api/user/news/${newsId}/like`, {
        clinicId: user?.id,
      });

      if (response.data.message === "Liked") {
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      } else {
        setLiked(false);
        setLikeCount((prev) => prev - 1);
      }
    } catch (error) {
      console.log("Error liking news:", error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (loading) {
    return <ActivityIndicator className="flex-1" size="large" />;
  }

  if (!news) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 p-4">
        <Stack.Screen 
            options={
                {
                    headerTitle: "View Requirement",
                    headerStyle: {
                      backgroundColor: "#2563EB"
                    },
                    headerTitleStyle: {
                      color: "white"
                    }
                }
            }
        />
        <View className="bg-white p-8 rounded-lg shadow-md items-center">
          <Text className="text-xl font-bold text-gray-900 mb-3">
            Article Not Found
          </Text>
          <Text className="text-gray-600 mb-4 text-center">
            The article you're looking for doesn't exist.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <Stack.Screen 
            options={
                {
                    headerTitle: "View Requirement",
                    headerStyle: {
                      backgroundColor: "#2563EB"
                    },
                    headerTitleStyle: {
                      color: "white"
                    }
                }
            }
        />
      <View className="p-4">
        <View className="bg-white rounded-lg shadow-md overflow-hidden">
          {news.imageUrl && (
            <Image
              source={{ uri: news.imageUrl }}
              className="w-full h-56"
              resizeMode="cover"
            />
          )}
          <View className="p-6">
            <Text className="text-2xl font-bold text-gray-900 mb-4">
              {news.title}
            </Text>

            <View className="flex-row flex-wrap items-center gap-4 mb-6 pb-4 border-b border-gray-200">
              <View className="flex-row items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <Text className="text-sm text-gray-600">
                  {getTimeAgo(news.createdAt)}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <Text className="text-sm text-gray-600">5 min read</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <User className="h-4 w-4 text-gray-600" />
                <Text className="text-sm text-gray-600">
                  Healthcare Admin
                </Text>
              </View>
            </View>

            <Text className="text-base text-gray-700 leading-relaxed">
              {news.content}
            </Text>

            <View className="flex-row items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <TouchableOpacity
                onPress={handleLike}
                className={`flex-row items-center py-2 px-4 rounded-full transition-colors duration-200 ${
                  liked ? "bg-red-500" : "border border-red-200"
                }`}
              >
                <Heart
                  className={`h-5 w-5 mr-2 ${
                    liked ? "text-white" : "text-red-600"
                  }`}
                  fill={liked ? "white" : "transparent"}
                />
                <Text
                  className={`${liked ? "text-white" : "text-red-600"}`}
                >{`${likeCount} ${likeCount === 1 ? "Like" : "Likes"}`}</Text>
              </TouchableOpacity>

              <View className="flex-row items-center gap-2">
                <MessageCircle className="h-5 w-5 text-gray-500" />
                <Text className="text-sm text-gray-500">
                  {news._count.comments} comments
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-6 bg-white rounded-lg shadow-md p-6">
          <CommentSection newsId={newsId as string} />
        </View>
      </View>
    </ScrollView>
  );
} 