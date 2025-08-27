"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3, Calendar, User, Eye, Heart, MessageSquare, Share2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Separator } from "../../../../components/ui/separator";
import { LoadingSpinner } from "../../../../components/ui/loading-spinner";
import { toast } from "sonner";
import { adminApi, type NewsItem } from "../../../../lib/api";
import { useAuthStore } from "../../../../lib/auth-store";

export default function ViewNewsPage() {
  const router = useRouter();
  const params = useParams();
  const { admin } = useAuthStore();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ likes: 0, comments: 0 });

  const newsId = params?.id as string;

  useEffect(() => {
    const fetchNews = async () => {
      if (!newsId) return;
      
      try {
        setLoading(true);
        
        // Fetch news item
        const data = await adminApi.getNewsById(newsId);
        const news = data.news;
        setNewsItem(news);

        // Fetch stats
        try {
          const [likesRes, commentsRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/total-news-likes/${newsId}`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/total-news-comments/${newsId}`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
            })
          ]);

          const [likesData, commentsData] = await Promise.all([
            likesRes.ok ? likesRes.json() : { data: { totalLikes: 0 } },
            commentsRes.ok ? commentsRes.json() : { data: { totalComments: 0 } }
          ]);

          setStats({
            likes: likesData.data.totalLikes || 0,
            comments: commentsData.data.totalComments || 0
          });
        } catch (statsError) {
          console.log("Could not fetch stats:", statsError);
        }
        
      } catch (error) {
        console.error("Error fetching news:", error);
        toast.error("Failed to load news article");
        router.push("/news");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [newsId, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: newsItem?.title,
          text: `Check out this article: ${newsItem?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.success("Link copied to clipboard!");
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">News Article Not Found</h1>
          <Link href="/news">
            <Button>Back to News</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/news">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to News
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Link href={`/news/edit/${newsId}`}>
            <Button size="sm">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Article
            </Button>
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <article className="space-y-6">
        {/* Title and Meta */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={newsItem.isPublished ? "default" : "secondary"}>
              {newsItem.isPublished ? "Published" : "Draft"}
            </Badge>
            <span className="text-sm text-muted-foreground">•</span>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(newsItem.createdAt)}
            </div>
            <span className="text-sm text-muted-foreground">•</span>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              Admin
            </div>
          </div>
          
          <h1 className="text-4xl font-bold leading-tight">{newsItem.title}</h1>
          
          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>Article View</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{stats.likes} likes</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{stats.comments} comments</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Featured Image */}
        {newsItem.imageUrl && (
          <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
            <img
              src={newsItem.imageUrl}
              alt={newsItem.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <Card>
          <CardContent className="p-8">
            <div 
              className="prose prose-gray max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground prose-em:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground"
              dangerouslySetInnerHTML={{ __html: newsItem.content }}
            />
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold">Article Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Manage this article or create a new one
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/news/create">
                  <Button variant="outline">Create New Article</Button>
                </Link>
                <Link href={`/news/edit/${newsId}`}>
                  <Button>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit This Article
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </article>

      <style jsx global>{`
        .prose {
          font-size: 16px;
          line-height: 1.7;
        }
        .prose h1 {
          font-size: 2em;
          margin-top: 2em;
          margin-bottom: 1em;
        }
        .prose h2 {
          font-size: 1.5em;
          margin-top: 2em;
          margin-bottom: 1em;
        }
        .prose h3 {
          font-size: 1.25em;
          margin-top: 1.6em;
          margin-bottom: 0.6em;
        }
        .prose p {
          margin: 1.25em 0;
        }
        .prose img {
          border-radius: 0.5rem;
          margin: 2em 0;
        }
        .prose blockquote {
          padding-left: 1.5em;
          border-left: 4px solid;
          margin: 2em 0;
          font-style: italic;
        }
        .prose ul, .prose ol {
          margin: 1.25em 0;
          padding-left: 1.625em;
        }
        .prose li {
          margin: 0.5em 0;
        }
        .prose pre {
          padding: 1em;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5em 0;
        }
        .prose code {
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
      `}</style>
    </div>
  );
}