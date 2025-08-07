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
import { useRouter } from "next/navigation";
import { 
  Search, 
  Building,
  MapPin,
  Phone,
  Mail,
  Star,
  Users,
  Briefcase,
  Filter,
  SlidersHorizontal,
  ArrowRight,
  Eye,
  Heart,
  MessageSquare
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
}

export default function SearchClinics() {
  const { userId } = useAuth();
  const router = useRouter();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("nearest");
  const [activeJobsFilter, setActiveJobsFilter] = useState("all");
  const [locationRange, setLocationRange] = useState(50);

  useEffect(() => {
    fetchClinics();
  }, [userId, locationRange]);

  useEffect(() => {
    filterAndSortClinics();
  }, [clinics, searchTerm, sortBy, activeJobsFilter]);

  const fetchClinics = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/doctor/get-clinics-by-location`, {
        params: {
          doctorId: userId,
          radius: locationRange
        }
      });
      setClinics(response.data.clinics);
    } catch (error) {
      console.error("Error fetching clinics:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortClinics = () => {
    let filtered = clinics.filter(clinic => {
      const matchesSearch = searchTerm === "" || 
        clinic.clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.clinicAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.owner.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (clinic.clinicAdditionalDetails && clinic.clinicAdditionalDetails.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesActiveJobs = activeJobsFilter === "all" || 
        (activeJobsFilter === "hiring" && clinic.totalActiveJobs > 0) ||
        (activeJobsFilter === "none" && clinic.totalActiveJobs === 0);
      
      return matchesSearch && matchesActiveJobs;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "nearest":
          return (a.distance || 0) - (b.distance || 0);
        case "farthest":
          return (b.distance || 0) - (a.distance || 0);
        case "name":
          return a.clinicName.localeCompare(b.clinicName);
        case "jobs_high":
          return b.totalActiveJobs - a.totalActiveJobs;
        case "jobs_low":
          return a.totalActiveJobs - b.totalActiveJobs;
        default:
          return 0;
      }
    });

    setFilteredClinics(filtered);
  };

  const handleViewJobs = (clinicId: string) => {
    router.push(`/requirements?clinic=${clinicId}`);
  };

  if (loading) {
    return <Loading variant="page" text="Finding great clinics near you..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-white mb-4">
                Explore Healthcare Partners
              </h1>
              <p className="text-blue-100 text-lg mb-6">
                Discover top clinics in your area and explore partnership opportunities for your medical career
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{clinics.length}</div>
                  <div className="text-blue-100 text-sm">Nearby Clinics</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{filteredClinics.length}</div>
                  <div className="text-blue-100 text-sm">Matching Filters</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">
                    {clinics.filter(clinic => clinic.totalActiveJobs > 0).length}
                  </div>
                  <div className="text-blue-100 text-sm">Actively Hiring</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">
                    {clinics.reduce((sum, clinic) => sum + clinic.totalActiveJobs, 0)}
                  </div>
                  <div className="text-blue-100 text-sm">Total Open Positions</div>
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
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                  <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Search & Filter Clinics</CardTitle>
              </div>
              <Button
                onClick={() => router.push("/requirements")}
                variant="outline"
                className="border-2"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Browse All Jobs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search clinics, locations, owners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Active Jobs Filter */}
              <Select value={activeJobsFilter} onValueChange={setActiveJobsFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Filter by hiring status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clinics</SelectItem>
                  <SelectItem value="hiring">Currently Hiring</SelectItem>
                  <SelectItem value="none">Not Hiring</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nearest">Nearest First</SelectItem>
                  <SelectItem value="farthest">Farthest First</SelectItem>
                  <SelectItem value="name">Clinic Name A-Z</SelectItem>
                  <SelectItem value="jobs_high">Most Open Positions</SelectItem>
                  <SelectItem value="jobs_low">Fewest Open Positions</SelectItem>
                </SelectContent>
              </Select>

              {/* Location Range */}
              <Select value={locationRange.toString()} onValueChange={(value) => setLocationRange(Number(value))}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Search radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 km radius</SelectItem>
                  <SelectItem value="25">25 km radius</SelectItem>
                  <SelectItem value="50">50 km radius</SelectItem>
                  <SelectItem value="100">100 km radius</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Showing {filteredClinics.length} of {clinics.length} clinics within {locationRange}km</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setActiveJobsFilter("all");
                  setSortBy("nearest");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clinics List */}
        {filteredClinics.length === 0 ? (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Clinics Match Your Criteria
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or expanding your search radius to find more clinics.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setActiveJobsFilter("all");
                  setLocationRange(100);
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Expand Search
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredClinics.map((clinic) => (
              <Card key={clinic.id} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <ProfileAvatar
                        src={clinic.profileImage}
                        fallback={clinic.clinicName[0]}
                        size="lg"
                        profileId={clinic.id}
                        profileType="clinic"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{clinic.clinicName}</h3>
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <Building className="h-4 w-4" />
                          <span className="text-sm">Dr. {clinic.owner.ownerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{clinic.clinicAddress}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {clinic.totalActiveJobs > 0 ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {clinic.totalActiveJobs} Jobs
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          No openings
                        </Badge>
                      )}
                      {clinic.distance && (
                        <div className="text-xs text-gray-500">
                          {clinic.distance.toFixed(1)} km away
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{clinic.clinicPhoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{clinic.owner.email}</span>
                    </div>
                  </div>

                  {clinic.clinicAdditionalDetails && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {clinic.clinicAdditionalDetails}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="h-3 w-3" />
                        <span>Owner: {clinic.owner.ownerName}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedClinic(clinic)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {clinic.totalActiveJobs > 0 && (
                        <Button
                          size="sm"
                          onClick={() => handleViewJobs(clinic.id)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          View Jobs ({clinic.totalActiveJobs})
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Clinic Details Dialog */}
        <Dialog open={!!selectedClinic} onOpenChange={() => setSelectedClinic(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-gray-900">
                Clinic Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedClinic && (
              <div className="space-y-6">
                {/* Clinic Header */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-4">
                    <ProfileAvatar
                      src={selectedClinic.profileImage}
                      fallback={selectedClinic.clinicName[0]}
                      size="xl"
                      profileId={selectedClinic.id}
                      profileType="clinic"
                      className="h-20 w-20"
                    />
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-blue-900">{selectedClinic.clinicName}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-700">{selectedClinic.clinicAddress}</span>
                      </div>
                      {selectedClinic.distance && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-blue-600">{selectedClinic.distance.toFixed(1)} km from your location</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {selectedClinic.totalActiveJobs > 0 ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 mb-2">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {selectedClinic.totalActiveJobs} Open Positions
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mb-2">
                          No current openings
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">Owner Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-900">Name</h5>
                      <p className="text-gray-700">Dr. {selectedClinic.owner.ownerName}</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-900">Phone</h5>
                      <p className="text-gray-700">{selectedClinic.owner.ownerPhoneNumber}</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-900">Email</h5>
                      <p className="text-gray-700">{selectedClinic.owner.email}</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-900">Clinic Phone</h5>
                      <p className="text-gray-700">{selectedClinic.clinicPhoneNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Clinic Description */}
                {selectedClinic.clinicAdditionalDetails && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-900">About the Clinic</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedClinic.clinicAdditionalDetails}</p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{selectedClinic.totalActiveJobs}</div>
                    <div className="text-sm text-gray-600">Open Positions</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedClinic.distance ? `${selectedClinic.distance.toFixed(1)}km` : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Distance</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">★ 4.8</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedClinic(null)}
              >
                Close
              </Button>
              {selectedClinic?.totalActiveJobs && selectedClinic.totalActiveJobs > 0 && (
                <Button
                  onClick={() => {
                    handleViewJobs(selectedClinic.id);
                    setSelectedClinic(null);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  View {selectedClinic.totalActiveJobs} Open Position{selectedClinic.totalActiveJobs > 1 ? 's' : ''}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  // Handle contact clinic functionality
                  window.open(`mailto:${selectedClinic?.owner.email}?subject=Partnership Inquiry - ${selectedClinic?.clinicName}`, '_blank');
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Clinic
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 