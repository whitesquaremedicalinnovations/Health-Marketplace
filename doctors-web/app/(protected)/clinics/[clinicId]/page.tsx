'use client';

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Briefcase, 
  ArrowLeft,
  MessageSquare,
  Star,
  Calendar,
  Shield,
  Award,
  Heart,
  Navigation,
  Camera,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { cn } from "@/lib/utils";

// Updated interfaces to match backend response
interface ClinicProfileImage {
  docUrl: string;
}

interface ClinicGalleryImage {
  id: string;
  docUrl: string;
  name: string;
}

interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
  profileImage: {
    docUrl: string;
  } | null;
}

interface Review {
  id: string;
  doctor: Doctor;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Pitch {
  id: string;
  doctor: Doctor;
  jobRequirement: JobRequirement;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  message?: string;
  createdAt: string;
}

interface JobRequirement {
  id: string;
  title: string;
  description: string;
  type: 'FULLTIME' | 'PARTTIME' | 'ONETIME';
  specialization: string | null;
  pitches: Pitch[];
  location: string;
  date: string | null;
  createdAt: string;
  requirementStatus: 'POSTED' | 'COMPLETED';
  additionalInformation?: string;
}

interface Clinic {
  id: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhoneNumber: string;
  clinicAdditionalDetails: string | null;
  clinicProfileImage: string | null;
  profileImage: ClinicProfileImage | null;
  documents: ClinicGalleryImage[];
  latitude: number | null;
  longitude: number | null;
  ownerName: string;
  ownerPhoneNumber: string;
  email: string;
  jobRequirements: JobRequirement[];
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  isVerified: boolean;
}

interface ErrorState {
  message: string;
  code?: string;
  retryable: boolean;
}

export default function ClinicProfile() {
  const { clinicId } = useParams();
  const { userId } = useAuth();
  const router = useRouter();

  // State management
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [imageError, setImageError] = useState<Set<string>>(new Set());

  // Fetch clinic data
  const fetchClinic = useCallback(async () => {
    if (!clinicId || typeof clinicId !== 'string') {
      setError({
        message: "Invalid clinic ID",
        retryable: false
      });
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await axiosInstance.get(`/api/clinic/get-clinic/${clinicId}`);
      
      if (response.data?.success && response.data?.data) {
        setClinic(response.data.data);
      } else {
        setError({
          message: "Clinic data not found",
          retryable: true
        });
      }
    } catch (err: unknown) {
      console.error("Error fetching clinic:", err);
      
      const error = err as { response?: { data?: { message?: string }; status?: number }; message?: string };
      const errorMessage = error.response?.data?.message || error.message || "Failed to load clinic";
      const isRetryable = !error.response || (error.response.status ?? 0) >= 500 || error.response.status === 0;
      
      setError({
        message: errorMessage,
        code: error.response?.status?.toString(),
        retryable: isRetryable
      });
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [clinicId]);

  // Initial data fetch
  useEffect(() => {
    fetchClinic();
  }, [fetchClinic]);

  // Retry mechanism
  const handleRetry = () => {
    setRetrying(true);
    setLoading(true);
    fetchClinic();
  };

  // Utility functions
  const formatJobType = (type: string) => {
    switch (type) {
      case 'FULLTIME': return 'Full-time';
      case 'PARTTIME': return 'Part-time';
      case 'ONETIME': return 'One-time';
      default: return type;
    }
  };

  const formatSpecialization = (spec: string) => {
    return spec.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const getOpenPositions = () => {
    if (!clinic?.jobRequirements) return [];
    return clinic.jobRequirements.filter(job => job.requirementStatus === "POSTED");
  };

  const getApplicationsCount = (requirement: JobRequirement) => {
    return requirement.pitches?.length || 0;
  };

  const hasUserApplied = (requirement: JobRequirement) => {
    if (!userId || !requirement.pitches) return false;
    return requirement.pitches.some(pitch => pitch.doctor.id === userId);
  };

  // Action handlers would go here when implemented

  const openInMaps = () => {
    if (clinic?.latitude && clinic?.longitude) {
      const url = `https://www.google.com/maps?q=${clinic.latitude},${clinic.longitude}`;
      window.open(url, '_blank');
    }
  };

  const handleImageError = (imageUrl: string) => {
    setImageError(prev => new Set([...prev, imageUrl]));
  };

  const handleContactClinic = () => {
    if (clinic?.email) {
      window.open(`mailto:${clinic.email}?subject=Partnership Inquiry - ${clinic.clinicName}`, '_blank');
    }
  };

  // Render loading state
  if (loading && !retrying) {
    return <Loading variant="page" text="Loading clinic profile..." />;
  }

  // Render error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {error.code === '404' ? 'Clinic Not Found' : 'Something went wrong'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error.message}
            </p>
            <div className="flex gap-2 justify-center">
              {error.retryable && (
                <Button 
                  onClick={handleRetry}
                  disabled={retrying}
                  className="flex items-center gap-2"
                >
                  {retrying ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Try Again
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={() => router.push('/search-clinics')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render clinic not found
  if (!clinic && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Clinic Not Found</h3>
            <p className="text-gray-600 mb-4">The clinic you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Button onClick={() => router.push('/search-clinics')}>
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const openPositions = getOpenPositions();
  const profileImageUrl = clinic?.profileImage?.docUrl || clinic?.clinicProfileImage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-4 md:p-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Loading overlay during retry */}
        {retrying && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <Loading variant="default" text="Retrying..." />
          </div>
        )}

        {/* Clinic Header */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-gray-200 flex-shrink-0">
                <AvatarImage 
                  src={profileImageUrl || undefined} 
                  alt={clinic?.clinicName}
                  onError={() => handleImageError(profileImageUrl || '')}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-2xl">
                  {clinic?.clinicName?.[0] || 'C'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">
                      {clinic?.clinicName}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Building className="h-4 w-4 flex-shrink-0" />
                      <span className="break-words">Owned by Dr. {clinic?.ownerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="break-words">{clinic?.clinicAddress}</span>
                    </div>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-3">
                      {openPositions.length > 0 ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {openPositions.length} Open Position{openPositions.length > 1 ? 's' : ''}
                        </Badge>
                      ) : (
                        <Badge variant="outline">No current openings</Badge>
                      )}
                      
                      {clinic?.averageRating && clinic?.totalReviews ? (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {clinic.averageRating.toFixed(1)} ({clinic.totalReviews} reviews)
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not rated yet</Badge>
                      )}
                      
                      {clinic?.isVerified && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={handleContactClinic}
                      size="sm"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                    
                    {clinic?.latitude && clinic?.longitude && (
                      <Button
                        variant="outline"
                        onClick={openInMaps}
                        size="sm"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Directions
                      </Button>
                    )}
                    
                    {openPositions.length > 0 && (
                      <Button
                        onClick={() => router.push(`/requirements?clinic=${clinic?.id}`)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        size="sm"
                      >
                        <Briefcase className="h-4 w-4 mr-2" />
                        View Jobs ({openPositions.length})
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">About the Clinic</CardTitle>
              </CardHeader>
              <CardContent>
                {clinic?.clinicAdditionalDetails ? (
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {clinic.clinicAdditionalDetails}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">No additional information provided.</p>
                )}
              </CardContent>
            </Card>

            {/* Open Positions */}
            {openPositions.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Current Openings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {openPositions.slice(0, 3).map((requirement) => (
                      <div 
                        key={requirement.id} 
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-2 break-words">
                              {requirement.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {formatJobType(requirement.type)}
                              </Badge>
                              {requirement.specialization && (
                                <Badge variant="outline" className="text-xs">
                                  {formatSpecialization(requirement.specialization)}
                                </Badge>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{getApplicationsCount(requirement)} applied</span>
                              </div>
                              {requirement.date && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(requirement.date).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm line-clamp-2 mb-2">
                              {requirement.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-500 break-words">
                                {requirement.location}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => router.push(`/requirements/view/${requirement.id}`)}
                            disabled={hasUserApplied(requirement)}
                            className="flex-shrink-0"
                          >
                            {hasUserApplied(requirement) ? 'Applied' : 'View Details'}
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {openPositions.length > 3 && (
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/requirements?clinic=${clinic?.id}`)}
                        className="w-full"
                      >
                        View All {openPositions.length} Positions
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Clinic Gallery */}
            {clinic?.documents && clinic.documents.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Clinic Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {clinic.documents.slice(0, 6).map((doc, index) => (
                      <div 
                        key={doc.id || index} 
                        className="aspect-square rounded-lg overflow-hidden bg-gray-100 group cursor-pointer"
                        onClick={() => window.open(doc.docUrl, '_blank')}
                      >
                        {!imageError.has(doc.docUrl) ? (
                          <Image
                            src={doc.docUrl}
                            alt={doc.name || `Clinic image ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={() => handleImageError(doc.docUrl)}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Camera className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {clinic.documents.length > 6 && (
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      +{clinic.documents.length - 6} more images
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Location & Map */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-gray-900">Location</CardTitle>
                  {clinic?.latitude && clinic?.longitude && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMap(!showMap)}
                    >
                      {showMap ? 'Hide Map' : 'Show Map'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 break-words">
                        {clinic?.clinicAddress}
                      </p>
                    </div>
                  </div>
                  
                  {showMap && clinic?.latitude && clinic?.longitude && (
                    <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&q=${clinic.latitude},${clinic.longitude}&zoom=15`}
                        allowFullScreen
                        title="Clinic Location"
                        loading="lazy"
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    {clinic?.latitude && clinic?.longitude && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openInMaps}
                        className="flex-1"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Get Directions
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const address = clinic?.clinicAddress;
                        if (address) {
                          navigator.clipboard.writeText(address);
                        }
                      }}
                      className="flex-1"
                    >
                      Copy Address
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">Clinic Phone</p>
                    <p className="font-medium break-words">{clinic?.clinicPhoneNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium break-words">{clinic?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">Owner Phone</p>
                    <p className="font-medium break-words">{clinic?.ownerPhoneNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clinic Certifications & Badges */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Certifications & Badges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-blue-900">Verified Clinic</div>
                    <div className="text-xs text-blue-600">Documents verified</div>
                  </div>
                </div>
                
                {clinic?.averageRating && clinic.averageRating >= 4 && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Award className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-green-900">Top Rated</div>
                      <div className="text-xs text-green-600">High satisfaction score</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Heart className="h-6 w-6 text-purple-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-purple-900">Trusted Partner</div>
                    <div className="text-xs text-purple-600">Platform member since {new Date(clinic?.createdAt || '').getFullYear()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            {clinic?.reviews && clinic.reviews.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {clinic.reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={review.doctor.profileImage?.docUrl} />
                          <AvatarFallback className="text-xs">
                            {review.doctor.fullName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm text-gray-900">
                              Dr. {review.doctor.fullName}
                            </p>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-3 w-3",
                                    i < review.rating 
                                      ? "text-yellow-400 fill-current" 
                                      : "text-gray-300"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            {timeAgo(review.createdAt)}
                          </p>
                          {review.comment && (
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {clinic.reviews.length > 3 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {/* TODO: Navigate to reviews page */}}
                    >
                      View All {clinic.reviews.length} Reviews
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 