"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  User, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Briefcase,
  Calendar,
  Award,
  Clock
} from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import { Loading } from "@/components/ui/loading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

interface Doctor {
  id: string;
  fullName: string;
  email: string;
  specialization: string;
  experience: number;
  about: string;
  profileImage?: {
    docUrl: string;
  };
}

interface Pitch {
  id: string;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
  doctor: Doctor;
}

interface Requirement {
  id: string;
  title: string;
  description: string;
  type: string;
  specialization?: string;
  requirementStatus: string;
}

export default function ViewApplications() {
  const { userId } = useAuth();
  const router = useRouter();
  const { requirementId } = useParams();
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedPitch, setSelectedPitch] = useState<Pitch | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch requirement details
        const reqResponse = await axiosInstance.get(`/api/clinic/get-requirement/${requirementId}`);
        if (reqResponse.status === 200) {
          setRequirement(reqResponse.data.requirement);
        }

        // Fetch pitches for this requirement
        const pitchesResponse = await axiosInstance.get(`/api/clinic/get-pitches/${requirementId}`);
        if (pitchesResponse.status === 200) {
          setPitches(pitchesResponse.data.pitches);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to fetch applications");
      } finally {
        setLoading(false);
      }
    };

    if (requirementId) {
      fetchData();
    }
  }, [requirementId]);

  const handleAccept = async () => {
    if (!selectedPitch) return;
    
    try {
      setActionLoading(selectedPitch.id);
      const response = await axiosInstance.patch(`/api/clinic/accept-pitch/${selectedPitch.id}`, {
        clinicId: userId,
        requirementId
      });
      
      if (response.status === 200) {
        // Update the pitch status locally
        setPitches(prev => prev.map(pitch => 
          pitch.id === selectedPitch.id 
            ? { ...pitch, status: 'ACCEPTED' as const }
            : pitch
        ));
        setShowAcceptDialog(false);
        setSelectedPitch(null);
      } else {
        alert("Failed to accept application");
      }
    } catch (error) {
      console.error("Error accepting pitch:", error);
      alert("Failed to accept application");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedPitch) return;
    
    try {
      setActionLoading(selectedPitch.id);
      const response = await axiosInstance.patch(`/api/clinic/reject-pitch/${selectedPitch.id}`, {
        clinicId: userId
      });
      
      if (response.status === 200) {
        // Update the pitch status locally
        setPitches(prev => prev.map(pitch => 
          pitch.id === selectedPitch.id 
            ? { ...pitch, status: 'REJECTED' as const }
            : pitch
        ));
        setShowRejectDialog(false);
        setSelectedPitch(null);
      } else {
        alert("Failed to reject application");
      }
    } catch (error) {
      console.error("Error rejecting pitch:", error);
      alert("Failed to reject application");
    } finally {
      setActionLoading(null);
    }
  };

  const openAcceptDialog = (pitch: Pitch) => {
    setSelectedPitch(pitch);
    setShowAcceptDialog(true);
  };

  const openRejectDialog = (pitch: Pitch) => {
    setSelectedPitch(pitch);
    setShowRejectDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'WITHDRAWN':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      case 'WITHDRAWN':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <Loading variant="page" icon="users" text="Loading applications..." />;
  }

  if (!requirement) {
    return <div>Requirement not found</div>;
  }

  const pendingPitches = pitches.filter(p => p.status === 'PENDING');
  const acceptedPitches = pitches.filter(p => p.status === 'ACCEPTED');
  const rejectedPitches = pitches.filter(p => p.status === 'REJECTED');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/requirements/view/${requirementId}`)}
                    className="text-white hover:bg-white/20"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Requirement
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-white/90">
                    <div className="text-sm">Total Applications</div>
                    <div className="text-2xl font-bold">{pitches.length}</div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h1 className="text-4xl font-bold text-white mb-2">
                  Applications for &quot;{requirement.title}&quot;
                </h1>
                <p className="text-emerald-100 text-lg">
                  Review and manage applications from healthcare professionals
                </p>
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2 text-white/90">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-sm">{pendingPitches.length} Pending</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-sm">{acceptedPitches.length} Accepted</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-sm">{rejectedPitches.length} Rejected</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-300/20 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Applications List */}
        {pitches.length === 0 ? (
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Applications Yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Healthcare professionals haven&apos;t applied for this requirement yet. Check back later or share your requirement to get more visibility.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pitches.map((pitch) => (
              <Card key={pitch.id} className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-6">
                        {/* Doctor Avatar */}
                        <div className="w-16 h-16 p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0 hover:cursor-pointer hover:border-2 hover:border-blue-600" onClick={()=>router.push(`/search-doctors/${pitch.doctor.id}`)}>
                          {pitch.doctor.profileImage ? (
                            <Image
                              src={pitch.doctor.profileImage.docUrl} 
                              alt={pitch.doctor.fullName}
                              className="w-16 h-16 rounded-2xl object-cover"
                              width={64}
                              height={64}
                            />
                          ) : (
                            <User className="h-8 w-8 text-blue-600" />
                          )}
                        </div>

                        {/* Doctor Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{pitch.doctor.fullName}</h3>
                            <Badge className={getStatusColor(pitch.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(pitch.status)}
                                {pitch.status}
                              </span>
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-3 text-gray-600">
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              <span>{pitch.doctor.specialization}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              <span>{pitch.doctor.experience} years experience</span>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4 line-clamp-2">{pitch.doctor.about}</p>

                          {pitch.message && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">Application Message</span>
                              </div>
                              <p className="text-gray-700 text-sm">{pitch.message}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>Applied {new Date(pitch.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-6">
                      {pitch.status === 'PENDING' && (
                        <>
                          <Button
                            onClick={() => openAcceptDialog(pitch)}
                            disabled={actionLoading === pitch.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            {actionLoading === pitch.id ? (
                              <Loading variant="button" size="sm" className="mr-2" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            )}
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => openRejectDialog(pitch)}
                            disabled={actionLoading === pitch.id}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {pitch.status === 'ACCEPTED' && (
                        <Button
                          onClick={() => router.push('/connections')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          View Connection
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Accept Dialog */}
      <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent className="border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              Accept Application
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to accept this application from <strong>{selectedPitch?.doctor.fullName}</strong>? 
              This will create a connection and they will be able to communicate with you directly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAccept}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Accept Application
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent className="border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Application
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to reject this application from <strong>{selectedPitch?.doctor.fullName}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Application
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 