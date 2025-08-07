"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, ChevronDown, ChevronUp, Reply } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  const { userId } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [collapsedReplies, setCollapsedReplies] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const response = await axiosInstance.get(`/api/user/news/${newsId}/comments`);
      const fetchedComments = response.data.comments;
      setComments(fetchedComments);
      
      // Collapse all replies by default
      const commentsWithReplies = new Set<string>();
      const collectCommentsWithReplies = (comments: Comment[]) => {
        comments.forEach(comment => {
          if (comment.replies && comment.replies.length > 0) {
            commentsWithReplies.add(comment.id);
            collectCommentsWithReplies(comment.replies);
          }
        });
      };
      collectCommentsWithReplies(fetchedComments);
      setCollapsedReplies(commentsWithReplies);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [newsId]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    
    try {
      setIsSubmitting(true);
      await axiosInstance.post(`/api/user/news/${newsId}/comment`, {
        content: newComment,
        doctorId: userId,
      });
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!replyContent.trim()) return;
    
    try {
      setIsSubmitting(true);
      await axiosInstance.post(`/api/user/news/${newsId}/comment`, {
        content: replyContent,
        doctorId: userId,
        parentId,
      });
      setReplyContent("");
      setReplyingTo(null);
      fetchComments();
    } catch (error) {
      console.error("Error posting reply:", error);
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
    const maxDepth = 5; // Limit nesting depth for better UX
    
    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
        <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={comment.clinic?.clinicProfileImage?.docUrl || comment.doctor?.profileImage?.docUrl || ""} 
                  alt="Profile"
                />
                <AvatarFallback className="text-xs">
                  {comment.clinic?.clinicName?.[0] || comment.doctor?.fullName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm text-gray-900">
                    {comment.clinic?.clinicName || comment.doctor?.fullName || "Anonymous"}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  {comment.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {depth < maxDepth && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                        className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        {isReplying ? "Cancel" : "Reply"}
                      </Button>
                    )}
                  </div>
                  
                  {hasReplies && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReplies(comment.id)}
                      className="h-8 px-3 text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200"
                    >
                      <span className="mr-2">
                        {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                      </span>
                      {isCollapsed ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Reply Input */}
            {isReplying && (
              <div className="mt-4 pl-11">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleReplySubmit(comment.id)}
                      disabled={isSubmitting || !replyContent.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? "Posting..." : "Reply"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent("");
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Recursive Replies */}
        {hasReplies && !isCollapsed && (
          <div className="mt-3 space-y-3">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">
          Comments ({comments.length})
        </h2>
      </div>
      
      {/* New Comment Input */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Textarea
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleCommentSubmit}
                disabled={isSubmitting || !newComment.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card className="border-0 shadow-sm bg-gray-50/50">
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No comments yet. Be the first to share your thoughts!</p>
            </CardContent>
          </Card>
        ) : (
          comments.map(comment => renderComment(comment, 0))
        )}
      </div>
    </div>
  );
} 