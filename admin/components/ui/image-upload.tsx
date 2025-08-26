"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { LoadingSpinner } from "./loading-spinner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  className?: string;
  maxSize?: number; // in MB
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  disabled = false,
  className,
  maxSize = 5
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('files', file);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/admin', '') || 'http://localhost:8000'}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.uploaded[0]?.url;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [onChange, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles: 1,
    disabled: disabled || uploading
  });

  const removeImage = () => {
    onChange(null);
    setError(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative group">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
            <img
              src={value}
              alt="Uploaded image"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={removeImage}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/25 hover:border-primary/50",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center">
            {uploading ? (
              <>
                <LoadingSpinner className="mb-2" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <div className="mb-2 p-2 bg-primary/10 rounded-full">
                  {isDragActive ? (
                    <Upload className="h-6 w-6 text-primary" />
                  ) : (
                    <Image className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {isDragActive
                      ? "Drop your image here"
                      : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP up to {maxSize}MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
};