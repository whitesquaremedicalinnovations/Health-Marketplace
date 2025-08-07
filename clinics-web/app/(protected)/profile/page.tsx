"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  Camera,
  Briefcase,
  Users,
  Star,
  Calendar,
  TrendingUp
} from "lucide-react";
import { Loading } from "@/components/ui/loading";

interface Clinic {
  id: string;
  email: string;
  ownerName: string;
  ownerPhoneNumber: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhoneNumber: string;
  clinicAdditionalDetails: string | null;
  profileImage: {
    docUrl: string;
  } | null;
  jobRequirements: JobRequirement[];
  connections: Connection[];
}

interface JobRequirement {
  id: string;
  title: string;
  type: string;
  requirementStatus: string;
  createdAt: string;
  _count: {
    pitches: number;
  };
}

interface Connection {
  id: string;
  doctor: {
    fullName: string;
    specialization: string;
  };
  jobRequirement: {
    title: string;
    type: string;
  };
  createdAt: string;
}

export default function Profile() {
  const { userId } = useAuth();
  const [profile, setProfile] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<Clinic>>({});

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    if (!userId) return;
    
    try {
      const response = await axiosInstance.get(`/api/clinic/get-clinic/${userId}`);
      setProfile(response.data.clinic);
      setEditData(response.data.clinic);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId || !editData) return;
    
    setSaving(true);
    try {
      await axiosInstance.post(`/api/user/profile/update/${userId}`, {
        ...editData,
        role: "CLINIC"
      });
      
      setProfile(prev => prev ? { ...prev, ...editData } : null);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const formatJobType = (type: string) => {
    switch (type) {
      case 'FULLTIME': return 'Full-time';
      case 'PARTTIME': return 'Part-time';
      case 'ONETIME': return 'One-time';
      default: return type;
    }
  };

  if (loading) {
    return <Loading variant="page" text="Loading your profile..." />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-gray-600 mb-4">Unable to load your profile. Please try again.</p>
            <Button onClick={fetchProfile}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Profile Header */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <ProfileAvatar
                    src={profile.profileImage?.docUrl}
                    fallback={profile.clinicName[0]}
                    size="xl"
                    profileId={profile.id}
                    profileType="clinic"
                    className="border-4 border-white shadow-xl"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 border-2 border-white bg-white hover:bg-gray-50"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {profile.clinicName}
                  </h1>
                  <p className="text-blue-100 text-lg mb-2">
                    Owned by Dr. {profile.ownerName}
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {profile.jobRequirements.length} Job Posts
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {profile.connections.length} Active Hires
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={saving}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                {saving ? (
                  <>Saving...</>
                ) : editing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-300/20 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Clinic Information */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Clinic Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="clinicName" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Clinic Name
                </Label>
                <Input
                  id="clinicName"
                  value={editing ? editData.clinicName || "" : profile.clinicName}
                  onChange={(e) => editing && setEditData({...editData, clinicName: e.target.value})}
                  disabled={!editing}
                  className={editing ? "border-blue-300" : "bg-gray-50"}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clinicAddress" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Clinic Address
                </Label>
                <Textarea
                  id="clinicAddress"
                  value={editing ? editData.clinicAddress || "" : profile.clinicAddress}
                  onChange={(e) => editing && setEditData({...editData, clinicAddress: e.target.value})}
                  disabled={!editing}
                  className={editing ? "border-blue-300" : "bg-gray-50"}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clinicPhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Clinic Phone
                </Label>
                <Input
                  id="clinicPhone"
                  value={editing ? editData.clinicPhoneNumber || "" : profile.clinicPhoneNumber}
                  onChange={(e) => editing && setEditData({...editData, clinicPhoneNumber: e.target.value})}
                  disabled={!editing}
                  className={editing ? "border-blue-300" : "bg-gray-50"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalDetails" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  About the Clinic
                </Label>
                <Textarea
                  id="additionalDetails"
                  value={editing ? editData.clinicAdditionalDetails || "" : profile.clinicAdditionalDetails || ""}
                  onChange={(e) => editing && setEditData({...editData, clinicAdditionalDetails: e.target.value})}
                  disabled={!editing}
                  className={editing ? "border-blue-300" : "bg-gray-50"}
                  rows={4}
                  placeholder="Describe your clinic, services, specialties..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Owner Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ownerName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Owner Name
                </Label>
                <Input
                  id="ownerName"
                  value={editing ? editData.ownerName || "" : profile.ownerName}
                  onChange={(e) => editing && setEditData({...editData, ownerName: e.target.value})}
                  disabled={!editing}
                  className={editing ? "border-blue-300" : "bg-gray-50"}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  Email cannot be changed here. Update it in your account settings.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ownerPhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Owner Phone
                </Label>
                <Input
                  id="ownerPhone"
                  value={editing ? editData.ownerPhoneNumber || "" : profile.ownerPhoneNumber}
                  onChange={(e) => editing && setEditData({...editData, ownerPhoneNumber: e.target.value})}
                  disabled={!editing}
                  className={editing ? "border-blue-300" : "bg-gray-50"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Activity & Statistics */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Quick Stats</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">{profile.jobRequirements.length}</div>
                  <div className="text-sm text-blue-600">Total Job Posts</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">{profile.connections.length}</div>
                  <div className="text-sm text-green-600">Active Hires</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">
                    {profile.jobRequirements.filter(req => req.requirementStatus === 'POSTED').length}
                  </div>
                  <div className="text-sm text-purple-600">Open Positions</div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Job Posts */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg">
                    <Briefcase className="h-5 w-5 text-yellow-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Recent Posts</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {profile.jobRequirements.length > 0 ? (
                  <div className="space-y-3">
                    {profile.jobRequirements.slice(0, 3).map((job) => (
                      <div key={job.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{job.title}</h4>
                          <Badge 
                            variant={job.requirementStatus === 'POSTED' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {job.requirementStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatJobType(job.type)}</span>
                          <span>{job._count.pitches} applications</span>
                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No job posts yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Hires */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-teal-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Recent Hires</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {profile.connections.length > 0 ? (
                  <div className="space-y-3">
                    {profile.connections.slice(0, 3).map((connection) => (
                      <div key={connection.id} className="p-3 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 text-sm">
                          Dr. {connection.doctor.fullName}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>{connection.doctor.specialization}</span>
                          <span>{connection.jobRequirement.title}</span>
                          <span>{new Date(connection.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No hires yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}