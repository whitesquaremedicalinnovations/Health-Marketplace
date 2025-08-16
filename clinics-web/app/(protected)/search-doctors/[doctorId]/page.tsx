"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Heart,
    Mail,
    MapPin,
    Phone,
    Share2,
    FileText,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { APIProvider } from "@vis.gl/react-google-maps";
import ReusableMap from "@/components/ui/reusable-map";

interface Document {
    id: string;
    name: string;
    docUrl: string;
    type: string;
}

interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
  experience: number;
  profileImage: string | null;
  about: string;
  address: string;
  certifications: string[];
  phoneNumber: string;
  email: string;
  latitude: number;
  longitude: number;
  documents: Document[];
}

export default function DoctorProfile() {
  const { doctorId } = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await axiosInstance.get(`/api/doctor/get-doctor/${doctorId}`);
        setDoctor(response.data.doctor);
      } catch (error) {
        console.log("Error fetching doctor:", error);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);

  if (loading) {
    return <Loading variant="page" text="Loading doctor's profile..." />;
  }

  if (!doctor) {
    return <div className="text-center py-10">Doctor not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto p-4 md:p-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header Card */}
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                          <ProfileAvatar
                            src={doctor.profileImage}
                            fallback={doctor.fullName[0]}
                            size="xl"
                            profileId={doctor.id}
                            profileType="doctor"
                            className="h-32 w-32 md:h-40 md:w-40 border-4 border-white shadow-lg"
                          />
                          <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{doctor.fullName}</h1>
                            <p className="text-lg md:text-xl text-blue-600 font-semibold mt-2">
                              {doctor.specialization.replace(/_/g, " ")}
                            </p>
                            <p className="text-md text-muted-foreground mt-1">
                              {doctor.experience} years of experience
                            </p>
                            <div className="flex justify-center md:justify-start gap-2 mt-4">
                                <Button variant="outline">
                                    <Heart className="h-4 w-4 mr-2"/>
                                    Save Doctor
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Share2 className="h-4 w-4"/>
                                </Button>
                            </div>
                          </div>
                        </CardContent>
                    </Card>

                    {/* About Card */}
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl text-gray-900">About Dr. {doctor.fullName.split(" ").pop()}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{doctor.about}</p>
                        </CardContent>
                    </Card>
                    
                    {/* Documents Section */}
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {doctor.documents.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {doctor.documents.map(doc => (
                                        <a href={doc.docUrl} key={doc.id} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                                            <FileText className="h-8 w-8 text-blue-600" />
                                            <div>
                                                <p className="font-semibold">{doc.name}</p>
                                                <p className="text-sm text-muted-foreground">{doc.type}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : <p className="text-muted-foreground">No documents available.</p>}
                        </CardContent>
                    </Card>
                </div>
                
                {/* Sidebar */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground"/><span>{doctor.email}</span></div>
                            <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground"/><span>{doctor.phoneNumber}</span></div>
                            <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground"/><span>{doctor.address}</span></div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardHeader><CardTitle>Certifications & Skills</CardTitle></CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {doctor.certifications.map(cert => (
                                <Badge key={cert} variant="secondary">{cert}</Badge>
                            ))}
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm h-64">
                        <CardHeader><CardTitle>Location</CardTitle></CardHeader>
                        <CardContent className="h-full p-0">
                            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && doctor.latitude && doctor.longitude ? (
                                <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                                    <ReusableMap
                                        places={[{
                                            lat: doctor.latitude,
                                            lng: doctor.longitude,
                                            name: doctor.fullName,
                                        }]}
                                        center={{ lat: doctor.latitude, lng: doctor.longitude }}
                                        updateLocation={() => {}}
                                        zoom={14}
                                    />
                                </APIProvider>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">Map data not available.</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </div>
  );
}