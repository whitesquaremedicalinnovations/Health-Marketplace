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

export default function EnhancedAdminDashboard() {
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
    value: string;
    description: string;
    icon: any;
    trend: string;
    href: string;
  }) => (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground mb-2">{description}</p>
          <div className="flex items-center text-xs">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            <span className="text-green-600">{trend}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
          <p className="text-muted-foreground">Failed to load dashboard data</p>
          <Button onClick={loadData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">HealthCare Admin</h1>
                  <p className="text-sm text-muted-foreground">Comprehensive Healthcare Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshData}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <nav className="flex space-x-2">
                <Link href="/users">
                  <Button variant="ghost" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Users
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
                <Link href="/news">
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    News
                  </Button>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with System Health */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
              <p className="text-muted-foreground">Real-time insights into your healthcare platform</p>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">System Online</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Uptime: {data.systemHealth.uptime.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={data.totalUsers.toLocaleString()}
            description="Registered platform users"
            icon={Users}
            trend={`+${data.monthlyGrowth.toFixed(1)}% from last month`}
            href="/users"
          />
          <StatCard
            title="Healthcare Facilities"
            value={data.totalClinics.toLocaleString()}
            description="Active clinics & hospitals"
            icon={Building}
            trend="+8% from last month"
            href="/users?type=clinic"
          />
          <StatCard
            title="Medical Professionals"
            value={data.totalDoctors.toLocaleString()}
            description="Verified doctors"
            icon={Stethoscope}
            trend="+15% from last month"
            href="/users?type=doctor"
          />
          <StatCard
            title="Platform Revenue"
            value={`₹${data.totalRevenue.toLocaleString()}`}
            description="Total earnings"
            icon={DollarSign}
            trend="+23% from last month"
            href="/analytics"
          />
        </div>

        {/* Verification & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-500" />
                Pending Verifications
              </CardTitle>
              <CardDescription>
                Users awaiting approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {data.pendingVerifications}
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Verified</span>
                  <span className="font-medium text-green-600">{data.verifiedUsers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rejected</span>
                  <span className="font-medium text-red-600">{data.rejectedUsers}</span>
                </div>
              </div>
              <Link href="/users?status=pending">
                <Button className="w-full">
                  Review Applications
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                System Performance
              </CardTitle>
              <CardDescription>
                Real-time platform metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {data.systemHealth.uptime.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <Progress value={data.systemHealth.uptime} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {data.systemHealth.responseTime}ms
                  </div>
                  <p className="text-sm text-muted-foreground">Response Time</p>
                  <Progress value={Math.max(0, 100 - data.systemHealth.responseTime / 5)} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {data.systemHealth.errorRate.toFixed(2)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Error Rate</p>
                  <Progress value={Math.max(0, 100 - data.systemHealth.errorRate * 10)} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Recent Users</TabsTrigger>
            <TabsTrigger value="payments">Payment Activity</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Latest User Registrations</CardTitle>
                <CardDescription>
                  Recent user activity and verification status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.type === 'Doctor' ? 
                              <Stethoscope className="h-4 w-4" /> : 
                              <Building className="h-4 w-4" />
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {user.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(user.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            user.status === 'verified' ? 'default' : 
                            user.status === 'pending' ? 'secondary' : 
                            'destructive'
                          }
                        >
                          {user.status === 'verified' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {user.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {user.status === 'rejected' && <UserX className="h-3 w-3 mr-1" />}
                          {user.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <Link href="/users">
                  <Button variant="outline" className="w-full">
                    View All Users ({data.totalUsers})
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Transactions</CardTitle>
                <CardDescription>
                  Recent payment activity and revenue tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium">{payment.user}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {payment.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(payment.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{payment.amount.toLocaleString()}</p>
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
                  ))}
                </div>
                <Separator className="my-4" />
                <Link href="/analytics">
                  <Button variant="outline" className="w-full">
                    View Payment Analytics
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requirements">
            <Card>
              <CardHeader>
                <CardTitle>Active Requirements</CardTitle>
                <CardDescription>
                  Job postings and medical requirements status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{data.totalRequirements}</div>
                    <p className="text-sm text-muted-foreground">Total Requirements</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{data.completedRequirements}</div>
                    <p className="text-sm text-muted-foreground">Fulfilled</p>
                  </div>
                </div>
                <Progress 
                  value={(data.completedRequirements / data.totalRequirements) * 100} 
                  className="mb-4" 
                />
                <div className="text-center text-sm text-muted-foreground mb-4">
                  {((data.completedRequirements / data.totalRequirements) * 100).toFixed(1)}% completion rate
                </div>
                <Link href="/requirements">
                  <Button variant="outline" className="w-full">
                    Manage Requirements
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}