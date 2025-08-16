"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  Camera,
  Briefcase,
  Users,
  Star,
  TrendingUp,
  FileText,
  Upload,
  Trash2,
  Eye,
  Download,
  Plus,
  Image as ImageIcon,
  FileIcon,
  Loader2
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import LocationSearch from "@/components/ui/location-search";
import { APIProvider } from "@vis.gl/react-google-maps";
import axios from "axios";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Clinic {
  id: string;
  email: string;
  ownerName: string;
  ownerPhoneNumber: string;
  clinicName: string;
  clinicAddress: string;
  latitude?: number;
  longitude?: number;
  clinicPhoneNumber: string;
  clinicAdditionalDetails: string | null;
  profileImage: {
    docUrl: string;
  } | null;
  clinicProfileImage?: string | null;
  jobRequirements?: JobRequirement[];
  connections?: Connection[];
  documents?: Document[];
  reviews?: Review[];
  galleryImages?: GalleryImage[];
  averageRating?: number;
  totalReviews?: number;
}

interface Document {
  id: string;
  docUrl: string;
  name: string;
  type: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  doctor: {
    id: string;
    fullName: string;
    specialization: string;
    profileImage: {
      docUrl: string;
    } | null;
  };
}

interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
}

interface JobRequirement {
  id: string;
  title: string;
  type: string;
  requirementStatus: string;
  createdAt: string;
  _count: {
    pitches: number;
  };
}

interface Connection {
  id: string;
  doctor: {
    fullName: string;
    specialization: string;
  };
  jobRequirement: {
    title: string;
    type: string;
  };
  createdAt: string;
}

interface UploadedItem {
  url: string;
  fieldName: string;
}

export default function Profile() {
  const { userId } = useAuth();
  const [profile, setProfile] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<Clinic>>({});
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [newGalleryCaption, setNewGalleryCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await axiosInstance.get(`/api/clinic/get-clinic/${userId}`);
      const clinic = response.data?.success ? response.data.data : response.data.clinic;
      
      // Initialize empty arrays if not present
      const clinicWithDefaults = {
        ...clinic,
        jobRequirements: clinic.jobRequirements || [],
        connections: clinic.connections || [],
        documents: clinic.documents || [],
        reviews: clinic.reviews || [],
        galleryImages: clinic.galleryImages || []
      };
      
      setProfile(clinicWithDefaults);
      setEditData(clinicWithDefaults);
    } catch (error) {
      console.log("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    if (!userId || !editData) return;
    
    setSaving(true);
    try {
      // Create a new object for updateData to avoid direct mutation issues
      const updateData: Partial<Clinic> = { ...editData };
      
      // Remove fields that should not be sent in the update payload
      delete updateData.email;
      delete updateData.jobRequirements;
      delete updateData.connections;
      delete updateData.documents;
      delete updateData.reviews;
      delete updateData.galleryImages;
      delete updateData.id;
      delete updateData.profileImage;
      delete updateData.averageRating;
      delete updateData.totalReviews;
      
      console.log("Sending update data:", updateData);
      
      const response = await axiosInstance.post(`/api/user/profile/update/${userId}`, {
        ...updateData,
        role: "CLINIC"
      });
      
      console.log("Update response:", response.data);
      
      // Handle the API response properly
      if (response.status === 200 && response.data) {
        let updatedClinic;
        
        // Handle different response formats
        if (response.data.success && response.data.data) {
          updatedClinic = response.data.data;
        } else if (response.data.clinic) {
          updatedClinic = response.data.clinic;
        } else {
          // Fallback - try to get clinic from current profile + editData
          updatedClinic = { ...profile, ...editData };
        }
        
        // Ensure arrays exist with fallbacks
        const clinicWithDefaults = {
          ...updatedClinic,
          jobRequirements: updatedClinic?.jobRequirements || profile?.jobRequirements || [],
          connections: updatedClinic?.connections || profile?.connections || [],
          documents: updatedClinic?.documents || profile?.documents || [],
          reviews: updatedClinic?.reviews || profile?.reviews || [],
          galleryImages: updatedClinic?.galleryImages || profile?.galleryImages || []
        };
        
        console.log("Updated profile data:", clinicWithDefaults);
        
        setProfile(clinicWithDefaults);
        setEditData(clinicWithDefaults);
      setEditing(false);
      toast("Profile updated successfully!");
        
        // Refresh the profile from server to ensure sync
        setTimeout(() => {
          fetchProfile();
        }, 500);
      } else {
        throw new Error(`Invalid response: ${JSON.stringify(response.data)}`);
      }
    } catch (error: unknown) {
      console.log("Error updating profile:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      toast(`Update failed: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const formatJobType = (type: string) => {
    switch (type) {
      case 'FULLTIME': return 'Full-time';
      case 'PARTTIME': return 'Part-time';
      case 'ONETIME': return 'One-time';
      default: return type;
    }
  };

  const handleDocumentUpload = async (files: File[]) => {
    if (!userId || !profile) return;
    
    setUploadingDocument(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      
      const uploadResponse = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      interface UploadedFile {
        url: string;
      }

      const documentsToCreate = uploadResponse.data.uploaded.map((uploadedFile: UploadedFile, index: number) => ({
        clinicId: profile.id,
        docUrl: uploadedFile.url,
        name: files[index].name,
        type: files[index].type,
      }));

      for (const doc of documentsToCreate) {
        await axiosInstance.post('/api/clinic/upload-document', doc);
      }      
      await fetchProfile(); // Refresh data
      toast("Documents uploaded successfully!");
      setFiles([]);
      setDocumentModalOpen(false);
    } catch (error) {
      console.log("Error uploading documents:", error);
      toast("Failed to upload documents");
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await axiosInstance.delete(`/api/clinic/delete-document/${documentId}`);
      await fetchProfile(); // Refresh data
      toast("Document deleted successfully!");
    } catch (error) {
      console.log("Error deleting document:", error);
      toast("Failed to delete document");
    }
  };

  const handleGalleryUpload = async (files: File[]) => {
    if (!userId || !profile) return;
    
    setUploadingGallery(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      
      const uploadResponse = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      interface UploadedFile {
        url: string;
      }

      const imagesToCreate = uploadResponse.data.uploaded.map((uploadedFile: UploadedFile) => ({
        clinicId: profile.id,
        imageUrl: uploadedFile.url,
        caption: newGalleryCaption, 
      }));

      for (const image of imagesToCreate) {
        await axiosInstance.post('/api/clinic/add-gallery-image', image);
      }
      
      setNewGalleryCaption("");
      await fetchProfile(); // Refresh data
      toast("Gallery images added successfully!");
      setFiles([]);
      setGalleryModalOpen(false);
    } catch (error) {
      console.log("Error uploading gallery images:", error);
      toast("Failed to upload gallery images");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGalleryImage = async (imageId: string) => {
    try {
      await axiosInstance.delete(`/api/clinic/delete-gallery-image/${imageId}`);
      await fetchProfile(); // Refresh data
      toast("Gallery image deleted successfully!");
    } catch (error) {
      console.log("Error deleting gallery image:", error);
      toast("Failed to delete gallery image");
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ));
  };

  const handleProfileImageUpload = async (file: File) => {
    setUploadingProfileImage(true);
    try {
      const formData = new FormData();
      formData.append("profileImage", file);
      
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const uploadData = await uploadResponse.json();
      
      if (uploadResponse.ok) {
        const profileImageUrl = uploadData.uploaded.find((item: UploadedItem) => item.fieldName === "profileImage")?.url;
        
        if (profileImageUrl) {
          // Update profile with new profile image
          const updateResponse = await axiosInstance.post(`/api/user/profile/update/${userId}`, {
            role: "CLINIC",
            profileImage: profileImageUrl
          });
          
          if (updateResponse.status === 200) {
            // Refresh profile data
            const response = await axiosInstance.get(`/api/clinic/get-clinic/${userId}`);
            const clinic = response.data?.success ? response.data.data : response.data.clinic;
            setProfile(clinic);
            setEditData(clinic);
          }
        }
      }
    } catch (error) {
      console.log("Error uploading profile image:", error);
    } finally {
      setUploadingProfileImage(false);
    }
  };

  if (loading) {
    return <Loading variant="page" text="Loading your profile..." />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-gray-600 mb-4">Unable to load your profile. Please try again.</p>
            <Button onClick={fetchProfile}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Profile Header */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-6">
              <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                    <AvatarImage src={profile.profileImage?.docUrl || ""} alt={profile.clinicName} />
                    <AvatarFallback className="bg-white text-blue-600 text-2xl font-bold">
                      {profile.clinicName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleProfileImageUpload(file);
                        }
                      }}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 border-2 border-white bg-white hover:bg-gray-50"
                      onClick={() => document.getElementById('profile-image-upload')?.click()}
                      disabled={uploadingProfileImage}
                    >
                      {uploadingProfileImage ? (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>  
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {profile.clinicName}
                  </h1>
                  <p className="text-blue-100 text-lg mb-2">
                    Owned by Dr. {profile.ownerName}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {profile.jobRequirements?.length || 0} Job Posts
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {profile.connections?.length || 0} Active Hires
                    </Badge>
                    {(profile.totalReviews || 0) > 0 && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {profile.averageRating}/5 ({profile.totalReviews} reviews)
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={saving}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                {saving ? (
                  <>Saving...</>
                ) : editing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-300/20 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Clinic Information */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Clinic Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="clinicName" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Clinic Name
                </Label>
                <Input
                  id="clinicName"
                  value={editing ? editData.clinicName || "" : profile.clinicName}
                  onChange={(e) => editing && setEditData({...editData, clinicName: e.target.value})}
                  disabled={!editing}
                  className={editing ? "border-blue-300" : "bg-gray-50"}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clinicAddress" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Clinic Address
                </Label>
                {editing ? (
                  <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                    <LocationSearch
                      value={editData.clinicAddress || ""}
                      onChange={(value) => setEditData({...editData, clinicAddress: value})}
                      onPlaceSelect={(place) => {
                        if (place && place.formatted_address) {
                          const lat = place.geometry?.location?.lat();
                          const lng = place.geometry?.location?.lng();
                          setEditData({
                            ...editData,
                            clinicAddress: place.formatted_address,
                            latitude: lat || undefined,
                            longitude: lng || undefined
                          });
                        }
                      }}
                    />
                  </APIProvider>
                ) : (
                <Textarea
                  id="clinicAddress"
                    value={profile.clinicAddress}
                    disabled
                    className="bg-gray-50"
                  rows={3}
                />
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clinicPhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Clinic Phone
                </Label>
                <Input
                  id="clinicPhone"
                  value={editing ? editData.clinicPhoneNumber || "" : profile.clinicPhoneNumber}
                  onChange={(e) => editing && setEditData({...editData, clinicPhoneNumber: e.target.value})}
                  disabled={!editing}
                  className={editing ? "border-blue-300" : "bg-gray-50"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalDetails" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  About the Clinic
                </Label>
                <Textarea
                  id="additionalDetails"
                  value={editing ? editData.clinicAdditionalDetails || "" : profile.clinicAdditionalDetails || ""}
                  onChange={(e) => editing && setEditData({...editData, clinicAdditionalDetails: e.target.value})}
                  disabled={!editing}
                  className={editing ? "border-blue-300" : "bg-gray-50"}
                  rows={4}
                  placeholder="Describe your clinic, services, specialties..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Owner Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ownerName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Owner Name
                </Label>
                <Input
                  id="ownerName"
                  value={editing ? editData.ownerName || "" : profile.ownerName}
                  onChange={(e) => editing && setEditData({...editData, ownerName: e.target.value})}
                  disabled={!editing}
                  className={editing ? "border-blue-300" : "bg-gray-50"}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  Email cannot be changed here. Update it in your account settings.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ownerPhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Owner Phone
                </Label>
                <Input
                  id="ownerPhone"
                  value={editing ? editData.ownerPhoneNumber || "" : profile.ownerPhoneNumber}
                  onChange={(e) => editing && setEditData({...editData, ownerPhoneNumber: e.target.value})}
                  disabled={!editing}
                  className={editing ? "border-blue-300" : "bg-gray-50"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Activity & Statistics */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Quick Stats</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">{profile.jobRequirements?.length || 0}</div>
                  <div className="text-sm text-blue-600">Total Job Posts</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">{profile.connections?.length || 0}</div>
                  <div className="text-sm text-green-600">Active Hires</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">
                    {profile.jobRequirements?.filter(req => req.requirementStatus === 'POSTED').length || 0}
                  </div>
                  <div className="text-sm text-purple-600">Open Positions</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-900">{profile.averageRating?.toFixed(1) || '0.0'}</div>
                  <div className="text-sm text-yellow-600">Average Rating</div>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-900">{profile.documents?.length || 0}</div>
                  <div className="text-sm text-indigo-600">Documents</div>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-pink-900">{profile.galleryImages?.length || 0}</div>
                  <div className="text-sm text-pink-600">Gallery Images</div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Job Posts */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg">
                    <Briefcase className="h-5 w-5 text-yellow-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Recent Posts</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {(profile.jobRequirements?.length || 0) > 0 ? (
                  <div className="space-y-3">
                    {profile.jobRequirements?.slice(0, 3).map((job) => (
                      <div key={job.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{job.title}</h4>
                          <Badge 
                            variant={job.requirementStatus === 'POSTED' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {job.requirementStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatJobType(job.type)}</span>
                          <span>{job._count?.pitches || 0} applications</span>
                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No job posts yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Hires */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-teal-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Recent Hires</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {(profile.connections?.length || 0) > 0 ? (
                  <div className="space-y-3">
                    {profile.connections?.slice(0, 3).map((connection) => (
                      <div key={connection.id} className="p-3 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 text-sm">
                          Dr. {connection.doctor?.fullName}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>{connection.doctor?.specialization}</span>
                          <span>{connection.jobRequirement?.title}</span>
                          <span>{new Date(connection.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No hires yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Sections */}
        {/* Documents Section */}
        <div className="mt-8">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Documents</CardTitle>
                </div>
                <Dialog open={documentModalOpen} onOpenChange={setDocumentModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload New Document</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="documentFile">Choose File</Label>
                        <Input
                          id="documentFile"
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files) setFiles((p)=>[...p, ...Array.from(files)]);
                          }}
                          disabled={uploadingDocument}
                          multiple
                        />
                      </div>
                      {
                        files.length > 0 && (
                          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center gap-4">
                            {files.map((file)=>(
                              <div key={file.name} className=" relative flex flex-col items-center justify-center border p-2">
                                {file.type==="image/jpeg" || file.type==="image/png" ? (
                                  <Image src={URL.createObjectURL(file)} alt={file.name} className="w-20 h-20 object-cover" width={80} height={80} objectFit="cover" />
                                ) : (
                                  <>
                                    <FileIcon className="h-20 w-20 text-blue-600 mb-2" />
                                    <p className="text-sm text-gray-500">{file.name}</p>
                                  </>
                                )}
                                <Button variant="outline" size="icon" className="absolute top-0 right-0" onClick={()=>setFiles((p)=>p.filter((f)=>f.name !== file.name))}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )
                      }
                      <Button onClick={()=>handleDocumentUpload(files)}>
                        {
                          uploadingDocument?(
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ):(
                            <p>Upload {files.length} files</p>
                          )
                        }
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {(profile.documents?.length || 0) > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.documents?.map((doc) => (
                    <div key={doc.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => window.open(doc.docUrl, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = doc.docUrl;
                              link.download = doc.name;
                              link.click();
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;{doc.name}&quot;? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteDocument(doc.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">{doc.name}</h4>
                      <p className="text-xs text-gray-500">{doc.type}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No documents uploaded yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gallery Section */}
        <div className="mt-8">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-pink-100 to-red-100 rounded-lg">
                    <ImageIcon className="h-5 w-5 text-pink-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Clinic Gallery</CardTitle>
                </div>
                <Dialog open={galleryModalOpen} onOpenChange={setGalleryModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Gallery Image</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="galleryImages">Choose File</Label>
                        <Input
                          id="galleryImage"
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files) setFiles((p)=>[...p, ...Array.from(files)]);
                          }}
                          disabled={uploadingDocument}
                          multiple
                        />
                      </div>
                      {
                        files.length > 0 && (
                          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center gap-4">
                            {files.map((file)=>(
                              <div key={file.name} className=" relative flex flex-col items-center justify-center border p-2">
                                {file.type==="image/jpeg" || file.type==="image/png" ? (
                                  <Image src={URL.createObjectURL(file)} alt={file.name} className="w-20 h-20 object-cover" width={80} height={80} objectFit="cover" />
                                ) : (
                                  <>
                                    <FileIcon className="h-20 w-20 text-blue-600 mb-2" />
                                    <p className="text-sm text-gray-500">{file.name}</p>
                                  </>
                                )}
                                <Button variant="outline" size="icon" className="absolute top-0 right-0" onClick={()=>setFiles((p)=>p.filter((f)=>f.name !== file.name))}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )
                      }
                      <Button onClick={()=>handleGalleryUpload(files)}>
                        {
                          uploadingGallery?(
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ):(
                            <p>Upload {files.length} files</p>
                          )
                        }
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {(profile.galleryImages?.length || 0) > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.galleryImages?.map((image) => (
                    <div key={image.id} className="relative group">
                      <Image
                        src={image.imageUrl}
                        alt={image.caption || "Clinic image"}
                        width={500}
                        height={300}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="secondary" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Image</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this image? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteGalleryImage(image.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      {image.caption && (
                        <p className="text-sm text-gray-600 mt-2">{image.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No gallery images added yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Reviews & Ratings</CardTitle>
                </div>
                {(profile.totalReviews || 0) > 0 && (
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {renderStars(Math.round(profile.averageRating || 0))}
                      <span className="text-lg font-bold text-gray-900">{profile.averageRating}/5</span>
                    </div>
                    <p className="text-sm text-gray-500">{profile.totalReviews} reviews</p>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {(profile.reviews?.length || 0) > 0 ? (
                <div className="space-y-4">
                  {profile.reviews?.slice(0, 5).map((review) => (
                    <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <Image
                            src={review.doctor.profileImage?.docUrl || `https://ui-avatars.com/api/?name=${review.doctor.fullName}&background=3b82f6&color=ffffff`}
                            alt={review.doctor.fullName}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">Dr. {review.doctor.fullName}</h4>
                              <p className="text-sm text-gray-500">{review.doctor.specialization}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 text-sm">{review.comment}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(profile.reviews?.length || 0) > 5 && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Showing 5 of {profile.reviews?.length} reviews</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}