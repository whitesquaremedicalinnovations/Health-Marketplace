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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  MapPin,
  Heart,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";

interface Overview {
  totalApplications: number;
  applicationsByStatus: {
    status: string;
    _count: {
      status: number;
    };
  }[];
  totalConnections: number;
  recentApplications: {
    id: string;
    createdAt: string;
    status: string;
    jobRequirement: {
      title: string;
      clinic: {
        clinicName: string;
        clinicProfileImage: {
          docUrl: string;
        } | null;
      };
    };
  }[];
  availableJobs: number;
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
        .get(`/api/doctor/get-dashboard-overview/${userId}`)
        .then((res) => {
          setOverview(res.data);
        });
    }
  }, [userId]);

  if (!overview) {
    return <Loading variant="page" icon="activity" text="Loading your dashboard..." />;
  }

  const applicationChartData = overview.applicationsByStatus.map((item) => ({
    name: item.status,
    value: item._count.status,
  }));

  const applicationColors = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--destructive))", "hsl(var(--muted))"];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'WITHDRAWN': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Enhanced Header */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, Doctor!
              </h1>
              <p className="text-blue-100 text-lg mb-6">
                Here&apos;s your professional activity and new opportunities
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{overview.totalApplications}</div>
                  <div className="text-blue-100 text-sm">Applications</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{overview.totalConnections}</div>
                  <div className="text-blue-100 text-sm">Active Jobs</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{overview.availableJobs}</div>
                  <div className="text-blue-100 text-sm">Available Jobs</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{overview.recentApplications.length}</div>
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
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Active
                </Badge>
              </div>
              <CardTitle className="text-gray-900">My Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {overview.totalApplications}
              </div>
              <p className="text-gray-600 text-sm">
                Job applications submitted
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="link" 
                className="p-0 h-auto text-blue-600 hover:text-blue-700" 
                onClick={() => router.push("/applications")}
              >
                View Applications <ArrowRight className="h-4 w-4 ml-1" />
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
                  Working
                </Badge>
              </div>
              <CardTitle className="text-gray-900">Active Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {overview.totalConnections}
              </div>
              <p className="text-gray-600 text-sm">
                Currently working with clinics
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="link" 
                className="p-0 h-auto text-emerald-600 hover:text-emerald-700" 
                onClick={() => router.push("/connections")}
              >
                View Jobs <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Available
                </Badge>
              </div>
              <CardTitle className="text-gray-900">New Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {overview.availableJobs}
              </div>
              <p className="text-gray-600 text-sm">
                Jobs available in your area
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="link" 
                className="p-0 h-auto text-purple-600 hover:text-purple-700" 
                onClick={() => router.push("/jobs")}
              >
                Browse Jobs <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Application Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <OverviewChart data={applicationChartData} colors={applicationColors} />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Quick Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => router.push("/jobs")}
                className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Find New Jobs
              </Button>
              <Button 
                onClick={() => router.push("/profile")}
                variant="outline"
                className="w-full justify-start border-gray-200 hover:bg-gray-50"
              >
                <Users className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
              <Button 
                onClick={() => router.push("/applications")}
                variant="outline"
                className="w-full justify-start border-gray-200 hover:bg-gray-50"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                My Applications
              </Button>
              <Button 
                onClick={() => router.push("/connections")}
                variant="outline"
                className="w-full justify-start border-gray-200 hover:bg-gray-50"
              >
                <Heart className="h-4 w-4 mr-2" />
                My Work History
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Activity Sections */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Recent Applications</CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push("/applications")}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                See All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {overview.recentApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No applications yet</p>
                    <p className="text-gray-400 text-sm">Start applying for jobs to see your activity here</p>
                  </div>
                ) : (
                  overview.recentApplications.map((application) => (
                    <div key={application.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                        <AvatarImage src={application.jobRequirement.clinic.clinicProfileImage?.docUrl || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                          {application.jobRequirement.clinic.clinicName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {application.jobRequirement.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          At{" "}
                          <span className="font-medium">{application.jobRequirement.clinic.clinicName}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusBadgeColor(application.status)}>
                            {application.status.toLowerCase()}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                            {new Date(application.createdAt).toLocaleDateString()}
                          </div>
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
                <CardTitle className="text-xl text-gray-900">Healthcare News</CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push("/news")}
                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              >
                Read More <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {overview.latestNews.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No news updates</p>
                    <p className="text-gray-400 text-sm">Stay tuned for the latest healthcare news</p>
                  </div>
                ) : (
                  overview.latestNews.map((news) => (
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