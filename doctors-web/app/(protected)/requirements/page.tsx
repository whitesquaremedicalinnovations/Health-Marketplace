"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useRouter } from "next/navigation";
import {
  Search, 
  MapPin,
  Send,
  Clock,
  Users,
  Briefcase,
  Heart,
  ArrowUpDown,
  SlidersHorizontal,
  FilterX,
  TrendingUp,
  Target,
  Zap
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import  LocationSearch  from "@/components/ui/location-search";
import ReusableMap from "@/components/ui/reusable-map";
import { APIProvider } from "@vis.gl/react-google-maps";
import { toast } from "sonner";

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
    isVerified?: boolean;
    latitude?: number;
    longitude?: number;
  };
  hasApplied?: boolean;
  distance?: number;
}

export default function JobRequirements() {
  const { userId } = useAuth();
  const router = useRouter();
  const [requirements, setRequirements] = useState<JobRequirement[]>([]);
  const [filteredRequirements, setFilteredRequirements] = useState<JobRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<JobRequirement | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  
  // Enhanced filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [locationRange, setLocationRange] = useState([50]);
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [datePostedFilter, setDatePostedFilter] = useState("all");
  const [applicationCountRange, setApplicationCountRange] = useState([0, 100]);
  const [customLocation, setCustomLocation] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [mapCenter] = useState({ lat: 40.7128, lng: -74.0060 });

  // Available specializations (should match backend enum)
  const specializations = [
    "GENERAL_PRACTITIONER", "CARDIOLOGIST", "DERMATOLOGIST", "NEUROLOGIST",
    "PEDIATRICIAN", "PSYCHIATRIST", "ORTHOPEDIC", "GYNECOLOGIST",
    "OPHTHALMOLOGIST", "RADIOLOGIST", "ANESTHESIOLOGIST", "PATHOLOGIST",
    "EMERGENCY_MEDICINE", "FAMILY_MEDICINE", "INTERNAL_MEDICINE", "SURGEON"
  ];

  const fetchRequirements = useCallback(async (isInitialLoad = false) => {
    if (!userId) return;
    
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setResultsLoading(true);
    }
    
    try {
      const params: Record<string, string | number> = {
        doctorId: userId,
        radius: locationRange[0]
      };

      // Add custom location if specified
      if (useCustomLocation && selectedPlace?.geometry?.location) {
        params.lat = selectedPlace.geometry.location.lat();
        params.lng = selectedPlace.geometry.location.lng();
      }

      const response = await axiosInstance.get(`/api/doctor/get-requirements-by-location`, {
        params
      });
      setRequirements(response.data.requirements || []);
    } catch (error: unknown) {
      console.log("Error fetching requirements:", error);
      setRequirements([]);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setResultsLoading(false);
      }
    }
  }, [userId, locationRange, useCustomLocation, selectedPlace]);

  const filterAndSortRequirements = useCallback(() => {
    const filtered = requirements.filter(req => {
      // Text search
      const matchesSearch = searchTerm === "" || 
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.clinic.clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.location.toLowerCase().includes(searchTerm.toLowerCase());

      // Specialization filter
      const matchesSpecialization = specializationFilter === "all" || req.specialization === specializationFilter;
      
      // Job type filter
      const matchesType = typeFilter === "all" || req.type === typeFilter;
      
      // Verified clinics only
      const matchesVerification = !verifiedOnly || req.clinic.isVerified;
      
      // Date posted filter
      const matchesDatePosted = (() => {
        if (datePostedFilter === "all") return true;
        const jobDate = new Date(req.createdAt);
        const now = new Date();
        const daysDiff = (now.getTime() - jobDate.getTime()) / (1000 * 3600 * 24);
        
        switch (datePostedFilter) {
          case "today": return daysDiff <= 1;
          case "week": return daysDiff <= 7;
          case "month": return daysDiff <= 30;
          default: return true;
        }
      })();
      
      // Application count range
      const matchesApplicationCount = req.applicationsCount >= applicationCountRange[0] && 
                                     req.applicationsCount <= applicationCountRange[1];
      
      return matchesSearch && matchesSpecialization && matchesType && 
             matchesVerification && matchesDatePosted && matchesApplicationCount;
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
        case "distance":
          return (a.distance || 999999) - (b.distance || 999999);
        case "relevant":
          // Sort by a combination of factors: recency, low applications, verified clinics
          const aScore = (a.clinic.isVerified ? 100 : 0) + 
                        (50 - Math.min(a.applicationsCount, 50)) + 
                        Math.max(0, 30 - Math.floor((new Date().getTime() - new Date(a.createdAt).getTime()) / (1000 * 3600 * 24)));
          const bScore = (b.clinic.isVerified ? 100 : 0) + 
                        (50 - Math.min(b.applicationsCount, 50)) + 
                        Math.max(0, 30 - Math.floor((new Date().getTime() - new Date(b.createdAt).getTime()) / (1000 * 3600 * 24)));
          return bScore - aScore;
        default:
          return 0;
      }
    });
    setFilteredRequirements(filtered);
  }, [requirements, searchTerm, specializationFilter, typeFilter, sortBy, verifiedOnly, datePostedFilter, applicationCountRange]);

  useEffect(() => {
    if (userId) {
      fetchRequirements(true);
    }
  }, [userId, locationRange, useCustomLocation, selectedPlace, fetchRequirements]);

  useEffect(() => {
    filterAndSortRequirements();
  }, [filterAndSortRequirements]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSpecializationFilter("all");
    setTypeFilter("all");
    setVerifiedOnly(false);
    setDatePostedFilter("all");
    setApplicationCountRange([0, 100]);
    setLocationRange([50]);
    setUseCustomLocation(false);
    setSelectedPlace(null);
    setSortBy("newest");
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (specializationFilter !== "all") count++;
    if (typeFilter !== "all") count++;
    if (verifiedOnly) count++;
    if (datePostedFilter !== "all") count++;
    if (applicationCountRange[0] > 0 || applicationCountRange[1] < 100) count++;
    if (locationRange[0] !== 50) count++;
    if (useCustomLocation) count++;
    return count;
  };

  const handleApply = async () => {
    if (!selectedRequirement || !applicationMessage.trim()) return;
    
    setApplyingId(selectedRequirement.id);
    try {
      await axiosInstance.post(`/api/doctor/pitch-requirement/${selectedRequirement.id}`, {
        doctorId: userId,
        message: applicationMessage.trim()
      });
      
      toast("Application submitted successfully!");
      setShowApplyDialog(false);
      setApplicationMessage("");
      setSelectedRequirement(null);
      
      // Refresh requirements to update application count
      fetchRequirements(false);
    } catch (error: unknown) {
      console.log("Error submitting application:", error);
      const errorMsg = error instanceof Error && 'response' in error ? 
        (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to submit application" :
        "Failed to submit application";
      toast(errorMsg);
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
    return spec?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || '';
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

  if (loading) {
    return <Loading variant="page" text="Loading job opportunities..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Job Opportunities
                </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and apply for medical positions at top clinics
          </p>
        </div>

        {/* Search and Filters Bar */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs, clinics, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevant">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        Most Relevant
                      </div>
                    </SelectItem>
                    <SelectItem value="newest">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Newest First
                      </div>
                    </SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="applications_low">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Fewer Applications
                      </div>
                    </SelectItem>
                    <SelectItem value="applications_high">More Applications</SelectItem>
                    <SelectItem value="distance">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        By Distance
                      </div>
                    </SelectItem>
                    <SelectItem value="clinic_name">Clinic Name A-Z</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </Button>

                {getActiveFilterCount() > 0 && (
                  <Button variant="ghost" onClick={clearAllFilters}>
                    <FilterX className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Specialization Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization
                    </label>
              <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any specialization" />
                </SelectTrigger>
                <SelectContent>
                        <SelectItem value="all">Any Specialization</SelectItem>
                        {specializations.map(spec => (
                    <SelectItem key={spec} value={spec}>
                      {formatSpecialization(spec)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                  </div>

              {/* Job Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Type
                    </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                        <SelectItem value="all">Any Type</SelectItem>
                  <SelectItem value="FULLTIME">Full-time</SelectItem>
                  <SelectItem value="PARTTIME">Part-time</SelectItem>
                  <SelectItem value="ONETIME">One-time</SelectItem>
                </SelectContent>
              </Select>
                  </div>

                  {/* Date Posted Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Posted
                    </label>
                    <Select value={datePostedFilter} onValueChange={setDatePostedFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                        <SelectItem value="all">Any Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
                  </div>

                  {/* Verified Clinics Only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clinic Status
                    </label>
                <Button
                      variant={verifiedOnly ? "default" : "outline"}
                      onClick={() => setVerifiedOnly(!verifiedOnly)}
                      className="w-full justify-start"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Verified Only
                </Button>
              </div>

                  {/* Location Range */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Radius: {locationRange[0]} km
                    </label>
                    <Slider
                      value={locationRange}
                      onValueChange={setLocationRange}
                      max={200}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Application Count Range */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Applications: {applicationCountRange[0]} - {applicationCountRange[1]}
                    </label>
                    <Slider
                      value={applicationCountRange}
                      onValueChange={setApplicationCountRange}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                    />
            </div>

                  {/* Custom Location */}
                  <div className="md:col-span-4">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="customLocation"
                        checked={useCustomLocation}
                        onChange={(e) => setUseCustomLocation(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="customLocation" className="text-sm font-medium text-gray-700">
                        Search from custom location
                      </label>
                    </div>
                    {useCustomLocation && (
                      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>  
                      <LocationSearch
                        onPlaceSelect={(place: google.maps.places.PlaceResult | null) => {
                          setSelectedPlace(place);
                          setCustomLocation(place?.formatted_address || '');
                        }}
                        value={customLocation}
                        onChange={setCustomLocation}  
                      />
                      </APIProvider>
                    )}
                  </div>
                </div>
            </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">
              Found {filteredRequirements.length} job{filteredRequirements.length !== 1 ? 's' : ''}
              {getActiveFilterCount() > 0 && ` (${getActiveFilterCount()} filter${getActiveFilterCount() !== 1 ? 's' : ''} applied)`}
            </p>
            <div className="flex items-center gap-2">
              {filteredRequirements.length > 0 && (
                <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {filteredRequirements.filter(req => !req.hasApplied).length} Available
                </Badge>
              )}
                        </div>
                      </div>
                    </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex gap-6 h-[calc(100vh-320px)]">
          {/* Left Side - Job Requirements List */}
          <div className="w-1/2 flex flex-col">
            {/* List Header */}
            <div className="mb-4 p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-xl border-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Job Opportunities ({filteredRequirements.length})
                </h2>
                <div className="text-sm text-gray-500">
                  {useCustomLocation && customLocation ? `Near ${customLocation}` : 'Near your location'}
                      </div>
                    </div>
                  </div>

            {/* Scrollable Requirements List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {resultsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Updating results...</p>
                  </div>
                </div>
              ) : filteredRequirements.length === 0 ? (
                <div className="text-center py-16">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Jobs Found</h3>
                  <p className="text-gray-500 mb-4">
                    {getActiveFilterCount() > 0 
                      ? "Try adjusting your filters to see more opportunities"
                      : "There are no job opportunities available at the moment"
                    }
                  </p>
                  {getActiveFilterCount() > 0 && (
                    <Button onClick={clearAllFilters} variant="outline">
                      <FilterX className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  )}
                </div>
              ) : (
                filteredRequirements.map((requirement) => (
                  <Card key={requirement.id} className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <ProfileAvatar 
                          src={requirement.clinic.profileImage}
                          alt={requirement.clinic.clinicName}
                          fallback={requirement.clinic.clinicName[0]}
                          className="h-12 w-12 border-2 border-gray-200 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">
                                {requirement.title}
                              </h3>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-gray-700 text-sm">
                                  {requirement.clinic.clinicName}
                                </span>
                                {requirement.clinic.isVerified && (
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                    <Zap className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{requirement.location}</span>
                                {requirement.distance && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <span>{requirement.distance.toFixed(1)} km away</span>
                                  </>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                  {formatJobType(requirement.type)}
                                </Badge>
                    {requirement.specialization && (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                        {formatSpecialization(requirement.specialization)}
                      </Badge>
                    )}
                  </div>
                              <p className="text-gray-600 text-xs leading-relaxed mb-2 line-clamp-2">
                    {requirement.description}
                  </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>{requirement.applicationsCount} applied</span>
                                </div>
                                <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                                  <span>{timeAgo(requirement.createdAt)}</span>
                                </div>
                              </div>
                    </div>
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              {requirement.hasApplied ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                  <Heart className="h-3 w-3 mr-1" />
                                  Applied
                                </Badge>
                              ) : (
                                <Button
                                  onClick={() => {
                                    setSelectedRequirement(requirement);
                                    setShowApplyDialog(true);
                                  }}
                                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                  size="sm"
                                >
                                  Apply
                                </Button>
                              )}
                      <Button
                        variant="outline"
                        size="sm"
                                onClick={() => router.push(`/requirements/view/${requirement.id}`)}
                              >
                                Details
                      </Button>
                    </div>
                  </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Right Side - Map */}
          <div className="w-1/2 flex flex-col">
            <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-lg shadow-xl border-0 overflow-hidden">
              {/* Map Header */}
              <div className="p-4 border-b bg-white/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Job Locations
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Your Location</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Available Jobs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>Applied</span>
                    </div>
                  </div>
                </div>
                </div>

              {/* Map Content */}
              <div className="flex-1">
                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                  <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                    <ReusableMap 
                      places={filteredRequirements.map(req => ({
                        lat: req.clinic.latitude || 0,
                        lng: req.clinic.longitude || 0,
                        clinicName: req.clinic.clinicName || null,
                      }))}
                      center={mapCenter}
                      updateLocation={() => {}}
                      zoom={12}
                    />
                  </APIProvider>
                ) : (
                  <div className="h-full bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">Map Unavailable</h3>
                      <p className="text-gray-500">Google Maps API key not configured</p>
                    </div>
                    </div>
                  )}
                </div>
              </div>
          </div>
        </div>

        {/* Apply Dialog */}
        <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Apply for Position</DialogTitle>
            </DialogHeader>
            {selectedRequirement && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {selectedRequirement.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    at {selectedRequirement.clinic.clinicName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Message *
                  </label>
                  <Textarea
                    placeholder="Write a brief message explaining why you're interested in this position..."
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                    rows={4}
                    className="w-full"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowApplyDialog(false)}
                disabled={applyingId === selectedRequirement?.id}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={!applicationMessage.trim() || applyingId === selectedRequirement?.id}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {applyingId === selectedRequirement?.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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