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
  RefreshCw
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

// Dynamic data interface
interface DashboardData {
  totalUsers: number;
  totalClinics: number;
  totalDoctors: number;
  totalRevenue: number;
  monthlyGrowth: number;
  pendingVerifications: number;
  verifiedUsers: number;
  rejectedUsers: number;
  activeConnections: number;
  totalRequirements: number;
  completedRequirements: number;
  recentUsers: Array<{
    id: number;
    name: string;
    type: "Doctor" | "Clinic";
    status: "pending" | "verified" | "rejected";
    date: string;
    avatar?: string;
  }>;
  recentPayments: Array<{
    id: number;
    user: string;
    amount: number;
    type: "Onboarding" | "Subscription" | "Commission";
    date: string;
    status: "completed" | "pending" | "failed";
  }>;
  systemHealth: {
    uptime: number;
    responseTime: number;
    errorRate: number;
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Simulate API data fetching
  const fetchDashboardData = async (): Promise<DashboardData> => {
    // In real app, this would be an actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalUsers: 1248 + Math.floor(Math.random() * 50),
          totalClinics: 342 + Math.floor(Math.random() * 10),
          totalDoctors: 906 + Math.floor(Math.random() * 20),
          totalRevenue: 125400 + Math.floor(Math.random() * 5000),
          monthlyGrowth: 12.5 + (Math.random() * 5 - 2.5),
          pendingVerifications: 23 + Math.floor(Math.random() * 10),
          verifiedUsers: 1180 + Math.floor(Math.random() * 30),
          rejectedUsers: 45 + Math.floor(Math.random() * 5),
          activeConnections: 456 + Math.floor(Math.random() * 20),
          totalRequirements: 89 + Math.floor(Math.random() * 10),
          completedRequirements: 67 + Math.floor(Math.random() * 5),
          recentUsers: [
            { id: 1, name: "Dr. Sarah Johnson", type: "Doctor", status: "pending", date: "2024-01-15", avatar: "/avatars/01.png" },
            { id: 2, name: "City Medical Center", type: "Clinic", status: "verified", date: "2024-01-14" },
            { id: 3, name: "Dr. Michael Chen", type: "Doctor", status: "verified", date: "2024-01-13" },
            { id: 4, name: "HealthCare Plus", type: "Clinic", status: "pending", date: "2024-01-12" },
            { id: 5, name: "Dr. Emily Davis", type: "Doctor", status: "rejected", date: "2024-01-11" },
          ],
          recentPayments: [
            { id: 1, user: "Dr. Sarah Johnson", amount: 500, type: "Onboarding", date: "2024-01-15", status: "completed" },
            { id: 2, user: "City Medical Center", amount: 500, type: "Onboarding", date: "2024-01-14", status: "completed" },
            { id: 3, user: "Dr. Michael Chen", amount: 500, type: "Onboarding", date: "2024-01-13", status: "pending" },
            { id: 4, user: "HealthCare Plus", amount: 1200, type: "Subscription", date: "2024-01-12", status: "completed" },
          ],
          systemHealth: {
            uptime: 99.8 + (Math.random() * 0.2),
            responseTime: 120 + Math.floor(Math.random() * 50),
            errorRate: 0.1 + (Math.random() * 0.1),
          },
        });
      }, 1000);
    });
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
    icon: any;
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">HealthCare Admin</h1>
              </div>
            </div>
            <nav className="flex space-x-4">
              <Link href="/users">
                <Button variant="ghost">Users</Button>
              </Link>
              <Link href="/analytics">
                <Button variant="ghost">Analytics</Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost">Settings</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
          <p className="text-gray-600">Monitor and manage your healthcare platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={data?.totalUsers.toLocaleString() || 0}
            description="Registered users on platform"
            icon={Users}
            trend="+12% from last month"
            href="/users"
          />
          <StatCard
            title="Clinics"
            value={data?.totalClinics.toLocaleString() || 0}
            description="Active healthcare facilities"
            icon={Building}
            trend="+8% from last month"
            href="/users?type=clinic"
          />
          <StatCard
            title="Doctors"
            value={data?.totalDoctors.toLocaleString() || 0}
            description="Verified medical professionals"
            icon={Stethoscope}
            trend="+15% from last month"
            href="/users?type=doctor"
          />
          <StatCard
            title="Revenue"
            value={`$${data?.totalRevenue.toLocaleString()}`}
            description="Total platform revenue"
            icon={DollarSign}
            trend="+23% from last month"
            href="/analytics"
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
                {data?.pendingVerifications}
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
                  <span>Onboarding Fee</span>
                  <span className="font-medium">$500</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active Policies</span>
                  <span className="font-medium">12</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                {data?.recentUsers.map((user) => (
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
                ))}
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
                {data?.recentPayments.map((payment) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
