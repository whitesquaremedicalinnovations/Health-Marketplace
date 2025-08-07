"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { 
  Search, 
  MapPin, 
  Filter, 
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  Building,
  Star,
  Users,
  Heart,
  Send,
  Loader2
} from "lucide-react";
import { Loading } from "@/components/ui/loading";

enum DoctorSpecialization {
  GENERAL_PHYSICIAN = "GENERAL_PHYSICIAN",
  CARDIOLOGIST = "CARDIOLOGIST",
  DERMATOLOGIST = "DERMATOLOGIST",
  ENDOCRINOLOGIST = "ENDOCRINOLOGIST",
  GYNECOLOGIST = "GYNECOLOGIST",
  NEUROSURGEON = "NEUROSURGEON",
  ORTHOPEDIC_SURGEON = "ORTHOPEDIC_SURGEON",
  PLASTIC_SURGEON = "PLASTIC_SURGEON",
  UROLOGIST = "UROLOGIST",
  ENT_SPECIALIST = "ENT_SPECIALIST",
  PEDIATRICIAN = "PEDIATRICIAN",
  PSYCHIATRIST = "PSYCHIATRIST",
  DENTIST = "DENTIST"
}

enum RequirementType {
  ONETIME = "ONETIME",
  FULLTIME = "FULLTIME",
  PARTTIME = "PARTTIME"
}

interface JobRequirement {
  id: string;
  title: string;
  description: string;
  type: RequirementType;
  specialization: DoctorSpecialization | null;
  location: string;
  date: string | null;
  additionalInformation: string | null;
  createdAt: string;
  clinic: {
    id: string;
    clinicName: string;
    clinicAddress: string;
  profileImage: string | null;
  };
  applicationsCount: number;
}

export default function SearchJobs() {
  const { userId } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<JobRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [submittingApplication, setSubmittingApplication] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [specialization, setSpecialization] = useState<string>("all");
  const [jobType, setJobType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date_desc");

  useEffect(() => {
    fetchJobs();
  }, [searchTerm, specialization, jobType, sortBy]);

  const fetchJobs = async () => {
      setLoading(true);
        try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (specialization !== "all") params.append("specialization", specialization);
      if (jobType !== "all") params.append("type", jobType);
      if (sortBy) params.append("sortBy", sortBy);

      const response = await axiosInstance.get(`/api/doctor/get-requirements-by-location?${params.toString()}`);
      setJobs(response.data.requirements);
        } catch (error) {
      console.error("Error fetching jobs:", error);
        } finally {
          setLoading(false);
        }
  };

  const handleApply = async () => {
    if (!applyingTo || !applicationMessage.trim()) return;
    
    setSubmittingApplication(true);
    try {
      await axiosInstance.post(`/api/doctor/pitch-requirement/${applyingTo}`, {
        message: applicationMessage,
        doctorId: userId
      });
      
      setApplyingTo(null);
      setApplicationMessage("");
      
      // Show success message and refresh jobs
      alert("Application submitted successfully!");
      fetchJobs();
    } catch (error: any) {
      console.error("Error submitting application:", error);
      alert(error.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmittingApplication(false);
    }
  };

  const formatSpecialization = (spec: string) => {
    return spec.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatJobType = (type: string) => {
    switch (type) {
      case 'FULLTIME': return 'Full-time';
      case 'PARTTIME': return 'Part-time';
      case 'ONETIME': return 'One-time';
      default: return type;
    }
  };

  const getJobTypeColor = (type: RequirementType) => {
    switch (type) {
      case RequirementType.FULLTIME: return 'bg-green-100 text-green-800';
      case RequirementType.PARTTIME: return 'bg-blue-100 text-blue-800';
      case RequirementType.ONETIME: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
  }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-white mb-4">
                Find Your Next Opportunity
            </h1>
              <p className="text-blue-100 text-lg mb-6">
                Discover amazing healthcare positions that match your skills and schedule
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{jobs.length}</div>
                <div className="text-blue-100 text-sm">Available Positions</div>
              </div>
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-300/20 rounded-full blur-xl"></div>
          </div>
          </div>

        {/* Filters */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">Search & Filter</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Jobs
                </Label>
              <Input
                  id="search"
                  placeholder="Search by title, clinic, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12"
              />
            </div>

              <div className="space-y-2">
                <Label>Specialization</Label>
                <Select value={specialization} onValueChange={setSpecialization}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="All specializations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {Object.values(DoctorSpecialization).map((spec) => (
                  <SelectItem key={spec} value={spec}>
                        {formatSpecialization(spec)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
              </div>

              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="FULLTIME">Full-time</SelectItem>
                    <SelectItem value="PARTTIME">Part-time</SelectItem>
                    <SelectItem value="ONETIME">One-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Newest First</SelectItem>
                    <SelectItem value="date_asc">Oldest First</SelectItem>
                    <SelectItem value="applications_desc">Most Applications</SelectItem>
                    <SelectItem value="applications_asc">Least Applications</SelectItem>
              </SelectContent>
            </Select>
      </div>
            </div>
                </CardContent>
              </Card>

        {/* Job Listings */}
        {loading ? (
          <Loading variant="page" icon="briefcase" text="Finding great opportunities for you..." />
            ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {jobs.length === 0 ? (
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Briefcase className="h-12 w-12 text-blue-600" />
                  </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No Jobs Found</h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your search criteria or check back later for new opportunities.
                    </p>
                    <Button 
                      onClick={() => {
                        setSearchTerm("");
                        setSpecialization("all");
                        setJobType("all");
                        setSortBy("date_desc");
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              jobs.map((job) => (
                <Card key={job.id} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-gray-200">
                          <AvatarImage src={job.clinic.profileImage || ""} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                            {job.clinic.clinicName[0]}
                              </AvatarFallback>
                            </Avatar>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building className="h-4 w-4" />
                            <span>{job.clinic.clinicName}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getJobTypeColor(job.type)}>
                        {formatJobType(job.type)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      {job.date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(job.date).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{job.applicationsCount} applications</span>
                      </div>
                    </div>

                    {job.specialization && (
                      <Badge variant="outline" className="text-xs">
                        {formatSpecialization(job.specialization)}
                      </Badge>
                    )}

                    <p className="text-gray-700 line-clamp-3">
                      {job.description}
                    </p>

                    {job.additionalInformation && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Additional Info:</strong> {job.additionalInformation}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/clinics/${job.clinic.id}`)}
                        >
                          View Clinic
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setApplyingTo(job.id)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Apply Now
                        </Button>
                          </div>
                </div>
              </CardContent>
            </Card>
              ))
            )}
          </div>
        )}

        {/* Application Dialog */}
        <Dialog open={!!applyingTo} onOpenChange={() => setApplyingTo(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-gray-900">
                Apply for Position
              </DialogTitle>
            </DialogHeader>
            
            {applyingTo && (
              <div className="space-y-6">
                {(() => {
                  const job = jobs.find(j => j.id === applyingTo);
                  if (!job) return null;
                  
                  return (
                    <>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900">{job.title}</h4>
                        <p className="text-blue-700">{job.clinic.clinicName}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-600">{job.location}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="message" className="text-lg font-medium">
                          Cover Message
                        </Label>
                        <Textarea
                          id="message"
                          placeholder="Tell the clinic why you're interested in this position and what makes you a great fit..."
                          value={applicationMessage}
                          onChange={(e) => setApplicationMessage(e.target.value)}
                          rows={6}
                          className="border-2 focus:border-blue-500"
                        />
                        <p className="text-sm text-gray-500">
                          Tip: Mention your relevant experience and why you're excited about this opportunity.
                        </p>
                      </div>
                    </>
                  );
                })()}
        </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setApplyingTo(null)}
                disabled={submittingApplication}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={!applicationMessage.trim() || submittingApplication}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {submittingApplication ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}