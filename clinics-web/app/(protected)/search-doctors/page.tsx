"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { 
  Search, 
  MapPin,
  Star,
  SlidersHorizontal,
  Briefcase,
  Eye,
  LocateFixed,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import LocationSearch from "@/components/ui/location-search";
import ReusableMap from "@/components/ui/reusable-map";
import { APIProvider } from "@vis.gl/react-google-maps";

interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
  experience: number;
  address: string;
  profileImage: string | null;
  distance?: number;
  latitude?: number;
  longitude?: number;
}

export default function SearchDoctors() {
  const { userId } = useAuth();
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>({ lat: 28.6139, lng: 77.2090 });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("nearest");
  const [experienceRange, setExperienceRange] = useState([0, 50]);
  const [locationRange, setLocationRange] = useState(50);
  const [customLocation, setCustomLocation] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [useCustomLocation, setUseCustomLocation] = useState(false);

  const fetchDoctors = useCallback(async () => {
    if (!userId) return;
    
    setDoctorsLoading(true);
    try {
      let searchLat: number, searchLng: number;
      
      if (useCustomLocation && selectedPlace?.geometry?.location) {
        searchLat = selectedPlace.geometry.location.lat();
        searchLng = selectedPlace.geometry.location.lng();
        setMapCenter({ lat: searchLat, lng: searchLng });
      } else {
        const userResponse = await axiosInstance.get(`/api/clinic/get-clinic/${userId}`);
        const userLocationData = userResponse.data?.success ? userResponse.data.data : userResponse.data.clinic;
        
        if (!userLocationData.latitude || !userLocationData.longitude) {
          console.log("User location not available");
          setDoctors([]);
          return;
        }
        
        searchLat = userLocationData.latitude;
        searchLng = userLocationData.longitude;
        setMapCenter({ lat: searchLat, lng: searchLng });
      }
      
      const response = await axiosInstance.get(`/api/clinic/get-doctors-by-location`, {
        params: {
          lat: searchLat,
          lng: searchLng,
          radius: locationRange,
          sortBy: sortBy,
          search: searchTerm,
          experience_min: experienceRange[0],
          experience_max: experienceRange[1],
        }
      });
      
      setDoctors(response.data.doctors);
    } catch (error) {
      console.log("Error fetching doctors:", error);
    } finally {
      setDoctorsLoading(false);
    }
  }, [userId, useCustomLocation, selectedPlace, locationRange, sortBy, searchTerm, experienceRange]);

  useEffect(() => {
    if (userId) {
      fetchDoctors();
    }
  }, [userId, fetchDoctors]);

  useEffect(() => {
    setFilteredDoctors(doctors);
  }, [doctors]);

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

  if (doctorsLoading) {
    return <Loading variant="page" text="Finding healthcare professionals..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 shadow-2xl">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-white mb-2">
                Find the Right Doctor
              </h1>
              <p className="text-blue-100 text-lg">
                Discover talented doctors to join your team
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-blue-600" />
              Search & Filter Doctors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, specialization, address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Location Filter */}
              <div className="relative flex items-center">
                <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
                  <LocationSearch
                    onPlaceSelect={handlePlaceSelect}
                    value={customLocation}
                    onChange={handleLocationInputChange}
                  />
                </APIProvider>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                        setUseCustomLocation(false);
                        setCustomLocation("");
                        setSelectedPlace(null);
                    }}
                    className="ml-2"
                >
                    <LocateFixed className="h-5 w-5" />
                </Button>

                {/* Sort By */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nearest">Nearest First</SelectItem>
                    <SelectItem value="experience_desc">Experience (High to Low)</SelectItem>
                    <SelectItem value="experience_asc">Experience (Low to High)</SelectItem>
                    <SelectItem value="name_asc">Name A-Z</SelectItem>
                    <SelectItem value="name_desc">Name Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                {/* Experience Slider */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience (Years): {experienceRange[0]} - {experienceRange[1]}
                    </label>
                    <Slider
                        min={0}
                        max={50}
                        step={1}
                        value={experienceRange}
                        onValueChange={(value) => setExperienceRange(value)}
                        className="w-full"
                    />
                </div>
                {/* Location Range Slider */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Radius (km): {locationRange}
                    </label>
                    <Slider
                        min={1}
                        max={100}
                        step={1}
                        value={[locationRange]}
                        onValueChange={(value) => setLocationRange(value[0])}
                        className="w-full"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
              <span>
                Showing {filteredDoctors.length} of {doctors.length} doctors within {locationRange}km
                {useCustomLocation && customLocation ? ` from ${customLocation}` : ' from your location'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSortBy("nearest");
                  setExperienceRange([0, 50]);
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

        {/* Main Content */}
        <div className="flex gap-6 h-[calc(100vh-320px)]">
            <div className="w-1/2 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {doctorsLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loading variant="page" text="Searching for doctors..." />
                        </div>
                    ) : filteredDoctors.length === 0 ? (
                        <div className="text-center py-16">
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Doctors Found</h3>
                            <p className="text-gray-500">Try adjusting your filters or search radius</p>
                        </div>
                    ) : (
                        filteredDoctors.map((doctor) => (
                            <Card key={doctor.id} className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-200 cursor-pointer">
                                <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                    <ProfileAvatar
                                        src={doctor.profileImage}
                                        fallback={doctor.fullName[0]}
                                        size="md"
                                        profileId={doctor.id}
                                        profileType="doctor"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{doctor.fullName}</h3>
                                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                            <Briefcase className="h-3 w-3" />
                                            <span>{doctor.specialization.replace(/_/g, ' ')}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                            <Star className="h-3 w-3" />
                                            <span>{doctor.experience} years of experience</span>
                                        </div>
                                        {doctor.distance && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {doctor.distance.toFixed(1)} km away
                                        </div>
                                        )}
                                    </div>
                                    </div>
                                    <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => router.push(`/search-doctors/${doctor.id}`)}
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                    </div>
                                </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
            <div className="w-1/2 flex flex-col">
                <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-lg shadow-xl border-0 overflow-hidden">
                    {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                            <ReusableMap
                                places={filteredDoctors.map(doc => ({
                                    lat: doc.latitude || 0,
                                    lng: doc.longitude || 0,
                                    clinicName: doc.fullName || null,
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
    </div>
  );
}