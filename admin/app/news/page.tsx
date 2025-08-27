"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, 
  Plus,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  User,
  Search,
  Filter,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  ChevronDown,
  MoreHorizontal,
  Heart,
  MessageSquare,
  TrendingUp
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { LoadingSpinner } from "../../components/ui/loading-spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "../../components/ui/modal";
import { toast } from "sonner";
import { adminApi, type NewsItem } from "../../lib/api";
import { useAuthStore } from "../../lib/auth-store";

type ViewMode = "grid" | "list";
type SortField = "createdAt" | "title" | "isPublished";
type SortOrder = "asc" | "desc";

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { admin, logout } = useAuthStore();

  // Fetch news data from API
  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllNews();
      setNews(data.news);
    } catch (error) {
      toast.error("Failed to fetch news data");
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    let filtered = [...news];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "published") {
        filtered = filtered.filter(article => article.isPublished);
      } else if (statusFilter === "draft") {
        filtered = filtered.filter(article => !article.isPublished);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortField) {
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case "isPublished":
          aVal = a.isPublished ? 1 : 0;
          bVal = b.isPublished ? 1 : 0;
          break;
        case "createdAt":
        default:
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredNews(filtered);
  }, [news, searchTerm, statusFilter, sortField, sortOrder]);

  const handleDelete = async (newsId: string) => {
    setDeleting(newsId);
    try {
      await adminApi.deleteNews(newsId);
      toast.success("News article deleted successfully!");
      fetchNews();
    } catch (error) {
      toast.error("Failed to delete news article");
      console.error("Error deleting news:", error);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...'
      : textContent;
  };

  const getStatusStats = () => {
    const published = news.filter(item => item.isPublished).length;
    const drafts = news.filter(item => !item.isPublished).length;
    return { published, drafts, total: news.length };
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">News Management</h1>
          <p className="text-muted-foreground">
            Manage your news articles and announcements
          </p>
        </div>
        <Link href="/news/create">
          <Button size="lg" className="w-full lg:w-auto">
            <Plus className="h-5 w-5 mr-2" />
            Create Article
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Articles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.published}</p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Edit3 className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.drafts}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{filteredNews.length}</p>
                <p className="text-xs text-muted-foreground">Filtered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="justify-between min-w-[120px]">
                    <Filter className="h-4 w-4 mr-2" />
                    {statusFilter === "all" ? "All Status" : 
                     statusFilter === "published" ? "Published" : "Drafts"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("published")}>
                    Published
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                    Drafts
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="justify-between min-w-[140px]">
                    {sortOrder === "asc" ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
                    Sort by {sortField === "createdAt" ? "Date" : sortField === "title" ? "Title" : "Status"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setSortField("createdAt"); setSortOrder("desc"); }}>
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortField("createdAt"); setSortOrder("asc"); }}>
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortField("title"); setSortOrder("asc"); }}>
                    Title A-Z
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortField("title"); setSortOrder("desc"); }}>
                    Title Z-A
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setSortField("isPublished"); setSortOrder("desc"); }}>
                    Published First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortField("isPublished"); setSortOrder("asc"); }}>
                    Drafts First
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none border-l"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Content */}
      {filteredNews.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filters"
                : "Get started by creating your first news article"
              }
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Link href="/news/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Article
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" 
          : "space-y-4"
        }>
          {filteredNews.map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {viewMode === "grid" ? (
                // Grid View
                <>
                  {article.imageUrl && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={article.isPublished ? "default" : "secondary"}>
                          {article.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/news/view/${article.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/news/edit/${article.id}`}>
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <Modal>
                              <ModalTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </ModalTrigger>
                              <ModalContent>
                                <ModalHeader>
                                  <ModalTitle>Delete Article</ModalTitle>
                                  <ModalDescription>
                                    Are you sure you want to delete &quot;{article.title}&quot;? This action cannot be undone.
                                  </ModalDescription>
                                </ModalHeader>
                                <ModalFooter>
                                  <Button variant="outline">Cancel</Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => handleDelete(article.id)}
                                    disabled={deleting === article.id}
                                  >
                                    {deleting === article.id ? (
                                      <LoadingSpinner size="sm" className="mr-2" />
                                    ) : (
                                      <Trash2 className="h-4 w-4 mr-2" />
                                    )}
                                    Delete
                                  </Button>
                                </ModalFooter>
                              </ModalContent>
                            </Modal>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-3">
                          {truncateContent(article.content)}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(article.createdAt)}
                        </div>
                        {article.likes !== undefined && (
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {article.likes || 0}
                          </div>
                        )}
                        {article.comments !== undefined && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {article.comments || 0}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Link href={`/news/view/${article.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/news/edit/${article.id}`} className="flex-1">
                          <Button size="sm" className="w-full">
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                // List View
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {article.imageUrl && (
                      <div className="w-24 h-16 flex-shrink-0 overflow-hidden rounded-md">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg line-clamp-1">
                            {article.title}
                          </h3>
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {truncateContent(article.content, 200)}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/news/view/${article.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/news/edit/${article.id}`}>
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <Modal>
                              <ModalTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </ModalTrigger>
                              <ModalContent>
                                <ModalHeader>
                                  <ModalTitle>Delete Article</ModalTitle>
                                  <ModalDescription>
                                    Are you sure you want to delete &quot;{article.title}&quot;? This action cannot be undone.
                                  </ModalDescription>
                                </ModalHeader>
                                <ModalFooter>
                                  <Button variant="outline">Cancel</Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => handleDelete(article.id)}
                                    disabled={deleting === article.id}
                                  >
                                    {deleting === article.id ? (
                                      <LoadingSpinner size="sm" className="mr-2" />
                                    ) : (
                                      <Trash2 className="h-4 w-4 mr-2" />
                                    )}
                                    Delete
                                  </Button>
                                </ModalFooter>
                              </ModalContent>
                            </Modal>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <Badge variant={article.isPublished ? "default" : "secondary"} className="text-xs">
                            {article.isPublished ? "Published" : "Draft"}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(article.createdAt)}
                          </div>
                          {article.likes !== undefined && (
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {article.likes || 0}
                            </div>
                          )}
                          {article.comments !== undefined && (
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {article.comments || 0}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Link href={`/news/view/${article.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/news/edit/${article.id}`}>
                            <Button size="sm">
                              <Edit3 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}