"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
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
  Clock,
  Calendar
} from "lucide-react";
import { Loading } from "@/components/ui/loading";

interface Clinic {
  id: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhoneNumber: string;
  clinicAdditionalDetails: string | null;
  profileImage: string | null;
  totalActiveJobs: number;
  distance?: number;
  owner: {
    email: string;
    ownerName: string;
    ownerPhoneNumber: string;
  };
  requirements?: JobRequirement[];
}

interface JobRequirement {
  id: string;
  title: string;
  description: string;
  type: 'FULLTIME' | 'PARTTIME' | 'ONETIME';
  specialization: string | null;
  location: string;
  date: string | null;
  createdAt: string;
  applicationsCount: number;
}

export default function ClinicProfile() {
  const { clinicId } = useParams();
  const { userId } = useAuth();
  const router = useRouter();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinic = async () => {
      if (!clinicId) return;
      
      try {
        const response = await axiosInstance.get(`/api/clinic/get-clinic/${clinicId}`);
        setClinic(response.data.clinic);
      } catch (error) {
        console.error("Error fetching clinic:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinic();
  }, [clinicId]);

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

  if (loading) {
    return <Loading variant="page" text="Loading clinic profile..." />;
  }

  if (!clinic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Clinic Not Found</h3>
            <p className="text-gray-600 mb-4">The clinic you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push('/search-clinics')}>
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Clinic Header */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-gray-200">
                <AvatarImage src={clinic.profileImage || ""} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-2xl">
                  {clinic.clinicName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{clinic.clinicName}</h1>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Building className="h-4 w-4" />
                  <span>Owned by Dr. {clinic.owner.ownerName}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{clinic.clinicAddress}</span>
                </div>
                <div className="flex gap-3">
                  {clinic.totalActiveJobs > 0 ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {clinic.totalActiveJobs} Open Position{clinic.totalActiveJobs > 1 ? 's' : ''}
                    </Badge>
                  ) : (
                    <Badge variant="outline">No current openings</Badge>
                  )}
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    4.8 Rating
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(`mailto:${clinic.owner.email}?subject=Partnership Inquiry - ${clinic.clinicName}`, '_blank')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact
                </Button>
                {clinic.totalActiveJobs > 0 && (
                  <Button
                    onClick={() => router.push(`/requirements?clinic=${clinic.id}`)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    View Jobs
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Clinic Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">About the Clinic</CardTitle>
              </CardHeader>
              <CardContent>
                {clinic.clinicAdditionalDetails ? (
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {clinic.clinicAdditionalDetails}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">No additional information provided.</p>
                )}
              </CardContent>
            </Card>

            {/* Open Positions */}
            {clinic.requirements && clinic.requirements.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Current Openings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clinic.requirements.slice(0, 3).map((requirement) => (
                      <div key={requirement.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">{requirement.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
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
                                <span>{requirement.applicationsCount} applied</span>
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm line-clamp-2">{requirement.description}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => router.push(`/requirements?job=${requirement.id}`)}
                            className="ml-4"
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    ))}
                    {clinic.requirements.length > 3 && (
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/requirements?clinic=${clinic.id}`)}
                        className="w-full"
                      >
                        View All {clinic.requirements.length} Positions
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Clinic Phone</p>
                    <p className="font-medium">{clinic.clinicPhoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{clinic.owner.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Owner Phone</p>
                    <p className="font-medium">{clinic.owner.ownerPhoneNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">{clinic.totalActiveJobs}</div>
                  <div className="text-sm text-blue-600">Open Positions</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">4.8</div>
                  <div className="text-sm text-green-600">Rating</div>
                </div>
                {clinic.distance && (
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">{clinic.distance.toFixed(1)}km</div>
                    <div className="text-sm text-purple-600">Distance</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 