"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  Upload,
  Loader2
} from "lucide-react";
import Image from "next/image";

interface AttachmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (files: File[], urls: string[]) => void;
}

interface FileWithPreview {
  file: File;
  preview?: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  url?: string;
}

export default function AttachmentModal({ open, onOpenChange, onSend }: AttachmentModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const getFileType = (file: File): 'image' | 'video' | 'audio' | 'document' | 'other' => {
    const type = file.type;
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return 'document';
    return 'other';
  };

  const getFileIcon = (type: 'image' | 'video' | 'audio' | 'document' | 'other') => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'audio': return Music;
      case 'document': return FileText;
      default: return File;
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles: FileWithPreview[] = files.map(file => {
      const fileType = getFileType(file);
      let preview: string | undefined;

      if (fileType === 'image') {
        preview = URL.createObjectURL(file);
      }

      return {
        file,
        preview,
        type: fileType
      };
    });

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadFiles = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const fileData = selectedFiles[i];
      const formData = new FormData();
      formData.append('file', fileData.file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed for ${fileData.file.name}`);
        }

        const result = await response.json();
        uploadedUrls.push(result.uploaded[0].url);
        
        setUploadProgress(prev => ({
          ...prev,
          [fileData.file.name]: 100
        }));
      } catch (error) {
        console.error(`Error uploading ${fileData.file.name}:`, error);
        throw error;
      }
    }

    return uploadedUrls;
  };

  const handleSend = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      const uploadedUrls = await uploadFiles();
      onSend(selectedFiles.map(f => f.file), uploadedUrls);
      
      // Clean up
      selectedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      setSelectedFiles([]);
      setUploadProgress({});
      onOpenChange(false);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl text-gray-900 dark:text-white">
            Send Attachments
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* File Input */}
          <div className="mb-6">
            <Input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              accept="*/*"
            />
            <label htmlFor="file-input">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 dark:hover:border-green-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Choose files to upload
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click here or drag and drop files
                </p>
              </div>
            </label>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Selected Files ({selectedFiles.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedFiles.map((fileData, index) => {
                  const IconComponent = getFileIcon(fileData.type);
                  const progress = uploadProgress[fileData.file.name] || 0;
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      {fileData.type === 'image' && fileData.preview ? (
                        <Image
                          src={fileData.preview}
                          alt={fileData.file.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center flex-shrink-0">
                          <IconComponent className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {fileData.file.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatFileSize(fileData.file.size)}
                        </p>
                        {uploading && progress > 0 && (
                          <div className="mt-1">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div
                                className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {!uploading && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={selectedFiles.length === 0 || uploading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              `Send ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 