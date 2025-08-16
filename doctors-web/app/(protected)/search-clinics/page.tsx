"use client";

import { useEffect, useState, useCallback } from "react";
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
  Briefcase,
  SlidersHorizontal,
  Eye,
  MessageSquare
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LocationSearch from "@/components/ui/location-search";
import { APIProvider } from "@vis.gl/react-google-maps";
import ReusableMap from "@/components/ui/reusable-map";

interface Clinic {
  id: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhoneNumber: string;
  clinicAdditionalDetails: string | null;
  profileImage: string | null;
  totalActiveJobs: number;
  distance?: number;
  latitude?: number;
  longitude?: number;
  owner: {
    email: string;
    ownerName: string;
    ownerPhoneNumber: string;
  };
  jobRequirements: JobRequirement[];
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

interface ClinicWithDistance {
  id: string;
  clinicName: string;
  clinicAddress: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  totalActiveJobs: number;
  activeJobs?: number;
}

export default function SearchClinics() {
  const { userId } = useAuth();
  const router = useRouter();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [loading] = useState(true);
  const [clinicsLoading, setClinicsLoading] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>({ lat: 28.6139, lng: 77.2090 });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("nearest");
  const [activeJobsFilter, setActiveJobsFilter] = useState("all");
  const [locationRange, setLocationRange] = useState(50);
  const [customLocation, setCustomLocation] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [useCustomLocation, setUseCustomLocation] = useState(false);

  const fetchClinics = useCallback(async () => {
    if (!userId) return;
    
    setClinicsLoading(true);
    try {
      let searchLat: number, searchLng: number;
      
      if (useCustomLocation && selectedPlace?.geometry?.location) {
        searchLat = selectedPlace.geometry.location.lat();
        searchLng = selectedPlace.geometry.location.lng();
        setMapCenter({ lat: searchLat, lng: searchLng });
      } else {
        const userResponse = await axiosInstance.get(`/api/doctor/get-doctor/${userId}`);
        const userLocationData = userResponse.data.doctor;
        
        if (!userLocationData.latitude || !userLocationData.longitude) {
          console.log("User location not available");
          setClinics([]);
          return;
        }
        
        searchLat = userLocationData.latitude;
        searchLng = userLocationData.longitude;
        setMapCenter({ lat: searchLat, lng: searchLng });
      }
      
      const response = await axiosInstance.get(`/api/doctor/get-clinics-by-location`, {
        params: {
          lat: searchLat,
          lng: searchLng,
          radius: locationRange,
          sortBy: sortBy
        }
      });
      
      const clinicsWithDistance = response.data.clinics.map((clinic: ClinicWithDistance) => {
        if (clinic.latitude && clinic.longitude) {
          const distance = getDistance(searchLat, searchLng, clinic.latitude, clinic.longitude);
          return { ...clinic, distance, totalActiveJobs: clinic.activeJobs || 0 };
        }
        return { ...clinic, totalActiveJobs: clinic.activeJobs || 0 };
      });
      
      setClinics(clinicsWithDistance);
    } catch (error) {
      console.log("Error fetching clinics:", error);
    } finally {
      setClinicsLoading(false);
    }
  }, [userId, locationRange, sortBy, useCustomLocation, selectedPlace]);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filterAndSortClinics = useCallback(() => {
    const filtered = clinics.filter(clinic => {
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
  }, [clinics, searchTerm, activeJobsFilter, sortBy]);

  useEffect(() => {
    if (userId) {
      fetchClinics();
    }
  }, [userId, fetchClinics]);

  useEffect(() => {
    filterAndSortClinics();
  }, [filterAndSortClinics]);

  const handleViewJobs = (clinicId: string) => {
    router.push(`/requirements?clinic=${clinicId}`);
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult | null) => {
    setSelectedPlace(place);
    if (place) {
      setCustomLocation(place.formatted_address || "");
      setUseCustomLocation(true);
    }
  };

  const handleLocationInputChange = (value: string) => {
    setCustomLocation(value);
    if (value === "") {
      setUseCustomLocation(false);
      setSelectedPlace(null);
    }
  };

  if (loading) {
    return <Loading variant="page" text="Finding great clinics near you..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 shadow-2xl">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-white mb-2">
                Explore Healthcare Partners
              </h1>
              <p className="text-blue-100 text-lg">
                Discover top clinics in your area and explore partnership opportunities
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-blue-600" />
              Search & Filter Clinics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search clinics, names, owners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Location Filter */}
              <div className="relative">
                <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
                  <LocationSearch
                    onPlaceSelect={handlePlaceSelect}
                    value={customLocation}
                    onChange={handleLocationInputChange}
                  />
                </APIProvider>
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
              <span>
                Showing {filteredClinics.length} of {clinics.length} clinics within {locationRange}km
                {useCustomLocation && customLocation ? ` from ${customLocation}` : ' from your location'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setActiveJobsFilter("all");
                  setSortBy("nearest");
                  setUseCustomLocation(false);
                  setCustomLocation("");
                  setSelectedPlace(null);
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Google-like Layout */}
        <div className="flex gap-6 h-[calc(100vh-320px)]">
          {/* Left Side - Clinics List */}
          <div className="w-1/2 flex flex-col">
            {/* List Header */}
            <div className="mb-4 p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-xl border-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Clinic Results ({filteredClinics.length})
                </h2>
                <div className="text-sm text-gray-500">
                  {useCustomLocation && customLocation ? `Near ${customLocation}` : 'Near your location'}
                </div>
              </div>
            </div>

            {/* Scrollable Clinics List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {clinicsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Searching clinics...</p>
                  </div>
                </div>
              ) : filteredClinics.length === 0 ? (
                <div className="text-center py-16">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Clinics Found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search radius</p>
                </div>
              ) : (
                filteredClinics.map((clinic) => (
                  <Card key={clinic.id} className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-200 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <ProfileAvatar
                            src={clinic.profileImage}
                            fallback={clinic.clinicName[0]}
                            size="md"
                            profileId={clinic.id}
                            profileType="clinic"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{clinic.clinicName}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <MapPin className="h-3 w-3" />
                              <span>{clinic.clinicAddress}</span>
                            </div>
                            {clinic.distance && (
                              <div className="text-xs text-gray-500 mt-1">
                                {clinic.distance.toFixed(1)} km away
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {clinic.totalActiveJobs > 0 ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                  <Briefcase className="h-3 w-3 mr-1" />
                                  {clinic.totalActiveJobs} Jobs
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  No openings
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedClinic(clinic)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {clinic.totalActiveJobs > 0 && (
                            <Button
                              size="sm"
                              onClick={() => router.push(`/requirements?clinic=${clinic.id}`)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Apply
                            </Button>
                          )}
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
                    Map View
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Your Location</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Hiring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span>Other</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Content */}
              <div className="flex-1">
                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                  <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                    <ReusableMap 
                      places={filteredClinics.map(clinic => ({
                        lat: clinic.latitude || 0,
                        lng: clinic.longitude || 0,
                        clinicName: clinic.clinicName || null,
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