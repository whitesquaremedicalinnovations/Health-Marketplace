"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Calendar,
  Eye,
  MessageSquare,
  Heart,
  ArrowRight,
  Newspaper,
  TrendingUp
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import Image from "next/image";

interface NewsItem {
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

export default function News() {
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/user/news");
      setNews(response.data.news);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 168) { // 7 days
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (loading) {
    return <Loading variant="page" text="Loading healthcare news..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-white mb-4">
                Healthcare News
              </h1>
              <p className="text-blue-100 text-lg mb-6">
                Stay updated with the latest healthcare news and industry insights
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{news.length}</div>
                  <div className="text-blue-100 text-sm">Latest Articles</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">
                    {news.reduce((total, item) => total + item._count.likes, 0)}
                  </div>
                  <div className="text-blue-100 text-sm">Total Likes</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">
                    {news.reduce((total, item) => total + item._count.comments, 0)}
                  </div>
                  <div className="text-blue-100 text-sm">Comments</div>
                </div>
              </div>
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-indigo-300/20 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* News Grid */}
        {news.length === 0 ? (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Newspaper className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No News Available</h3>
              <p className="text-gray-600 mb-6">
                Check back later for the latest healthcare news and updates.
              </p>
              <Button 
                onClick={() => router.push("/dashboard")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {news.map((article, index) => (
              <Card 
                key={article.id} 
                className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => router.push(`/news/${article.id}`)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {article.imageUrl && (
                  <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900 hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                        {article.title}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <FileText className="h-3 w-3 mr-1" />
                      Article
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-700 line-clamp-3">
                    {truncateContent(article.content)}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(article.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{article._count.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{article._count.comments}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/news/${article.id}`);
                      }}
                      className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Read More
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Trending Topics - Mock section for visual appeal */}
        {news.length > 0 && (
          <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white mt-12">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Trending in Healthcare</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Telemedicine Growth</h4>
                  <p className="text-indigo-100 text-sm">Remote healthcare services continue to expand</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold mb-2">AI in Diagnostics</h4>
                  <p className="text-indigo-100 text-sm">Machine learning improving medical diagnoses</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Healthcare Staffing</h4>
                  <p className="text-indigo-100 text-sm">Addressing workforce challenges in medicine</p>
                </div>
              </div>
              
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={() => router.push("/dashboard")}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-indigo-600"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}