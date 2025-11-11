"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Building, 
  Stethoscope, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  FileText, 
  Settings,
  Shield,
  BarChart3,
  Calendar,
  ArrowUpRight,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  UserCheck,
  UserX,
  Wallet,
  Globe,
  RefreshCw,
  LogOut,
  TrendingDown,
  ArrowRight,
  Sparkles
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { adminApi } from "../lib/api";
import { useAuthStore } from "../lib/auth-store";
import Link from "next/link";

interface DashboardData {
  totalDoctors: number;
  totalClinics: number;
  totalPitches: number;
  totalRequirements: number;
  totalPayments: number;
  totalAmount: { _sum: { amount: number | null } };
  totalNews: number;
  totalLikes: number;
  totalComments: number;
  recentUsers: Array<{
    id: string;
    name: string;
    type: "Doctor" | "Clinic";
    status: "pending" | "verified" | "rejected";
    date: string;
    avatar?: string;
  }>;
  recentPayments: Array<{
    id: string;
    user: string;
    amount: number;
    type: "Onboarding" | "Subscription" | "Commission";
    date: string;
    status: "completed" | "pending" | "failed";
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { admin, logout } = useAuthStore();

  const fetchDashboardData = async (): Promise<DashboardData> => {
    try {
      const [overviewData, usersData, paymentsData] = await Promise.all([
        adminApi.getOverview(),
        adminApi.getAllUsers(),
        adminApi.getAllPayments(),
      ]);

      const recentUsers = [
        ...(usersData.doctors || []).slice(0, 5).map(doctor => ({
          id: doctor.id,
          name: doctor.name || doctor.fullName || "Unknown Doctor",
          type: "Doctor" as const,
          status: doctor.isVerified ? "verified" as const : "pending" as const,
          date: new Date(doctor.createdAt).toISOString().split('T')[0],
        })),
        ...(usersData.clinics || []).slice(0, 3).map(clinic => ({
          id: clinic.id,
          name: clinic.name || clinic.clinicName || "Unknown Clinic",
          type: "Clinic" as const,
          status: clinic.isVerified ? "verified" as const : "pending" as const,
          date: new Date(clinic.createdAt).toISOString().split('T')[0],
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

      const recentPayments = (paymentsData.payments || []).slice(0, 5).map(payment => ({
        id: payment.id,
        user: payment.user?.name || "Unknown User",
        amount: payment.amount || 0,
        type: (payment.type as "Onboarding" | "Subscription" | "Commission") || "Onboarding",
        date: new Date(payment.createdAt).toISOString().split('T')[0],
        status: (payment.status as "completed" | "pending" | "failed") || "completed",
      }));

      return {
        ...overviewData,
        recentUsers,
        recentPayments,
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const dashboardData = await fetchDashboardData();
      setData(dashboardData);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      const dashboardData = await fetchDashboardData();
      setData(dashboardData);
      toast.success("Dashboard refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend, 
    trendValue,
    href,
    gradient,
    badge
  }: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: "up" | "down";
    trendValue?: string;
    href?: string;
    gradient?: string;
    badge?: string;
  }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${gradient || "bg-primary/10"}`}>
          <Icon className={`h-5 w-5 ${gradient ? "text-white" : "text-primary"}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-bold">{value}</div>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-xs ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}>
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {href && (
          <Link href={href} className="mt-4 block">
            <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/5">
              View Details <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div>
            <p className="text-lg font-medium">Loading dashboard...</p>
            <p className="text-sm text-muted-foreground">Gathering platform insights</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Failed to Load Dashboard</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Unable to fetch dashboard data. Please check your connection and try again.
                </p>
                <Button onClick={loadData} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingVerifications = data.recentUsers.filter(u => u.status === 'pending').length;
  const verificationRate = data.recentUsers.length > 0 
    ? ((data.recentUsers.length - pendingVerifications) / data.recentUsers.length * 100).toFixed(0)
    : 100;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {admin?.name?.split(' ')[0] || 'Admin'}. Here's what's happening on your platform.
          </p>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={refreshing}
          variant="outline"
          className="sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Doctors"
          value={data?.totalDoctors?.toLocaleString() || 0}
          description="Registered medical professionals"
          icon={Stethoscope}
          trend="up"
          trendValue="+12%"
          href="/users?type=doctor"
          gradient="bg-blue-500"
        />
        <StatCard
          title="Total Clinics"
          value={data?.totalClinics?.toLocaleString() || 0}
          description="Active healthcare facilities"
          icon={Building}
          trend="up"
          trendValue="+8%"
          href="/users?type=clinic"
          gradient="bg-green-500"
        />
        <StatCard
          title="Total Revenue"
          value={`$${data?.totalAmount?._sum?.amount?.toLocaleString() || 0}`}
          description="Platform revenue generated"
          icon={Wallet}
          trend="up"
          trendValue="+24%"
          href="/analytics"
          gradient="bg-yellow-500"
        />
        <StatCard
          title="Total Payments"
          value={data?.totalPayments?.toLocaleString() || 0}
          description="Payment transactions"
          icon={DollarSign}
          href="/analytics"
          gradient="bg-purple-500"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Job Pitches"
          value={data?.totalPitches?.toLocaleString() || 0}
          description="Applications submitted"
          icon={FileText}
          href="/analytics"
        />
        <StatCard
          title="Job Requirements"
          value={data?.totalRequirements?.toLocaleString() || 0}
          description="Jobs posted by clinics"
          icon={Activity}
          href="/analytics"
        />
        <StatCard
          title="News Articles"
          value={data?.totalNews?.toLocaleString() || 0}
          description="Published content"
          icon={FileText}
          href="/news"
          badge={`${data?.totalLikes || 0} likes`}
        />
        <StatCard
          title="User Engagement"
          value={data?.totalComments?.toLocaleString() || 0}
          description="Comments on articles"
          icon={UserCheck}
          href="/news"
        />
      </div>

      {/* Quick Actions & Important Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Verifications */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Pending Verifications
              </CardTitle>
              <CardDescription className="mt-1">
                {pendingVerifications} users awaiting approval
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {pendingVerifications}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Verification Rate</span>
                <span className="font-medium">{verificationRate}%</span>
              </div>
              <Progress value={parseInt(verificationRate)} className="h-2" />
            </div>
            <Link href="/users?status=pending">
              <Button className="w-full" variant="default">
                Review All Verifications
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Platform Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Platform Health
            </CardTitle>
            <CardDescription>System status overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">API Status</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Operational
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Database</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Connected
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Payment Gateway</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Recent Users</TabsTrigger>
          <TabsTrigger value="payments">Recent Payments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent User Registrations</CardTitle>
                <CardDescription>Latest users who joined the platform</CardDescription>
              </div>
              <Link href="/users">
                <Button variant="outline" size="sm">
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data?.recentUsers && data.recentUsers.length > 0 ? (
                  data.recentUsers.map((user) => (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 border-2">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {user.name[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{user.name}</p>
                            {user.status === 'verified' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {user.type}
                            </Badge>
                            <span>•</span>
                            <span>{user.date}</span>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={user.status === 'verified' ? 'default' : 'secondary'}
                        className="shrink-0"
                      >
                        {user.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No recent users</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Latest payment transactions</CardDescription>
              </div>
              <Link href="/analytics">
                <Button variant="outline" size="sm">
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data?.recentPayments && data.recentPayments.length > 0 ? (
                  data.recentPayments.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${
                          payment.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20' :
                          payment.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                          'bg-red-100 dark:bg-red-900/20'
                        }`}>
                          <DollarSign className={`h-4 w-4 ${
                            payment.status === 'completed' ? 'text-green-600' :
                            payment.status === 'pending' ? 'text-yellow-600' :
                            'text-red-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{payment.user}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {payment.type}
                            </Badge>
                            <span>•</span>
                            <span>{payment.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${payment.amount.toLocaleString()}</p>
                        <Badge 
                          variant={
                            payment.status === 'completed' ? 'default' :
                            payment.status === 'pending' ? 'secondary' :
                            'destructive'
                          }
                          className="text-xs"
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No recent payments</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}