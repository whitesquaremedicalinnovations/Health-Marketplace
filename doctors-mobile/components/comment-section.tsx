import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, ScrollView } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-expo";
import { axiosInstance } from "../lib/axios";
import { MessageCircle, ChevronDown, ChevronUp, Reply, Send, User, Clock } from "lucide-react-native";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  clinic: {
    clinicName: string;
    clinicProfileImage: {
      docUrl: string;
    } | null;
  } | null;
  doctor: {
    fullName: string;
    profileImage: {
      docUrl: string;
    } | null;
  } | null;
  replies: Comment[];
}

interface CommentSectionProps {
  newsId: string;
}

export default function CommentSection({ newsId }: CommentSectionProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [collapsedReplies, setCollapsedReplies] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/user/news/${newsId}/comments`);
      setComments(response.data.comments);
    } catch (error) {
      console.log("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }, [newsId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await axiosInstance.post(`/api/user/news/${newsId}/comment`, {
        content: newComment,
        doctorId: user?.id,
      });
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.log("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    try {
      await axiosInstance.post(`/api/user/news/${newsId}/comment`, {
        content: replyContent,
        doctorId: user?.id,
        parentId,
      });
      setReplyContent("");
      setReplyingTo(null);
      fetchComments();
    } catch (error) {
      console.log("Error posting reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReplies = (commentId: string) => {
    setCollapsedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const isReplying = replyingTo === comment.id;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isCollapsed = collapsedReplies.has(comment.id);
    const profileImage = comment.clinic?.clinicProfileImage?.docUrl || comment.doctor?.profileImage?.docUrl;
    const userName = comment.clinic?.clinicName || comment.doctor?.fullName;

    return (
      <View key={comment.id} style={{ marginLeft: depth > 0 ? 24 : 0 }}>
        <View className={`bg-gray-50 rounded-lg p-4 mb-3 ${depth > 0 ? 'border-l-2 border-blue-200' : ''}`}>
          <View className="flex-row items-start gap-3">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center overflow-hidden">
              {profileImage ? (
                <Image 
                  source={{ uri: profileImage }} 
                  className="w-full h-full rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <User className="w-5 h-5 text-blue-600" />
              )}
            </View>
            
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="font-semibold text-gray-900 text-base">
                  {userName}
                </Text>
                <View className="flex-row items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <Text className="text-xs text-gray-500">
                    {getTimeAgo(comment.createdAt)}
                  </Text>
                </View>
              </View>
              
              <Text className="text-gray-700 text-sm leading-5 mb-3">
                {comment.content}
              </Text>
              
              <View className="flex-row items-center gap-4">
                <TouchableOpacity 
                  onPress={() => setReplyingTo(isReplying ? null : comment.id)}
                  className="flex-row items-center gap-1"
                >
                  <Reply className="w-4 h-4 text-blue-600" />
                  <Text className="text-blue-600 text-sm font-medium">Reply</Text>
                </TouchableOpacity>
                
                {hasReplies && (
                  <TouchableOpacity 
                    onPress={() => toggleReplies(comment.id)}
                    className="flex-row items-center gap-1"
                  >
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    )}
                    <Text className="text-gray-500 text-sm">
                      {isCollapsed ? `Show ${comment.replies.length} replies` : 'Hide replies'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          
          {isReplying && (
            <View className="mt-4 pt-4 border-t border-gray-200">
              <View className="flex-row items-end gap-2">
                <View className="flex-1">
                  <TextInput 
                    placeholder="Write a reply..." 
                    value={replyContent} 
                    onChangeText={setReplyContent}
                    multiline
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[40px] max-h-[100px]"
                    style={{ textAlignVertical: 'top' }}
                  />
                </View>
                <TouchableOpacity 
                  onPress={() => handleReplySubmit(comment.id)}
                  disabled={isSubmitting || !replyContent.trim()}
                  className={`p-2 rounded-lg ${isSubmitting || !replyContent.trim() ? 'bg-gray-300' : 'bg-blue-600'}`}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Send className="w-4 h-4 text-white" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        
        {hasReplies && !isCollapsed && (
          <View className="ml-4">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="space-y-4">
      {/* Header */}
      <View className="flex-row items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-gray-700" />
        <Text className="text-xl font-bold text-gray-900">Comments</Text>
        <Text className="text-sm text-gray-500">({comments.length})</Text>
      </View>

      {/* Comment Input */}
      <View className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <View className="flex-row items-end gap-3">
          <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center overflow-hidden">
            {user?.imageUrl ? (
              <Image 
                source={{ uri: user.imageUrl }} 
                className="w-full h-full rounded-full"
                resizeMode="cover"
              />
            ) : (
              <User className="w-5 h-5 text-blue-600" />
            )}
          </View>
          
          <View className="flex-1">
            <TextInput 
              placeholder="Share your thoughts..." 
              value={newComment} 
              onChangeText={setNewComment}
              multiline
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[40px] max-h-[100px]"
              style={{ textAlignVertical: 'top' }}
            />
          </View>
          
          <TouchableOpacity 
            onPress={handleCommentSubmit}
            disabled={isSubmitting || !newComment.trim()}
            className={`p-2 rounded-lg ${isSubmitting || !newComment.trim() ? 'bg-gray-300' : 'bg-blue-600'}`}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments List */}
      {loading ? (
        <View className="py-8 items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-2">Loading comments...</Text>
        </View>
      ) : comments.length === 0 ? (
        <View className="py-8 items-center">
          <MessageCircle className="w-12 h-12 text-gray-300 mb-2" />
          <Text className="text-gray-500 text-center">No comments yet. Be the first to share your thoughts!</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {comments.map(comment => renderComment(comment))}
        </ScrollView>
      )}
    </View>
  );
} 