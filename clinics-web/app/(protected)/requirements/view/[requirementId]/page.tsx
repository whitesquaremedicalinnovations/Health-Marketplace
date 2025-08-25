"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Briefcase, ArrowLeft, Eye, Users, Clock } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";

interface Requirement {
  id: string;
  title: string;
  description: string;
  type: string;
  specialization: string;
  date: string;
  time: string;
  additionalInformation: string;
  requirementStatus: string;
  location: string;
}

export default function ViewRequirement() {
  const router = useRouter();
  const { requirementId } = useParams();
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequirement = async () => {
      const response = await axiosInstance.get(`/api/clinic/get-requirement/${requirementId}`)
      if(response.status === 200){
        setRequirement(response.data.requirement)
      }else{
        toast("Failed to fetch requirement")
      }
      setLoading(false);
    };
    if (requirementId) {
      fetchRequirement();
    }
  }, [requirementId]);

  if (loading) {
    return <Loading variant="page" icon="briefcase" text="Loading requirement details..." />;
  }

  if (!requirement) {
    return <div>Requirement not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/requirements")}
                    className="text-white hover:bg-white/20"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Requirements
                  </Button>
                </div>
                <Button 
                  onClick={() => router.push(`/requirements/view/${requirementId}/applications`)}
                  className="bg-white text-indigo-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                >
                  <Users className="mr-2 h-4 w-4" />
                  View Applications
                </Button>
              </div>
              <div className="mt-6">
                <h1 className="text-4xl font-bold text-white mb-2">
                  {requirement.title}
                </h1>
                <div className="flex items-center gap-4 mt-4">
                  <Badge className="bg-white/20 text-white border-white/30">
                    {requirement.type.charAt(0) + requirement.type.slice(1).toLowerCase()}
                  </Badge>
                  <Badge className={`${requirement.requirementStatus === 'POSTED' ? 'bg-emerald-400/20 text-emerald-100 border-emerald-300/30' : 'bg-blue-400/20 text-blue-100 border-blue-300/30'}`}>
                    {requirement.requirementStatus}
                  </Badge>
                  <div className="flex items-center gap-1 text-white/90">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Posted {new Date(requirement.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-300/20 rounded-full blur-xl"></div>
          </div>
        </div>
              {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Job Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{requirement.description}</p>
              </CardContent>
            </Card>

            {/* Specialization */}
            {requirement.specialization && (
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Briefcase className="h-5 w-5 text-emerald-600" />
                    Required Specialization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-3 py-1 text-sm">
                      {requirement.specialization}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            {requirement.additionalInformation && (
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Additional Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{requirement.additionalInformation}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Quick Info */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Job Type</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      {requirement.type.charAt(0) + requirement.type.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <Badge className={requirement.requirementStatus === 'POSTED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-blue-100 text-blue-800 border-blue-200'}>
                      {requirement.requirementStatus}
                    </Badge>
                  </div>
                  {requirement.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <span className="text-gray-700 text-sm">{requirement.location}</span>
                    </div>
                  )}
                  {requirement.date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700 text-sm">{new Date(requirement.date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {requirement.time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700 text-sm">{requirement.time}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Manage Requirement</h3>
                  <div className="space-y-3">
                    <Button 
                      variant="secondary" 
                      className="w-full bg-white text-gray-900 hover:bg-gray-100"
                      onClick={() => router.push(`/requirements/edit/${requirement.id}`)}
                    >
                      Edit Requirement
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-white text-white hover:bg-white/20"
                      onClick={() => router.push(`/requirements/view/${requirementId}/applications`)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      View Applications
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}