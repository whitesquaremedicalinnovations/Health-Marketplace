"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  LogOut
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

// Dashboard data interface
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

  // Fetch real dashboard data from API
  const fetchDashboardData = async (): Promise<DashboardData> => {
    try {
      console.log("Fetching dashboard data...");
      
      const [overviewData, usersData, paymentsData] = await Promise.all([
        adminApi.getOverview(),
        adminApi.getAllUsers(),
        adminApi.getAllPayments(),
      ]);

      console.log("API responses:", { overviewData, usersData, paymentsData });

      // Transform and combine the data
      const recentUsers = [
        ...(usersData.doctors || []).slice(0, 3).map(doctor => ({
          id: doctor.id,
          name: doctor.name || "Unknown Doctor",
          type: "Doctor" as const,
          status: doctor.isVerified ? "verified" as const : "pending" as const,
          date: new Date(doctor.createdAt).toISOString().split('T')[0],
        })),
        ...(usersData.clinics || []).slice(0, 2).map(clinic => ({
          id: clinic.id,
          name: clinic.name || "Unknown Clinic",
          type: "Clinic" as const,
          status: clinic.isVerified ? "verified" as const : "pending" as const,
          date: new Date(clinic.createdAt).toISOString().split('T')[0],
        })),
      ];

      const recentPayments = (paymentsData.payments || []).slice(0, 4).map(payment => ({
        id: payment.id,
        user: payment.user?.name || "Unknown User",
        amount: payment.amount || 0,
        type: (payment.type as "Onboarding" | "Subscription" | "Commission") || "Onboarding",
        date: new Date(payment.createdAt).toISOString().split('T')[0],
        status: (payment.status as "completed" | "pending" | "failed") || "completed",
      }));

      const result = {
        ...overviewData,
        recentUsers,
        recentPayments,
      };

      console.log("Transformed dashboard data:", result);
      return result;
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
      toast.success("Dashboard data refreshed");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend, 
    href 
  }: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: string;
    href?: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center pt-2">
            <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
            <span className="text-xs text-green-600 font-medium">{trend}</span>
          </div>
        )}
        {href && (
          <Link href={href}>
            <Button variant="outline" size="sm" className="mt-2">
              View Details
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-600 mb-4">Unable to fetch dashboard data. Please try again.</p>
          <Button onClick={loadData} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
          <p className="text-gray-600">Monitor and manage your healthcare platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatCard
            title="Total Doctors"
            value={data?.totalDoctors?.toLocaleString() || 0}
            description="Registered doctors on platform"
            icon={Stethoscope}
            href="/users?type=doctor"
          />
          <StatCard
            title="Total Clinics"
            value={data?.totalClinics?.toLocaleString() || 0}
            description="Active healthcare facilities"
            icon={Building}
            href="/users?type=clinic"
          />
          <StatCard
            title="Total Payments"
            value={data?.totalPayments?.toLocaleString() || 0}
            description="Payment transactions"
            icon={DollarSign}
            href="/analytics"
          />
          <StatCard
            title="Total Revenue"
            value={`$${data?.totalAmount?._sum?.amount?.toLocaleString() || 0}`}
            description="Total platform revenue"
            icon={Wallet}
            href="/analytics"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatCard
            title="Total Pitches"
            value={data?.totalPitches?.toLocaleString() || 0}
            description="Job pitches submitted"
            icon={FileText}
            href="/analytics"
          />
          <StatCard
            title="Total Likes"
            value={data?.totalLikes?.toLocaleString() || 0}
            description="News article likes"
            icon={UserCheck}
            href="/news"
          />
          <StatCard
            title="Total Comments"
            value={data?.totalComments?.toLocaleString() || 0}
            description="News article comments"
            icon={Activity}
            href="/news"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                Pending Verifications
              </CardTitle>
              <CardDescription>
                Users awaiting verification approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-4">
                {data?.recentUsers?.filter(u => u.status === 'pending').length || 0}
              </div>
              <Link href="/users?status=pending">
                <Button className="w-full">
                  Review Verifications
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-500" />
                Platform Settings
              </CardTitle>
              <CardDescription>
                Manage fees, policies, and configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Total News</span>
                  <span className="font-medium">{data?.totalNews || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Requirements</span>
                  <span className="font-medium">{data?.totalRequirements || 0}</span>
                </div>
              </div>
              <Link href="/settings">
                <Button variant="outline" className="w-full">
                  Manage Settings
                  <Settings className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Users
                <Link href="/users">
                  <Button variant="outline" size="sm">
                    View All
                    <Eye className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.recentUsers && data.recentUsers.length > 0 ? (
                  data.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        user.status === 'verified' ? 'bg-green-500' : 'bg-orange-500'
                      }`} />
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={user.status === 'verified' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{user.date}</p>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent users</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Payments
                <Link href="/analytics">
                  <Button variant="outline" size="sm">
                    View All
                    <Eye className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.recentPayments && data.recentPayments.length > 0 ? (
                  data.recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div>
                        <p className="font-medium text-sm">{payment.user}</p>
                        <p className="text-xs text-gray-500">{payment.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">${payment.amount}</p>
                      <p className="text-xs text-gray-500">{payment.date}</p>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent payments</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
