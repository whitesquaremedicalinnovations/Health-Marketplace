"use client";

import { useEffect, useState, useCallback } from "react";
import { axiosInstance } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CheckCircle, 
  Clock, 
  Calendar,
  BarChart3,
  Activity,
  Target,
  Timer
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

interface PatientAnalytics {
  totalPatients: number;
  activePatients: number;
  completedPatients: number;
  averageCompletionTime: number; // in days
  completionRate: number; // percentage
  newPatientsThisPeriod: number;
  completedThisPeriod: number;
  averagePatientsPerDoctor: number;
  busyDoctors: {
    id: string;
    fullName: string;
    patientCount: number;
  }[];
  dailyActivity: {
    date: string;
    newPatients: number;
    completedPatients: number;
    activeChats: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
    percentage: number;
  }[];
  monthlyTrends: {
    month: string;
    patients: number;
    completed: number;
    completionRate: number;
  }[];
  performanceMetrics: {
    averageResponseTime: number; // in hours
    patientSatisfaction: number; // percentage
    doctorUtilization: number; // percentage
  };
}

interface PatientAnalyticsOverviewProps {
  userId: string | null;
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function PatientAnalyticsOverview({ userId }: PatientAnalyticsOverviewProps) {
  const [analytics, setAnalytics] = useState<PatientAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState("30"); // days

  const fetchAnalytics = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Simulate API call - replace with actual endpoint
      const response = await axiosInstance.get(`/api/analytics/patient-overview/${userId}?days=${timeFrame}`);
      
      // For now, we'll create mock data structure based on existing patient data
      const patientsResponse = await axiosInstance.get(`/api/patient/get-clinic-patients/${userId}`);
      const allPatients = patientsResponse.data?.success ? patientsResponse.data.data : patientsResponse.data;
      
      const doctorsResponse = await axiosInstance.get(`/api/clinic/connected-doctors/${userId}`);
      const connectedDoctors = doctorsResponse.data?.success ? doctorsResponse.data.data : doctorsResponse.data;
      
      // Calculate analytics from existing data
      const totalPatients = allPatients?.length || 0;
      const activePatients = allPatients?.filter((p: any) => p.status === 'ACTIVE').length || 0;
      const completedPatients = allPatients?.filter((p: any) => p.status === 'COMPLETED').length || 0;
      
      const mockAnalytics: PatientAnalytics = {
        totalPatients,
        activePatients,
        completedPatients,
        averageCompletionTime: Math.floor(Math.random() * 30) + 15, // 15-45 days
        completionRate: totalPatients > 0 ? Math.round((completedPatients / totalPatients) * 100) : 0,
        newPatientsThisPeriod: Math.floor(totalPatients * 0.3),
        completedThisPeriod: Math.floor(completedPatients * 0.4),
        averagePatientsPerDoctor: connectedDoctors?.length > 0 ? Math.round(totalPatients / connectedDoctors.length) : 0,
        busyDoctors: (connectedDoctors || []).slice(0, 3).map((doc: any, index: number) => ({
          id: doc.id,
          fullName: doc.fullName,
          patientCount: Math.floor(Math.random() * 15) + 5
        })),
        dailyActivity: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          newPatients: Math.floor(Math.random() * 5) + 1,
          completedPatients: Math.floor(Math.random() * 3) + 1,
          activeChats: Math.floor(Math.random() * 10) + 5
        })),
        statusDistribution: [
          { status: 'Active', count: activePatients, percentage: totalPatients > 0 ? Math.round((activePatients / totalPatients) * 100) : 0 },
          { status: 'Completed', count: completedPatients, percentage: totalPatients > 0 ? Math.round((completedPatients / totalPatients) * 100) : 0 }
        ],
        monthlyTrends: Array.from({ length: 6 }, (_, i) => {
          const month = new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' });
          const patients = Math.floor(Math.random() * 20) + 10;
          const completed = Math.floor(patients * 0.7);
          return {
            month,
            patients,
            completed,
            completionRate: Math.round((completed / patients) * 100)
          };
        }),
        performanceMetrics: {
          averageResponseTime: Math.floor(Math.random() * 4) + 1, // 1-5 hours
          patientSatisfaction: Math.floor(Math.random() * 20) + 80, // 80-100%
          doctorUtilization: Math.floor(Math.random() * 30) + 70 // 70-100%
        }
      };
      
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [userId, timeFrame]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Unable to load analytics</p>
      </div>
    );
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with Time Filter */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Patient Analytics</h3>
        <Select value={timeFrame} onValueChange={setTimeFrame}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 Days</SelectItem>
            <SelectItem value="30">30 Days</SelectItem>
            <SelectItem value="90">90 Days</SelectItem>
            <SelectItem value="365">1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Patients</p>
                <p className="text-2xl font-bold text-blue-900">{analytics.totalPatients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2 text-xs text-blue-600">
              {getTrendIcon(analytics.newPatientsThisPeriod, Math.floor(analytics.newPatientsThisPeriod * 0.8))}
              <span className="ml-1">+{analytics.newPatientsThisPeriod} this period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active</p>
                <p className="text-2xl font-bold text-green-900">{analytics.activePatients}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2 text-xs text-green-600">
              <Activity className="h-3 w-3" />
              <span className="ml-1">Currently ongoing</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Completed</p>
                <p className="text-2xl font-bold text-purple-900">{analytics.completedPatients}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2 text-xs text-purple-600">
              <Target className="h-3 w-3" />
              <span className="ml-1">{analytics.completionRate}% completion rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Avg. Duration</p>
                <p className="text-2xl font-bold text-orange-900">{analytics.averageCompletionTime}d</p>
              </div>
              <Timer className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex items-center mt-2 text-xs text-orange-600">
              <Calendar className="h-3 w-3" />
              <span className="ml-1">Average completion time</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Response Time</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {analytics.performanceMetrics.averageResponseTime}h avg
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.min(analytics.performanceMetrics.averageResponseTime * 20, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Patient Satisfaction</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {analytics.performanceMetrics.patientSatisfaction}%
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${analytics.performanceMetrics.patientSatisfaction}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Doctor Utilization</span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {analytics.performanceMetrics.doctorUtilization}%
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${analytics.performanceMetrics.doctorUtilization}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Patient Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any, name: any, props: any) => [
                  `${value} patients (${props.payload.percentage}%)`,
                  props.payload.status
                ]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {analytics.statusDistribution.map((item, index) => (
                <div key={item.status} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">{item.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Activity Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Daily Activity (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="newPatients" fill="#10B981" name="New Patients" />
                <Bar dataKey="completedPatients" fill="#8B5CF6" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Doctors */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Most Active Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.busyDoctors.map((doctor, index) => (
              <div key={doctor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {doctor.fullName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{doctor.fullName}</p>
                    <p className="text-sm text-gray-500">Active patients: {doctor.patientCount}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-white">
                  #{index + 1}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">6-Month Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="patients" stroke="#10B981" name="Total Patients" strokeWidth={2} />
              <Line type="monotone" dataKey="completed" stroke="#8B5CF6" name="Completed" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}