"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, AlertCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { ImageUpload } from "../../../components/ui/image-upload";
import { RichTextEditor } from "../../../components/ui/rich-text-editor";
import { LoadingSpinner } from "../../../components/ui/loading-spinner";
import { toast } from "sonner";
import { adminApi } from "../../../lib/api";
import { useAuthStore } from "../../../lib/auth-store";

interface NewsFormData {
  title: string;
  content: string;
  imageUrl: string;
  isPublished: boolean;
}

export default function CreateNewsPage() {
  const router = useRouter();
  const { admin } = useAuthStore();
  const [formData, setFormData] = useState<NewsFormData>({
    title: "",
    content: "",
    imageUrl: "",
    isPublished: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = async (publish: boolean = false) => {
    if (!validateForm()) {
      toast.error("Please fix the errors before continuing");
      return;
    }

    if (!admin?.id) {
      toast.error("Authentication required");
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        ...formData,
        isPublished: publish,
        adminId: admin.id,
      };

      await adminApi.createNews(submitData);
      
      toast.success(
        publish ? "News article published successfully!" : "News article saved as draft!"
      );
      
      router.push("/news");
    } catch (error) {
      console.error("Error creating news:", error);
      toast.error("Failed to create news article. Please try again.");
    } finally {
      setSubmitting(false);
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
              <div class="meta">Preview • ${new Date().toLocaleDateString()}</div>
            </div>
            ${formData.imageUrl ? `<img src="${formData.imageUrl}" alt="${formData.title}" class="image" />` : ''}
            <div class="content">${formData.content}</div>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/news">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to News
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create News Article</h1>
          <p className="text-muted-foreground">Write and publish your news article</p>
        </div>
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
                Publish Article
              </Button>
            </div>
            
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Article Status</h4>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Draft</Badge>
                <span className="text-sm text-muted-foreground">
                  This article will be saved as a draft until you publish it
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}