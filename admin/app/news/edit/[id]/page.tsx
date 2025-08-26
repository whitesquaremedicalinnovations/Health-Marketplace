"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Separator } from "../../../../components/ui/separator";
import { ImageUpload } from "../../../../components/ui/image-upload";
import { RichTextEditor } from "../../../../components/ui/rich-text-editor";
import { LoadingSpinner } from "../../../../components/ui/loading-spinner";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "../../../../components/ui/modal";
import { toast } from "sonner";
import { adminApi, type NewsItem } from "../../../../lib/api";
import { useAuthStore } from "../../../../lib/auth-store";

interface NewsFormData {
  title: string;
  content: string;
  imageUrl: string;
  isPublished: boolean;
}

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const { admin } = useAuthStore();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState<NewsFormData>({
    title: "",
    content: "",
    imageUrl: "",
    isPublished: false,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const newsId = params?.id as string;

  useEffect(() => {
    const fetchNews = async () => {
      if (!newsId) return;
      
      try {
        setLoading(true);
        const data = await adminApi.getNewsById(newsId);
        const news = data.news;
        
        setNewsItem(news);
        setFormData({
          title: news.title || "",
          content: news.content || "",
          imageUrl: news.imageUrl || "",
          isPublished: news.isPublished || false,
        });
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters long";
    }

    if (!formData.content.trim() || formData.content === "<p><br></p>") {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (publish?: boolean) => {
    if (!validateForm()) {
      toast.error("Please fix the errors before continuing");
      return;
    }

    if (!newsId) {
      toast.error("News ID is required");
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        ...formData,
        isPublished: publish !== undefined ? publish : formData.isPublished,
      };

      await adminApi.updateNews(newsId, submitData);
      
      toast.success("News article updated successfully!");
      router.push("/news");
    } catch (error) {
      console.error("Error updating news:", error);
      toast.error("Failed to update news article. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!newsId) return;

    setDeleting(true);

    try {
      await adminApi.deleteNews(newsId);
      toast.success("News article deleted successfully!");
      router.push("/news");
    } catch (error) {
      console.error("Error deleting news:", error);
      toast.error("Failed to delete news article. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handlePreview = () => {
    if (!validateForm()) {
      toast.error("Please complete the form to preview");
      return;
    }
    
    // Open preview in new tab/window
    const previewWindow = window.open("", "_blank");
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Preview: ${formData.title}</title>
            <style>
              body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
              .header { margin-bottom: 2rem; }
              .title { font-size: 2rem; font-weight: bold; margin-bottom: 1rem; }
              .meta { color: #666; margin-bottom: 2rem; }
              .image { width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin-bottom: 2rem; }
              .content { line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">${formData.title}</h1>
              <div class="meta">Preview • Updated ${new Date().toLocaleDateString()}</div>
            </div>
            ${formData.imageUrl ? `<img src="${formData.imageUrl}" alt="${formData.title}" class="image" />` : ''}
            <div class="content">${formData.content}</div>
          </body>
        </html>
      `);
      previewWindow.document.close();
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
      <div className="flex items-center gap-4 mb-8">
        <Link href="/news">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to News
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Edit News Article</h1>
          <p className="text-muted-foreground">Update your news article</p>
        </div>
        <Modal>
          <ModalTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Delete News Article</ModalTitle>
              <ModalDescription>
                Are you sure you want to delete this news article? This action cannot be undone.
              </ModalDescription>
            </ModalHeader>
            <ModalFooter>
              <Button variant="outline">Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete Article
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Article Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title *
              </label>
              <Input
                id="title"
                placeholder="Enter article title..."
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.title}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-medium">
                Featured Image
              </label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) =>
                  setFormData({ ...formData, imageUrl: url || "" })
                }
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content *
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(content) =>
                  setFormData({ ...formData, content })
                }
                placeholder="Write your article content here..."
                height="400px"
                className={errors.content ? "border-destructive" : ""}
              />
              {errors.content && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.content}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview & Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={submitting}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleSubmit(false)}
                disabled={submitting}
              >
                {submitting ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save as Draft
              </Button>
              
              <Button
                onClick={() => handleSubmit(true)}
                disabled={submitting}
              >
                {submitting ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {formData.isPublished ? "Update Published" : "Publish Article"}
              </Button>
            </div>
            
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Current Status</h4>
              <div className="flex items-center gap-2">
                <Badge variant={formData.isPublished ? "default" : "secondary"}>
                  {formData.isPublished ? "Published" : "Draft"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Created on {new Date(newsItem.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}