"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  ArrowLeft,
  User,
  Clock,
  TrendingUp
} from "lucide-react";
import Image from "next/image";
import CommentSection from "@/components/comment-section";
import { Loading } from "@/components/ui/loading";

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

export default function NewsDetail() {
  const { newsId } = useParams();
  const { userId } = useAuth();
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
        setLiked(response.data.news.likes.some((like: { clinicId: string; }) => like.clinicId === userId));
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (newsId) {
      fetchNews();
    }
  }, [newsId]);

  const handleLike = async () => {
    try {
      const response = await axiosInstance.post(`/api/user/news/${newsId}/like`, {
        clinicId: userId,
      });
      
      if (response.data.message === "Liked") {
        setLiked(true);
        setLikeCount(prev => prev + 1);
      } else {
        setLiked(false);
        setLikeCount(prev => prev - 1);
      }
    } catch (error) {
      console.error("Error liking news:", error);
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
    return <Loading variant="page" icon="news" text="Loading article..." />;
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex justify-center items-center">
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm max-w-md">
          <CardContent className="text-center py-12">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Article Not Found</h3>
            <p className="text-gray-600 mb-4">The article you&apos;re looking for doesn&apos;t exist.</p>
            <Button onClick={() => router.push("/news")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Back Button */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push("/news")}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to News
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
              {news.imageUrl && (
                <div className="relative h-64 md:h-80">
                  <Image
                    src={news.imageUrl}
                    alt={news.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <Badge variant="secondary" className="bg-white/90 text-gray-800 mb-4">
                      Health News
                    </Badge>
                    <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                      {news.title}
                    </h1>
                  </div>
                </div>
              )}
              
              <CardContent className="p-8">
                {!news.imageUrl && (
                  <div className="mb-8">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 mb-4">
                      Health News
                    </Badge>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                      {news.title}
                    </h1>
                  </div>
                )}

                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-6 mb-8 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{getTimeAgo(news.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">5 min read</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Healthcare Admin</span>
                  </div>
                </div>

                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {news.content}
                  </p>
                </div>

                {/* Interaction Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant={liked ? "default" : "outline"}
                    onClick={handleLike}
                    className={`${
                      liked 
                        ? "bg-red-500 hover:bg-red-600 text-white" 
                        : "border-red-200 text-red-600 hover:bg-red-50"
                    } transition-colors duration-200`}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${liked ? "fill-current" : ""}`} />
                    {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
                  </Button>
                  
                  <div className="flex items-center gap-2 text-gray-500">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">{news._count.comments} comments</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <div className="mt-8">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardContent className="p-8">
                  <CommentSection newsId={newsId as string} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Article Stats */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Article Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Likes</span>
                      <span className="font-bold text-gray-900">{likeCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Comments</span>
                      <span className="font-bold text-gray-900">{news._count.comments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Published</span>
                      <span className="font-bold text-gray-900">{new Date(news.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Topics */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50">
                <CardHeader>
                  <CardTitle className="text-lg">Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      Healthcare
                    </Badge>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      Medical News
                    </Badge>
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                      Industry Updates
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}