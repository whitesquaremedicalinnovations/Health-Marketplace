"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { 
  MessageSquare, 
  Calendar,
  Building,
  MapPin,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Filter,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Application {
  id: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
  jobRequirement: {
    id: string;
    title: string;
    description: string;
    type: string;
    specialization: string | null;
    location: string;
    date: string | null;
    additionalInformation: string | null;
    clinic: {
      id: string;
      clinicName: string;
      clinicAddress: string;
      profileImage: string | null;
    };
  };
}

export default function MyApplications() {
  const { userId } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchApplications();
  }, [userId]);

  const fetchApplications = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/doctor/get-my-pitches?doctorId=${userId}`);
      setApplications(response.data.pitches);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId: string) => {
    setWithdrawingId(applicationId);
    try {
      await axiosInstance.post(`/api/doctor/withdraw-pitch/${applicationId}`, {
        doctorId: userId
      });
      
      // Update the local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'WITHDRAWN' as const }
            : app
        )
      );
      
      alert("Application withdrawn successfully");
    } catch (error: any) {
      console.error("Error withdrawing application:", error);
      alert(error.response?.data?.message || "Failed to withdraw application");
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'WITHDRAWN': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <AlertCircle className="h-4 w-4" />;
      case 'ACCEPTED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'WITHDRAWN': return <Trash2 className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
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

  const formatSpecialization = (spec: string) => {
    return spec.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredApplications = applications.filter(app => 
    statusFilter === "all" || app.status === statusFilter
  );

  const statusCounts = {
    all: applications.length,
    PENDING: applications.filter(app => app.status === 'PENDING').length,
    ACCEPTED: applications.filter(app => app.status === 'ACCEPTED').length,
    REJECTED: applications.filter(app => app.status === 'REJECTED').length,
    WITHDRAWN: applications.filter(app => app.status === 'WITHDRAWN').length,
  };

  if (loading) {
    return <Loading variant="page" text="Loading your applications..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-white mb-4">
                My Applications
              </h1>
              <p className="text-blue-100 text-lg mb-6">
                Track all your job applications and their current status
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{statusCounts.all}</div>
                  <div className="text-blue-100 text-sm">Total Applications</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{statusCounts.PENDING}</div>
                  <div className="text-blue-100 text-sm">Pending</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{statusCounts.ACCEPTED}</div>
                  <div className="text-blue-100 text-sm">Accepted</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{statusCounts.REJECTED}</div>
                  <div className="text-blue-100 text-sm">Rejected</div>
                </div>
              </div>
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-300/20 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Filter */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                  <Filter className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Filter Applications</CardTitle>
              </div>
              <Button
                onClick={() => router.push("/requirements")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Find New Jobs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status ({statusCounts.all})</SelectItem>
                  <SelectItem value="PENDING">Pending ({statusCounts.PENDING})</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted ({statusCounts.ACCEPTED})</SelectItem>
                  <SelectItem value="REJECTED">Rejected ({statusCounts.REJECTED})</SelectItem>
                  <SelectItem value="WITHDRAWN">Withdrawn ({statusCounts.WITHDRAWN})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {statusFilter === "all" ? "No Applications Yet" : `No ${statusFilter.toLowerCase()} Applications`}
              </h3>
              <p className="text-gray-600 mb-6">
                {statusFilter === "all" 
                  ? "Start applying for positions to track your applications here."
                  : `You don't have any ${statusFilter.toLowerCase()} applications at the moment.`
                }
              </p>
              <Button 
                onClick={() => router.push("/requirements")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Browse Available Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-gray-200">
                        <AvatarImage src={application.jobRequirement.clinic.profileImage || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                          {application.jobRequirement.clinic.clinicName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{application.jobRequirement.title}</h3>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building className="h-4 w-4" />
                          <span>{application.jobRequirement.clinic.clinicName}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(application.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(application.status)}
                        {application.status.toLowerCase()}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{application.jobRequirement.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {formatJobType(application.jobRequirement.type)}
                    </Badge>
                    {application.jobRequirement.specialization && (
                      <Badge variant="outline" className="text-xs">
                        {formatSpecialization(application.jobRequirement.specialization)}
                      </Badge>
                    )}
                  </div>

                  <p className="text-gray-700 line-clamp-2">
                    {application.jobRequirement.description}
                  </p>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Your Message:</strong> {application.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        {application.jobRequirement.date 
                          ? `Job Date: ${new Date(application.jobRequirement.date).toLocaleDateString()}`
                          : "No specific date"
                        }
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApplication(application)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {application.status === 'PENDING' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleWithdraw(application.id)}
                          disabled={withdrawingId === application.id}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {withdrawingId === application.id ? "Withdrawing..." : "Withdraw"}
                        </Button>
                      )}
                      {application.status === 'ACCEPTED' && (
                        <Button
                          size="sm"
                          onClick={() => router.push("/connections")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          View Job
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Application Details Dialog */}
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-gray-900">
                Application Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedApplication && (
              <div className="space-y-6">
                {/* Job Info */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedApplication.jobRequirement.clinic.profileImage || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                        {selectedApplication.jobRequirement.clinic.clinicName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold text-blue-900">{selectedApplication.jobRequirement.title}</h3>
                      <p className="text-blue-700 font-medium">{selectedApplication.jobRequirement.clinic.clinicName}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-600">{selectedApplication.jobRequirement.location}</span>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <Badge className={getStatusColor(selectedApplication.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(selectedApplication.status)}
                          {selectedApplication.status.toLowerCase()}
                        </div>
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Job Description */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">Job Description</h4>
                  <p className="text-gray-700">{selectedApplication.jobRequirement.description}</p>
                </div>

                {/* Additional Information */}
                {selectedApplication.jobRequirement.additionalInformation && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-900">Additional Information</h4>
                    <p className="text-gray-700">{selectedApplication.jobRequirement.additionalInformation}</p>
                  </div>
                )}

                {/* Your Application */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">Your Application Message</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{selectedApplication.message}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">Application Timeline</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Applied on {new Date(selectedApplication.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedApplication(null)}
              >
                Close
              </Button>
              {selectedApplication?.status === 'PENDING' && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleWithdraw(selectedApplication.id);
                    setSelectedApplication(null);
                  }}
                  disabled={withdrawingId === selectedApplication.id}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Withdraw Application
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 