"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Calendar, Clock, TrendingUp, Newspaper } from "lucide-react";
import Image from "next/image";
import { Loading, SkeletonCard } from "@/components/ui/loading";

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

export default function News() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axiosInstance.get("/api/user/news");
        setNews(response.data.news);
      } catch (error) {
        console.log("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

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
    return <Loading variant="page" icon="news" text="Loading latest news..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Enhanced Header */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Newspaper className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Healthcare News
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Stay updated with the latest healthcare industry insights
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-2 text-white/90">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm">{news.length} Articles Available</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm">Updated Daily</span>
                </div>
              </div>
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-300/20 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* News Articles */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : news.length === 0 ? (
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Newspaper className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No News Available</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Check back later for the latest healthcare industry news and updates.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {news.map((article) => (
              <Card
                key={article.id}
                className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group overflow-hidden"
                onClick={() => router.push(`/news/${article.id}`)}
              >
                {article.imageUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Health News
                    </Badge>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs">{getTimeAgo(article.createdAt)}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl leading-tight group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                    {article.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {article.content}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1 hover:text-red-500 transition-colors">
                        <Heart className="h-4 w-4" />
                        <span>{article._count.likes}</span>
                      </div>
                      <div className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        <span>{article._count.comments}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Featured Section */}
        {news.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Trending This Week
              </h2>
              <p className="text-gray-600">Most popular healthcare stories</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {news.slice(0, 2).map((article) => (
                <Card
                  key={`featured-${article.id}`}
                  className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden"
                  onClick={() => router.push(`/news/${article.id}`)}
                >
                  <div className="flex">
                    {article.imageUrl && (
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                          Trending
                        </Badge>
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 mb-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {article.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{article._count.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{article._count.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}