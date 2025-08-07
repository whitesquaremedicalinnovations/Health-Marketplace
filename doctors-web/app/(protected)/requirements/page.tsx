"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import {
  Search, 
  Calendar,
  Building,
  MapPin,
  Send,
  Filter,
  Clock,
  Users,
  Star,
  Briefcase,
  Heart,
  ArrowUpDown,
  SlidersHorizontal
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JobRequirement {
  id: string;
  title: string;
  description: string;
  type: 'FULLTIME' | 'PARTTIME' | 'ONETIME';
  specialization: string | null;
  location: string;
  date: string | null;
  additionalInformation: string | null;
  createdAt: string;
  applicationsCount: number;
  clinic: {
    id: string;
    clinicName: string;
    clinicAddress: string;
    profileImage: string | null;
    totalActiveJobs: number;
  };
}

export default function JobRequirements() {
  const { userId } = useAuth();
  const router = useRouter();
  const [requirements, setRequirements] = useState<JobRequirement[]>([]);
  const [filteredRequirements, setFilteredRequirements] = useState<JobRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequirement, setSelectedRequirement] = useState<JobRequirement | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [locationRange, setLocationRange] = useState(50);

  useEffect(() => {
    fetchRequirements();
  }, [userId]);

  useEffect(() => {
    filterAndSortRequirements();
  }, [requirements, searchTerm, specializationFilter, typeFilter, sortBy]);

    const fetchRequirements = async () => {
    if (!userId) return;
    
          setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/doctor/get-requirements-by-location`, {
        params: {
          doctorId: userId,
          radius: locationRange
        }
      });
      setRequirements(response.data.requirements);
        } catch (error) {
          console.error("Error fetching requirements:", error);
        } finally {
          setLoading(false);
        }
  };

  const filterAndSortRequirements = () => {
    let filtered = requirements.filter(req => {
      const matchesSearch = searchTerm === "" || 
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.clinic.clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecialization = specializationFilter === "all" || req.specialization === specializationFilter;
      const matchesType = typeFilter === "all" || req.type === typeFilter;
      
      return matchesSearch && matchesSpecialization && matchesType;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "applications_low":
          return a.applicationsCount - b.applicationsCount;
        case "applications_high":
          return b.applicationsCount - a.applicationsCount;
        case "clinic_name":
          return a.clinic.clinicName.localeCompare(b.clinic.clinicName);
        default:
          return 0;
      }
    });

    setFilteredRequirements(filtered);
  };

  const handleApply = async () => {
    if (!selectedRequirement || !applicationMessage.trim()) return;
    
    setApplyingId(selectedRequirement.id);
    try {
      await axiosInstance.post(`/api/doctor/pitch-requirement/${selectedRequirement.id}`, {
        doctorId: userId,
        message: applicationMessage.trim()
      });
      
      alert("Application submitted successfully!");
      setShowApplyDialog(false);
      setApplicationMessage("");
      setSelectedRequirement(null);
      
      // Refresh requirements to update application count
      fetchRequirements();
    } catch (error: any) {
      console.error("Error submitting application:", error);
      alert(error.response?.data?.message || "Failed to submit application");
    } finally {
      setApplyingId(null);
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

  const getUniqueSpecializations = () => {
    const specializations = requirements
      .map(req => req.specialization)
      .filter(spec => spec !== null) as string[];
    return [...new Set(specializations)];
  };

  const openApplyDialog = (requirement: JobRequirement) => {
    setSelectedRequirement(requirement);
    setShowApplyDialog(true);
    setApplicationMessage("");
  };

  if (loading) {
    return <Loading variant="page" text="Finding great opportunities for you..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-white mb-4">
                Discover Great Opportunities
                </h1>
              <p className="text-blue-100 text-lg mb-6">
                Find job opportunities from top clinics in your area and advance your medical career
                </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{requirements.length}</div>
                  <div className="text-blue-100 text-sm">Available Jobs</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{filteredRequirements.length}</div>
                  <div className="text-blue-100 text-sm">Matching Your Filters</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">
                    {new Set(requirements.map(req => req.clinic.id)).size}
                  </div>
                  <div className="text-blue-100 text-sm">Partner Clinics</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">
                    {requirements.filter(req => req.type === 'FULLTIME').length}
                  </div>
                  <div className="text-blue-100 text-sm">Full-time Positions</div>
                </div>
              </div>
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-300/20 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg">
                  <SlidersHorizontal className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Search & Filter Jobs</CardTitle>
              </div>
              <Button
                onClick={() => router.push("/search-doctors")}
                variant="outline"
                className="border-2"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Browse All Jobs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs, clinics, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Specialization Filter */}
              <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="All Specializations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {getUniqueSpecializations().map(spec => (
                    <SelectItem key={spec} value={spec}>
                      {formatSpecialization(spec)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Job Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="All Job Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Job Types</SelectItem>
                  <SelectItem value="FULLTIME">Full-time</SelectItem>
                  <SelectItem value="PARTTIME">Part-time</SelectItem>
                  <SelectItem value="ONETIME">One-time</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="applications_low">Fewer Applications</SelectItem>
                  <SelectItem value="applications_high">More Applications</SelectItem>
                  <SelectItem value="clinic_name">Clinic Name A-Z</SelectItem>
                </SelectContent>
              </Select>

              {/* Quick Filter Buttons */}
              <div className="flex gap-2">
                <Button
                  variant={typeFilter === "FULLTIME" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter(typeFilter === "FULLTIME" ? "all" : "FULLTIME")}
                  className="flex-1"
                >
                  Full-time
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Showing {filteredRequirements.length} of {requirements.length} jobs</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSpecializationFilter("all");
                  setTypeFilter("all");
                  setSortBy("newest");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Job Requirements List */}
        {filteredRequirements.length === 0 ? (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Jobs Match Your Criteria
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search terms to find more opportunities.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSpecializationFilter("all");
                  setTypeFilter("all");
                }}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                Show All Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredRequirements.map((requirement) => (
              <Card key={requirement.id} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <ProfileAvatar
                        src={requirement.clinic.profileImage}
                        fallback={requirement.clinic.clinicName[0]}
                        size="md"
                        profileId={requirement.clinic.id}
                        profileType="clinic"
                      />
                        <div>
                        <h3 className="text-xl font-bold text-gray-900">{requirement.title}</h3>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building className="h-4 w-4" />
                          <span>{requirement.clinic.clinicName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {formatJobType(requirement.type)}
                        </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="h-3 w-3" />
                        <span>{requirement.applicationsCount} applied</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{requirement.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Posted {new Date(requirement.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {requirement.specialization && (
                      <Badge variant="outline" className="text-xs">
                        {formatSpecialization(requirement.specialization)}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {requirement.clinic.totalActiveJobs} active jobs
                    </Badge>
                  </div>

                  <p className="text-gray-700 line-clamp-3">
                    {requirement.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        {requirement.date 
                          ? `Start Date: ${new Date(requirement.date).toLocaleDateString()}`
                          : "Flexible start date"
                        }
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequirement(requirement)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openApplyDialog(requirement)}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Job Details Dialog */}
        <Dialog open={!!selectedRequirement && !showApplyDialog} onOpenChange={() => setSelectedRequirement(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-gray-900">
                Job Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedRequirement && (
              <div className="space-y-6">
                {/* Clinic Info */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-4">
                    <ProfileAvatar
                      src={selectedRequirement.clinic.profileImage}
                      fallback={selectedRequirement.clinic.clinicName[0]}
                      size="lg"
                      profileId={selectedRequirement.clinic.id}
                      profileType="clinic"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-green-900">{selectedRequirement.title}</h3>
                      <p className="text-green-700 font-medium">{selectedRequirement.clinic.clinicName}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">{selectedRequirement.location}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-green-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{selectedRequirement.applicationsCount} applications</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{selectedRequirement.clinic.totalActiveJobs} active positions</span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {formatJobType(selectedRequirement.type)}
                    </Badge>
                  </div>
                </div>

                {/* Job Description */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">Job Description</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedRequirement.description}</p>
                </div>

                {/* Additional Information */}
                {selectedRequirement.additionalInformation && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-900">Additional Information</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedRequirement.additionalInformation}</p>
                  </div>
                )}

                {/* Job Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-900">Job Type</h5>
                    <Badge variant="outline">{formatJobType(selectedRequirement.type)}</Badge>
                  </div>
                  {selectedRequirement.specialization && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-900">Specialization</h5>
                      <Badge variant="outline">{formatSpecialization(selectedRequirement.specialization)}</Badge>
                    </div>
                  )}
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-900">Posted Date</h5>
                    <p className="text-sm text-gray-600">{new Date(selectedRequirement.createdAt).toLocaleDateString()}</p>
                  </div>
                  {selectedRequirement.date && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-900">Start Date</h5>
                      <p className="text-sm text-gray-600">{new Date(selectedRequirement.date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedRequirement(null)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowApplyDialog(true);
                }}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Apply for This Job
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Apply Dialog */}
        <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-gray-900">
                Apply for Position
              </DialogTitle>
            </DialogHeader>
            
            {selectedRequirement && (
              <div className="space-y-6">
                {/* Job Summary */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-bold text-blue-900">{selectedRequirement.title}</h3>
                  <p className="text-blue-700">{selectedRequirement.clinic.clinicName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-600 text-sm">{selectedRequirement.location}</span>
                  </div>
                </div>

                {/* Application Message */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">Cover Message</h4>
                  <Textarea
                    placeholder="Write a compelling message explaining why you're interested in this position and what makes you a great fit..."
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-sm text-gray-500">
                    {applicationMessage.length}/500 characters
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowApplyDialog(false);
                  setApplicationMessage("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={!applicationMessage.trim() || applyingId === selectedRequirement?.id}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {applyingId === selectedRequirement?.id ? "Submitting..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}