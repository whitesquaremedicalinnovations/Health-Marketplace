"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { 
  Building, 
  Calendar, 
  MapPin,
  Phone,
  Clock,
  Heart,
  Briefcase,
  Star, 
  Users,
  Eye,
  Contact,
  Award,
  ArrowRight
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ProfileAvatar } from "@/components/ui/profile-avatar";

interface Connection {
  id: string;
  connectedAt: string;
  clinic: {
    id: string;
    clinicName: string;
    clinicAddress: string;
    clinicPhoneNumber: string;
    profileImage: string | null;
  };
  job: {
      id: string;
      title: string;
    description: string;
      type: string;
    specialization: string | null;
    location: string;
    additionalInformation: string | null;
    createdAt: string;
  };
}

export default function Connections() {
  const { userId } = useAuth();
  const router = useRouter();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);

  const fetchConnections = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/doctor/get-my-accepted-pitches?doctorId=${userId}`);
      const connectionsData = response.data?.success ? response.data.data.connections : response.data?.connections || [];
      setConnections(connectionsData);
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

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

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'FULLTIME': return 'bg-green-100 text-green-800';
      case 'PARTTIME': return 'bg-blue-100 text-blue-800';
      case 'ONETIME': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConnectionDuration = (connectedAt: string) => {
    const now = new Date();
    const connectionDate = new Date(connectedAt);
    const diffInMonths = (now.getFullYear() - connectionDate.getFullYear()) * 12 + 
                        (now.getMonth() - connectionDate.getMonth());
    
    if (diffInMonths < 1) {
      const diffInDays = Math.floor((now.getTime() - connectionDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffInDays === 0 ? "Today" : `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
    } else {
      const years = Math.floor(diffInMonths / 12);
      return `${years} year${years === 1 ? '' : 's'} ago`;
    }
  };

  if (loading) {
    return <Loading variant="page" icon="heart" text="Loading your active positions..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-white mb-4">
                My Active Positions
                  </h1>
              <p className="text-blue-100 text-lg mb-6">
                All your current working relationships and job connections
                  </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{connections.length}</div>
                  <div className="text-blue-100 text-sm">Active Positions</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">
                    {connections.filter(c => c.job.type === 'FULLTIME').length}
                  </div>
                  <div className="text-blue-100 text-sm">Full-time Jobs</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">
                    {new Set(connections.map(c => c.clinic.id)).size}
                  </div>
                  <div className="text-blue-100 text-sm">Partner Clinics</div>
                </div>
              </div>
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-300/20 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Connections List */}
        {connections.length === 0 ? (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-12 w-12 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Active Positions</h3>
              <p className="text-gray-600 mb-6">
                You don&apos;t have any active job positions yet. Start applying to build your professional network.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => router.push("/jobs")}
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                >
                  Find Jobs
                </Button>
              <Button 
                  onClick={() => router.push("/applications")}
                  variant="outline"
              >
                  View Applications
              </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {connections.map((connection) => (
              <Card key={connection.id} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <ProfileAvatar 
                        src={connection.clinic.profileImage || ""}
                        fallback={connection.clinic.clinicName[0]}
                        size="lg"
                        profileId={connection.clinic.id}
                        profileType="clinic"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{connection.job.title}</h3>
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Building className="h-4 w-4" />
                          <span className="font-medium">{connection.clinic.clinicName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>Connected {getConnectionDuration(connection.connectedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getJobTypeColor(connection.job.type)}>
                        {formatJobType(connection.job.type)}
                    </Badge>
                      <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <Heart className="h-3 w-3" />
                        <span>Active</span>
                      </div>
                  </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{connection.job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Started {new Date(connection.connectedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {connection.job.specialization && (
                    <Badge variant="outline" className="text-xs">
                      <Award className="h-3 w-3 mr-1" />
                      {formatSpecialization(connection.job.specialization)}
                    </Badge>
                  )}

                  <p className="text-gray-700 line-clamp-2">
                    {connection.job.description}
                  </p>

                  {connection.job.additionalInformation && (
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <p className="text-sm text-emerald-800">
                        <strong>Additional Info:</strong> {connection.job.additionalInformation}
                      </p>
                    </div>
                  )}

                  {/* Clinic Contact Info */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Contact className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Clinic Contact</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>{connection.clinic.clinicAddress}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{connection.clinic.clinicPhoneNumber}</span>
                      </div>
                  </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>Working relationship</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedConnection(connection)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
        )}

        {/* Connection Details Dialog */}
        <Dialog open={!!selectedConnection} onOpenChange={() => setSelectedConnection(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-gray-900">
                Position Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedConnection && (
              <div className="space-y-6">
                {/* Header */}
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <div className="flex items-start gap-4">
                    <ProfileAvatar 
                      src={selectedConnection.clinic.profileImage || ""}
                      fallback={selectedConnection.clinic.clinicName[0]}
                      size="lg"
                      profileId={selectedConnection.clinic.id}
                      profileType="clinic"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-emerald-900">{selectedConnection.job.title}</h3>
                      <p className="text-emerald-700 font-medium">{selectedConnection.clinic.clinicName}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        <span className="text-emerald-600">{selectedConnection.job.location}</span>
                      </div>
                            </div>
                    <div className="ml-auto">
                      <Badge className={getJobTypeColor(selectedConnection.job.type)}>
                        {formatJobType(selectedConnection.job.type)}
                      </Badge>
                            </div>
                          </div>
                        </div>

                {/* Job Description */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">Position Description</h4>
                  <p className="text-gray-700">{selectedConnection.job.description}</p>
                          </div>

                {/* Additional Information */}
                {selectedConnection.job.additionalInformation && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-900">Additional Information</h4>
                    <p className="text-gray-700">{selectedConnection.job.additionalInformation}</p>
                              </div>
                            )}

                {/* Clinic Information */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">Clinic Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <p className="font-medium text-gray-900">{selectedConnection.clinic.clinicName}</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedConnection.clinic.clinicAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{selectedConnection.clinic.clinicPhoneNumber}</span>
                    </div>
                          </div>
                        </div>

                {/* Connection Timeline */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">Connection Timeline</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                    <span>
                      Connected on {new Date(selectedConnection.connectedAt).toLocaleDateString()}
                      ({getConnectionDuration(selectedConnection.connectedAt)})
                    </span>
                          </div>
                  {selectedConnection.job.specialization && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="h-4 w-4" />
                      <span>Specialization: {formatSpecialization(selectedConnection.job.specialization)}</span>
                          </div>
                  )}
                        </div>

                {/* Quick Actions */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-3">Quick Actions</h5>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => router.push(`/clinics/${selectedConnection.clinic.id}`)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Building className="h-4 w-4 mr-2" />
                      View Full Clinic Profile
                    </Button>
                        <Button 
                          size="sm"
                      variant="outline"
                      onClick={() => router.push("/jobs")}
                        >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Find More Opportunities
                        </Button>
                      </div>
                </div>
            </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedConnection(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Call to Action */}
        {connections.length > 0 && (
          <Card className="border-0 shadow-xl bg-gradient-to-r from-emerald-500 to-blue-600 text-white mt-8">
            <CardContent className="text-center py-8">
              <h3 className="text-2xl font-bold mb-3">Keep Growing Your Network</h3>
              <p className="text-emerald-100 mb-6">
                You&apos;re doing great! Continue building professional relationships by exploring new opportunities.
                    </p>
              <div className="flex gap-4 justify-center">
                      <Button 
                  onClick={() => router.push("/jobs")}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-emerald-600"
                      >
                        <Briefcase className="h-4 w-4 mr-2" />
                  Browse More Jobs
                      </Button>
                      <Button 
                  onClick={() => router.push("/profile")}
                        variant="outline"
                  className="border-white text-white hover:bg-white hover:text-emerald-600"
                      >
                        <Users className="h-4 w-4 mr-2" />
                  Update Profile
                      </Button>
                  </div>
                </CardContent>
              </Card>
        )}
      </div>
    </div>
  );
}
