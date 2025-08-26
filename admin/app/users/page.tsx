"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  Building, 
  Stethoscope, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  MoreHorizontal,
  Mail,
  Phone,
  LogOut
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { adminApi, type Doctor, type Clinic } from "../../lib/api";
import { useAuthStore } from "../../lib/auth-store";

// Combined user interface
interface CombinedUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: "Doctor" | "Clinic";
  specialization?: string;
  status: "pending" | "verified" | "rejected";
  registrationDate: string;
  location?: string;
  experience?: string | number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<CombinedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<CombinedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { admin, logout } = useAuthStore();

  // Fetch users data from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllUsers();
      
      // Combine doctors and clinics into a single array
      const combinedUsers: CombinedUser[] = [
        ...(data.doctors || []).map((doctor: Doctor) => ({
          id: doctor.id,
          name: doctor.name ?? doctor.fullName ?? "Unknown Doctor",
          email: doctor.email,
          phone: doctor.phone ?? doctor.phoneNumber,
          type: "Doctor" as const,
          specialization: doctor.specialization,
          status: doctor.isVerified ? "verified" as const : "pending" as const,
          registrationDate: new Date(doctor.createdAt).toISOString().split('T')[0],
          location: doctor.location,
          experience: doctor.experience,
        })),
        ...(data.clinics || []).map((clinic: Clinic) => ({
          id: clinic.id,
          name: clinic.name ?? clinic.clinicName ?? "Unknown Clinic",
          email: clinic.email,
          phone: clinic.phone ?? clinic.clinicPhoneNumber,
          type: "Clinic" as const,
          specialization: clinic.description ?? clinic.clinicAdditionalDetails,
          status: clinic.isVerified ? "verified" as const : "pending" as const,
          registrationDate: new Date(clinic.createdAt).toISOString().split('T')[0],
          location: clinic.city && clinic.state ? `${clinic.city}, ${clinic.state}` : clinic.clinicAddress,
          experience: "",
        })),
      ];
      
      setUsers(combinedUsers);
    } catch (error) {
      toast.error("Failed to fetch users data");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(user => user.type.toLowerCase() === typeFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter, typeFilter]);

  const handleStatusChange = async (userId: string, userType: "Doctor" | "Clinic", newStatus: string) => {
    try {
      if (newStatus === "verified") {
        if (userType === "Doctor") {
          await adminApi.verifyDoctor(userId);
        } else {
          await adminApi.verifyClinic(userId);
        }
        
        // Update the local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: newStatus as 'pending' | 'verified' | 'rejected' } : user
        ));
        
        toast.success(`${userType} verified successfully`);
      } else if (newStatus === "rejected") {
        toast.info("Reject flow not implemented on backend yet");
      }
    } catch (error) {
      toast.error(`Failed to update ${userType.toLowerCase()}`);
      console.error("Error verifying user:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "Doctor" ? 
      <Stethoscope className="h-4 w-4 text-blue-600" /> : 
      <Building className="h-4 w-4 text-green-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage doctors and clinics on the platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Welcome, {admin?.name}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  logout();
                  toast.success("Logged out successfully");
                }}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doctors</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.type === "Doctor").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clinics</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.type === "Clinic").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.status === "pending").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search and Filter Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <select
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="doctor">Doctors</option>
                <option value="clinic">Clinics</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Manage user accounts and verification status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                      {getTypeIcon(user.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        {getStatusBadge(user.status)}
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {user.phone}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>{String(user.specialization ?? '')}</span>
                        <span>•</span>
                        <span>{user.location}</span>
                        <span>•</span>
                        <span>{String(user.experience ?? '')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {user.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(user.id, user.type, "verified")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(user.id, user.type, "rejected")}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}