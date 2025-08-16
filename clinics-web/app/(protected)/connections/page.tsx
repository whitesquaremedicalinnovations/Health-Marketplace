"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Calendar, 
  Star, 
  Briefcase, 
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Clock
} from "lucide-react";
import { Loading, SkeletonList } from "@/components/ui/loading";

interface Connection {
  doctor: {
    id: string;
    fullName: string;
    specialization: string;
    experience: number;
    profileImage: {
      docUrl: string;
    } | null;
  };
  acceptedPitches: {
    id: string;
    jobRequirement: {
      id: string;
      title: string;
      type: string;
      createdAt: string;
    };
    createdAt: string;
  }[];
  connectionCount: number;
  latestConnection: string;
}

export default function Connections() {
  const { userId } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchConnections = async () => {
      if (userId) {
        try {
          const response = await axiosInstance.get(`/api/clinic/get-connections/${userId}`);
          setConnections(response.data.connections);
        } catch (error) {
          console.log("Error fetching connections:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchConnections();
  }, [userId]);

  const handleViewProfile = (doctorId: string) => {
    router.push(`/search-doctors/${doctorId}?from=connections`);
  };

  const getConnectionDuration = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day";
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months`;
    return `${Math.ceil(diffDays / 365)} years`;
  };

  // const getExperienceColor = (years: number) => {
  //   if (years >= 10) return "bg-emerald-100 text-emerald-800 border-emerald-200";
  //   if (years >= 5) return "bg-blue-100 text-blue-800 border-blue-200";
  //   return "bg-gray-100 text-gray-800 border-gray-200";
  // };

  const getConnectionStrength = (count: number) => {
    if (count >= 5) return { label: "Strong", color: "text-emerald-600", bgColor: "bg-emerald-100" };
    if (count >= 3) return { label: "Good", color: "text-blue-600", bgColor: "bg-blue-100" };
    return { label: "New", color: "text-gray-600", bgColor: "bg-gray-100" };
  };

  if (loading) {
    return <Loading variant="page" icon="users" text="Loading your connections..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Enhanced Header */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Professional Connections
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Manage your healthcare professional network
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{connections.length}</div>
                  <div className="text-blue-100 text-sm">Total Connections</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">
                    {connections.reduce((total, conn) => total + conn.connectionCount, 0)}
                  </div>
                  <div className="text-blue-100 text-sm">Active Projects</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">
                    {connections.filter(conn => getConnectionStrength(conn.connectionCount).label === "Strong").length}
                  </div>
                  <div className="text-blue-100 text-sm">Strong Bonds</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-blue-100 text-sm">Success Rate</div>
                </div>
              </div>
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-300/20 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Connections Grid */}
        {loading ? (
          <SkeletonList count={6} />
        ) : connections.length === 0 ? (
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Connections Yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                You haven&apos;t accepted any pitches yet. Start by posting requirements and reviewing applications from healthcare professionals.
              </p>
              <Button 
                onClick={() => router.push("/requirements/new")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Post Your First Requirement
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Connections List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {connections.map((connection, index) => {
                const strength = getConnectionStrength(connection.connectionCount);
                return (
                  <Card
                    key={connection.doctor.id}
                    className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group overflow-hidden"
                    onClick={() => handleViewProfile(connection.doctor.id)}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <ProfileAvatar
                              src={connection.doctor.profileImage?.docUrl}
                              alt={connection.doctor.fullName}
                              fallback={connection.doctor.fullName[0]}
                              size="lg"
                              profileId={connection.doctor.id}
                              profileType="doctor"
                              className="border-3 border-white shadow-lg ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-300"
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors duration-200">
                              {connection.doctor.fullName}
                            </CardTitle>
                            <p className="text-blue-600 font-medium text-sm">
                              {connection.doctor.specialization}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${strength.bgColor} ${strength.color} border-current`}
                        >
                          {strength.label}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Connection Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Briefcase className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-700">Projects</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {connection.connectionCount}
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="h-4 w-4 text-emerald-600" />
                              <span className="text-sm font-medium text-gray-700">Experience</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {connection.doctor.experience}y
                            </div>
                          </div>
                        </div>

                        {/* Recent Projects */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Recent Projects</span>
                          </div>
                          <div className="space-y-2">
                            {connection.acceptedPitches.slice(0, 2).map((pitch) => (
                              <div key={pitch.id} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                <span className="truncate flex-1">{pitch.jobRequirement.title}</span>
                                <Badge variant="outline" className="text-xs">
                                  {pitch.jobRequirement.type}
                                </Badge>
                              </div>
                            ))}
                            {connection.acceptedPitches.length > 2 && (
                              <div className="text-xs text-gray-500 text-center py-1">
                                +{connection.acceptedPitches.length - 2} more projects
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Connection Duration */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>Connected for {getConnectionDuration(connection.latestConnection)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-medium text-gray-700">4.9</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button 
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                          size="sm"
                        >
                          View Full Profile
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-16">
              <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white overflow-hidden">
                <CardContent className="relative z-10 p-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Expand Your Network</h3>
                    <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                      Continue building valuable connections with healthcare professionals by posting new requirements or exploring our talent pool.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button 
                        variant="secondary"
                        onClick={() => router.push("/requirements/new")}
                        className="bg-white text-gray-900 hover:bg-gray-100"
                      >
                        <Briefcase className="h-4 w-4 mr-2" />
                        Post New Requirement
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => router.push("/search-doctors")}
                        className="border-white text-white hover:bg-white/10"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Explore Professionals
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
