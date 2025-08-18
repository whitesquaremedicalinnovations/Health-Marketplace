import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-expo";
import { axiosInstance } from "../lib/axios";
import { MessageCircle, ChevronDown, ChevronUp, Reply } from "lucide-react-native";

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

  const fetchComments = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/api/user/news/${newsId}/comments`);
      setComments(response.data.comments);
    } catch (error) {
      console.log("Error fetching comments:", error);
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
        clinicId: user?.id,
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
        clinicId: user?.id,
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

  const renderComment = (comment: Comment, depth: number = 0) => {
    const isReplying = replyingTo === comment.id;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isCollapsed = collapsedReplies.has(comment.id);

    return (
      <View key={comment.id} style={{ marginLeft: depth > 0 ? 20 : 0 }}>
        <View className="flex-row items-start gap-3 my-2">
          <Image source={{ uri: comment.clinic?.clinicProfileImage?.docUrl || comment.doctor?.profileImage?.docUrl || undefined }} className="w-8 h-8 rounded-full" />
          <View className="flex-1">
            <Text className="font-semibold">{comment.clinic?.clinicName || comment.doctor?.fullName}</Text>
            <Text>{comment.content}</Text>
            <TouchableOpacity onPress={() => setReplyingTo(isReplying ? null : comment.id)}>
              <Text className="text-blue-500">Reply</Text>
            </TouchableOpacity>
            {hasReplies && (
              <TouchableOpacity onPress={() => toggleReplies(comment.id)}>
                <Text>{isCollapsed ? 'Show' : 'Hide'} replies</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {isReplying && (
          <View>
            <TextInput placeholder="Write a reply..." value={replyContent} onChangeText={setReplyContent} />
            <TouchableOpacity onPress={() => handleReplySubmit(comment.id)}>
              <Text>Submit</Text>
            </TouchableOpacity>
          </View>
        )}
        {hasReplies && !isCollapsed && (
          <View>
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View>
      <Text className="text-xl font-bold">Comments</Text>
      <TextInput placeholder="Add a comment..." value={newComment} onChangeText={setNewComment} />
      <TouchableOpacity onPress={handleCommentSubmit}>
        <Text>Post</Text>
      </TouchableOpacity>
      <View>
        {comments.map(comment => renderComment(comment))}
      </View>
    </View>
  );
} 