"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import OverviewChart from "@/components/overview-chart";
import Image from "next/image";
import { 
  Briefcase, 
  Users, 
  CheckCircle, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  FileText,
  MessageSquare,
  Activity
} from "lucide-react";
import { Loading } from "@/components/ui/loading";

interface Overview {
  totalRequirements: number;
  requirementsByStatus: {
    requirementStatus: string;
    _count: {
      requirementStatus: number;
    };
  }[];
  totalPitches: number;
  pitchesByStatus: {
    status: string;
    _count: {
      status: number;
    };
  }[];
  recentPitches: {
    id: string;
    createdAt: string;
    doctor: {
      id: string;
      fullName: string;
      profileImage: {
        docUrl: string;
      } | null;
    };
    jobRequirement: {
      title: string;
    };
  }[];
  totalAccepted: number;
  latestNews: {
    id: string;
    title: string;
    imageUrl: string | null;
    createdAt: string;
  }[];
}

export default function Dashboard() {
  const { userId } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      axiosInstance
        .get(`/api/clinic/get-dashboard-overview/${userId}`)
        .then((res) => {
          const overviewData = res.data?.success ? res.data.data : res.data;
          
          // Ensure arrays exist with fallbacks
          const overviewWithDefaults = {
            ...overviewData,
            requirementsByStatus: overviewData?.requirementsByStatus || [],
            pitchesByStatus: overviewData?.pitchesByStatus || [],
            recentPitches: overviewData?.recentPitches || [],
            latestNews: overviewData?.latestNews || []
          };
          
          setOverview(overviewWithDefaults);
        })
        .catch((error) => {
          console.error("Error fetching dashboard overview:", error);
          // Set default values on error
          setOverview({
            totalRequirements: 0,
            requirementsByStatus: [],
            totalPitches: 0,
            pitchesByStatus: [],
            recentPitches: [],
            totalAccepted: 0,
            latestNews: []
          });
        });
    }
  }, [userId]);

  if (!overview) {
    return <Loading variant="page" icon="activity" text="Loading your dashboard..." />;
  }

  const requirementsChartData = (overview.requirementsByStatus || []).map((item) => ({
    name: item.requirementStatus,
    value: item._count.requirementStatus,
  }));

  const pitchesChartData = (overview.pitchesByStatus || []).map((item) => ({
    name: item.status,
    value: item._count.status,
  }));

  const requirementColors = ["hsl(var(--primary))", "hsl(var(--muted))"];
  const pitchColors = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--destructive))", "hsl(var(--muted))"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Enhanced Header */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome Back!
              </h1>
              <p className="text-blue-100 text-lg mb-6">
                Here&apos;s what&apos;s happening with your healthcare facility today
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{overview.totalRequirements}</div>
                  <div className="text-blue-100 text-sm">Total Jobs</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{overview.totalPitches}</div>
                  <div className="text-blue-100 text-sm">Applications</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{overview.totalAccepted}</div>
                  <div className="text-blue-100 text-sm">Connections</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{overview.recentPitches.length}</div>
                  <div className="text-blue-100 text-sm">Recent Activity</div>
                </div>
              </div>
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-300/20 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Active
                </Badge>
              </div>
              <CardTitle className="text-gray-900">Job Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {overview.totalRequirements}
              </div>
              <p className="text-gray-600 text-sm">
                Total posted requirements
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="link" 
                className="p-0 h-auto text-blue-600 hover:text-blue-700" 
                onClick={() => router.push("/requirements")}
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Pending
                </Badge>
              </div>
              <CardTitle className="text-gray-900">Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {overview.totalPitches}
              </div>
              <p className="text-gray-600 text-sm">
                Doctor applications received
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="link" 
                className="p-0 h-auto text-purple-600 hover:text-purple-700" 
                onClick={() => router.push("/pitches")}
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-emerald-50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                  Success
                </Badge>
              </div>
              <CardTitle className="text-gray-900">Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {overview.totalAccepted}
              </div>
              <p className="text-gray-600 text-sm">
                Successful doctor connections
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="link" 
                className="p-0 h-auto text-emerald-600 hover:text-emerald-700" 
                onClick={() => router.push("/connections")}
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Requirements Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <OverviewChart data={requirementsChartData} colors={requirementColors} />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Applications Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <OverviewChart data={pitchesChartData} colors={pitchColors} />
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Activity Sections */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Recent Applications</CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push("/pitches")}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(overview.recentPitches || []).length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No recent applications</p>
                  </div>
                ) : (
                  (overview.recentPitches || []).map((pitch) => (
                    <div key={pitch.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                      <ProfileAvatar
                        src={pitch.doctor.profileImage?.docUrl}
                        fallback={pitch.doctor.fullName[0]}
                        size="md"
                        profileId={pitch.doctor.id}
                        profileType="doctor"
                        className="shadow-md"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {pitch.doctor.fullName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Applied for{" "}
                          <Badge variant="secondary" className="ml-1">
                            {pitch.jobRequirement.title}
                          </Badge>
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(pitch.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Latest News</CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push("/news")}
                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(overview.latestNews || []).length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No recent news</p>
                  </div>
                ) : (
                  (overview.latestNews || []).map((news) => (
                    <div 
                      key={news.id} 
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-100 cursor-pointer hover:shadow-md transition-all duration-200"
                      onClick={() => router.push(`/news/${news.id}`)}
                    >
                      {news.imageUrl && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-md">
                          <Image
                            src={news.imageUrl}
                            alt={news.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 line-clamp-2">
                          {news.title}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(news.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}