"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Image as ImageIcon, Video, Music, File, Loader2 } from "lucide-react";
import { toast } from 'sonner';

interface FileWithPreview {
  file: File;
  preview?: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
}

interface AttachmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (files: File[], urls: string[]) => void;
}

export default function AttachmentModal({ open, onOpenChange, onSend }: AttachmentModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const getFileType = (file: File): 'image' | 'video' | 'audio' | 'document' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) return 'document';
    return 'other';
  };

  const getFileIcon = (type: string) => {
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
    
    files.forEach(file => {
      const fileType = getFileType(file);
      const fileData: FileWithPreview = {
        file,
        type: fileType
      };

      // Create preview for images
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileData.preview = e.target?.result as string;
          setSelectedFiles(prev => [...prev, fileData]);
        };
        reader.readAsDataURL(file);
      } else {
        setSelectedFiles(prev => [...prev, fileData]);
      }
    });

    // Reset input
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate upload progress
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed for ${file.name}`);
      }

      const result = await response.json();
      
      // Simulate progress completion
      setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      
      return result.uploaded[0].url;
    });

    return Promise.all(uploadPromises);
  };

  const handleSend = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      const files = selectedFiles.map(sf => sf.file);
      const uploadedUrls = await uploadFiles(files);
      
      onSend(files, uploadedUrls);
      
      // Reset state
      setSelectedFiles([]);
      setUploadProgress({});
      onOpenChange(false);
    } catch (error) {
      console.log('Upload failed:', error);
      toast('Failed to upload files. Please try again.');
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
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-900 dark:text-white">Send Attachments</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* File Selection Area */}
          <input
            type="file"
            id="file-input"
            multiple
            accept="*/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <label htmlFor="file-input">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Choose files to upload</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Click here or drag and drop files</p>
            </div>
          </label>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Selected Files ({selectedFiles.length})
              </h3>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedFiles.map((fileData, index) => {
                  const IconComponent = getFileIcon(fileData.type);
                  const progress = uploadProgress[fileData.file.name] || 0;

                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {/* File Icon/Preview */}
                      {fileData.type === 'image' && fileData.preview ? (
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <Image 
                            src={fileData.preview} 
                            alt={fileData.file.name}
                            className="object-cover rounded"
                            fill
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0">
                          <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {fileData.file.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatFileSize(fileData.file.size)}
                        </p>
                        
                        {/* Upload Progress */}
                        {uploading && progress > 0 && (
                          <div className="mt-1">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Remove Button */}
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
            className="bg-blue-600 hover:bg-blue-700 text-white"
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