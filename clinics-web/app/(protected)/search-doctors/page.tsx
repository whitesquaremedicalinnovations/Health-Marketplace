"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/axios";
import DoctorCard from "@/components/doctor-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Filter, Users, Stethoscope } from "lucide-react";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { DoctorSpecialization } from "@/lib/types";

interface Doctor {
  id: string;
  fullName: string;
  specialization: DoctorSpecialization;
  experience: number;
  latitude: number;
  longitude: number;
  profileImage: string | null;
}

interface Location {
  lat: number;
  lng: number;
}

export default function SearchDoctors() {
  const { userId } = useAuth();
  const [doctorsNearby, setDoctorsNearby] = useState<Doctor[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialization, setSpecialization] = useState("all");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [radius, setRadius] = useState(10); // Default radius in km

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      if (userId && userLocation) {
        try {
          const [nearbyRes, allRes] = await Promise.all([
            axiosInstance.get(`/api/clinic/get-doctors-by-location?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${radius}`),
            axiosInstance.get(`/api/doctor/get-all-doctors?sortBy=${sortBy}&location=${location}`),
          ]);
          setDoctorsNearby(nearbyRes.data.doctors);
          setAllDoctors(allRes.data.doctors);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDoctors();
  }, [userId, sortBy, location, userLocation, radius]);

  const filteredDoctors = doctorsNearby
    .filter((doctor) =>
      doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (doctor) =>
        specialization === "all" || doctor.specialization === specialization
    );

  if (loading) {
    return <Loading variant="page" icon="users" text="Finding healthcare professionals near you..." />;
  }

  if (!userLocation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex justify-center items-center">
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm max-w-md">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Location Required</h3>
            <p className="text-gray-600">Please enable location services to find healthcare professionals near you.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Enhanced Header with Filters */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-lg">
        <div className="container mx-auto p-6">
          {/* Title Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Find Healthcare Professionals
            </h1>
            <p className="text-gray-600 mt-1">Discover qualified doctors in your area</p>
          </div>

          {/* Enhanced Filter Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by doctor name..."
                className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Location"
                className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <Select onValueChange={setSpecialization} defaultValue="all">
              <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="Specialization" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {Object.values(DoctorSpecialization).map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec.replace(/_/g, ' ').toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setSortBy} defaultValue="date_desc">
              <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Newest First</SelectItem>
                <SelectItem value="acceptances_desc">Most Acceptances</SelectItem>
                <SelectItem value="experience_asc">Experience (Low to High)</SelectItem>
                <SelectItem value="experience_desc">Experience (High to Low)</SelectItem>
                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Input
                type="number"
                placeholder="Radius (km)"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value) || 10)}
                className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                min="1"
                max="100"
              />
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{filteredDoctors.length} doctors nearby</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{allDoctors.length} total doctors</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Doctors List */}
          <div className="xl:col-span-1 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Nearby Doctors
              </h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {filteredDoctors.length} found
              </Badge>
            </div>

            {filteredDoctors.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No doctors found</h3>
                  <p className="text-gray-600 text-sm">Try adjusting your search criteria or increasing the radius.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto pr-2">
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="transform transition-all duration-200 hover:scale-[1.02]"
                  >
                    <DoctorCard doctor={doctor} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Map */}
          <div className="xl:col-span-2">
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden h-[calc(100vh-200px)]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Healthcare Professionals Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <div className="h-full rounded-b-lg overflow-hidden">
                  <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                    <Map
                      defaultCenter={userLocation}
                      defaultZoom={12}
                      mapId="f03222b54d63b2e7"
                      className="w-full h-full"
                    >
                      {allDoctors.map((doctor) => (
                        <AdvancedMarker
                          key={doctor.id}
                          position={{ lat: doctor.latitude, lng: doctor.longitude }}
                          onClick={() => setSelectedDoctor(doctor)}
                        >
                          <div className="relative">
                            <ProfileAvatar
                              src={doctor.profileImage}
                              alt={doctor.fullName}
                              fallback={doctor.fullName[0]}
                              size="lg"
                              profileId={doctor.id}
                              profileType="doctor"
                              className="border-3 border-white shadow-lg ring-2 ring-blue-500/30"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                        </AdvancedMarker>
                      ))}
                      {userLocation && (
                        <AdvancedMarker position={userLocation} title={"Your Location"}>
                          <Pin
                            background={"#3b82f6"}
                            borderColor={"#1e40af"}
                            glyphColor={"#eff6ff"}
                            scale={1.2}
                          />
                        </AdvancedMarker>
                      )}
                      {selectedDoctor && (
                        <InfoWindow
                          position={{
                            lat: selectedDoctor.latitude,
                            lng: selectedDoctor.longitude,
                          }}
                          onCloseClick={() => setSelectedDoctor(null)}
                        >
                          <div className="p-2">
                            <DoctorCard doctor={selectedDoctor} />
                          </div>
                        </InfoWindow>
                      )}
                    </Map>
                  </APIProvider>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}