"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Search,
  X
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AxiosError } from "axios";
import { toast } from "sonner";

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

interface Filters {
  status: string;
  jobType: string;
  specialization: string;
  location: string;
  clinic: string;
  searchQuery: string;
  dateFrom: string;
  dateTo: string;
}

export default function MyApplications() {
  const { userId } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    jobType: "all",
    specialization: "all",
    location: "all",
    clinic: "all",
    searchQuery: "",
    dateFrom: "",
    dateTo: ""
  });

  const fetchApplications = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/doctor/get-my-pitches?doctorId=${userId}`);
      setApplications(response.data.pitches);
    } catch (error: unknown) {
      console.log("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

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
      
      toast("Application withdrawn successfully");
    } catch (error: unknown) {
      console.log("Error withdrawing application:", error);
      const errorMessage = error instanceof Error && 'response' in error ? 
        (error as AxiosError).response?.data || "Failed to withdraw application" :
        "Failed to withdraw application";
      alert(errorMessage);
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

  // Get unique values for filter options
  const uniqueJobTypes = [...new Set(applications.map(app => app.jobRequirement.type))];
  const uniqueSpecializations = [...new Set(applications.map(app => app.jobRequirement.specialization).filter((spec): spec is string => spec !== null))];
  const uniqueLocations = [...new Set(applications.map(app => app.jobRequirement.location))];
  const uniqueClinics = [...new Set(applications.map(app => app.jobRequirement.clinic.clinicName))];

  // Filter applications based on all filters
  const filteredApplications = applications.filter(app => {
    // Status filter
    if (filters.status !== "all" && app.status !== filters.status) return false;
    
    // Job type filter
    if (filters.jobType !== "all" && app.jobRequirement.type !== filters.jobType) return false;
    
    // Specialization filter
    if (filters.specialization !== "all" && app.jobRequirement.specialization !== filters.specialization) return false;
    
    // Location filter
    if (filters.location !== "all" && app.jobRequirement.location !== filters.location) return false;
    
    // Clinic filter
    if (filters.clinic !== "all" && app.jobRequirement.clinic.clinicName !== filters.clinic) return false;
    
    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = app.jobRequirement.title.toLowerCase().includes(query);
      const matchesClinic = app.jobRequirement.clinic.clinicName.toLowerCase().includes(query);
      const matchesDescription = app.jobRequirement.description.toLowerCase().includes(query);
      if (!matchesTitle && !matchesClinic && !matchesDescription) return false;
    }
    
    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const applicationDate = new Date(app.createdAt);
      if (filters.dateFrom && applicationDate < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && applicationDate > new Date(filters.dateTo)) return false;
    }
    
    return true;
  });

  const statusCounts = {
    all: applications.length,
    PENDING: applications.filter(app => app.status === 'PENDING').length,
    ACCEPTED: applications.filter(app => app.status === 'ACCEPTED').length,
    REJECTED: applications.filter(app => app.status === 'REJECTED').length,
    WITHDRAWN: applications.filter(app => app.status === 'WITHDRAWN').length,
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      jobType: "all",
      specialization: "all",
      location: "all",
      clinic: "all",
      searchQuery: "",
      dateFrom: "",
      dateTo: ""
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "all" && value !== "");

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

        {/* Filter Section */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                  <Filter className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Filter Applications</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                <Button
                  onClick={() => router.push("/requirements")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Find New Jobs
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {showFilters && (
            <CardContent className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by job title, clinic name, or description..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="pl-10 h-12"
                />
              </div>

              {/* Basic Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
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

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Job Type</Label>
                  <Select value={filters.jobType} onValueChange={(value) => setFilters(prev => ({ ...prev, jobType: value }))}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Filter by job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {uniqueJobTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {formatJobType(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Specialization</Label>
                  <Select value={filters.specialization} onValueChange={(value) => setFilters(prev => ({ ...prev, specialization: value }))}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Filter by specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specializations</SelectItem>
                      {uniqueSpecializations.map(spec => (
                        <SelectItem key={spec} value={spec}>
                          {formatSpecialization(spec)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Location</Label>
                  <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Filter by location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {uniqueLocations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Clinic</Label>
                  <Select value={filters.clinic} onValueChange={(value) => setFilters(prev => ({ ...prev, clinic: value }))}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Filter by clinic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Clinics</SelectItem>
                      {uniqueClinics.map(clinic => (
                        <SelectItem key={clinic} value={clinic}>
                          {clinic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date Range Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">From Date</Label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">To Date</Label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="h-12"
                  />
                </div>
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {filteredApplications.length} of {applications.length} applications
                </p>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {Object.values(filters).filter(value => value !== "all" && value !== "").length} active filters
                  </Badge>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {hasActiveFilters ? "No Applications Match Your Filters" : "No Applications Yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {hasActiveFilters 
                  ? "Try adjusting your filters or clear them to see all applications."
                  : "Start applying for positions to track your applications here."
                }
              </p>
              <div className="flex gap-3 justify-center">
                {hasActiveFilters && (
                  <Button 
                    variant="outline"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                )}
                <Button 
                  onClick={() => router.push("/requirements")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Browse Available Jobs
                </Button>
              </div>
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