"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  User, 
  Stethoscope, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Save, 
  X,
  Camera,
  Award,
  Calendar,
  Heart,
  Briefcase,
  Trash2,
  MessageSquare
} from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import { Loading } from "@/components/ui/loading";

enum DoctorSpecialization {
  GENERAL_PHYSICIAN = "GENERAL_PHYSICIAN",
  CARDIOLOGIST = "CARDIOLOGIST", 
  DERMATOLOGIST = "DERMATOLOGIST",
  ENDOCRINOLOGIST = "ENDOCRINOLOGIST",
  GYNECOLOGIST = "GYNECOLOGIST",
  NEUROSURGEON = "NEUROSURGEON",
  ORTHOPEDIC_SURGEON = "ORTHOPEDIC_SURGEON",
  PLASTIC_SURGEON = "PLASTIC_SURGEON",
  UROLOGIST = "UROLOGIST",
  ENT_SPECIALIST = "ENT_SPECIALIST",
  PEDIATRICIAN = "PEDIATRICIAN",
  PSYCHIATRIST = "PSYCHIATRIST",
  DENTIST = "DENTIST"
}

interface DoctorProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  specialization: DoctorSpecialization;
  experience: number;
  about: string;
  additionalInformation: string;
  certifications: string[];
  profileImage?: {
    docUrl: string;
  };
  pitches: Array<{
    id: string;
    status: string;
    createdAt: string;
    jobRequirement: {
      title: string;
      clinic: {
        clinicName: string;
      };
    };
  }>;
  accepted: Array<{
    id: string;
    connectedAt: string;
    clinic: {
      clinicName: string;
    };
    job: {
      title: string;
      type: string;
    };
  }>;
}

export default function Profile() {
  const { user } = useUser();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentCertification, setCurrentCertification] = useState("");

  // Editing states
  const [editData, setEditData] = useState<Partial<DoctorProfile>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        try {
          const response = await axiosInstance.get(`/api/doctor/get-doctor/${user.id}`);
          setProfile(response.data.doctor);
          setEditData(response.data.doctor);
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [user?.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axiosInstance.post(`/api/user/profile/update/${user?.id}`, {
        role: "DOCTOR",
        ...editData
      });
      if (response.status === 200) {
        setProfile(response.data.doctor);
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const addCertification = () => {
    if (currentCertification.trim() && editData.certifications && !editData.certifications.includes(currentCertification.trim())) {
      setEditData({
        ...editData,
        certifications: [...editData.certifications, currentCertification.trim()]
      });
      setCurrentCertification("");
    }
  };

  const removeCertification = (index: number) => {
    if (editData.certifications) {
      setEditData({
        ...editData,
        certifications: editData.certifications.filter((_, i) => i !== index)
      });
    }
  };

  const formatSpecialization = (spec: string) => {
    return spec.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'WITHDRAWN': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return <Loading variant="page" text="Loading your profile..." />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto p-8">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm max-w-2xl mx-auto">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Profile Not Found</h3>
              <p className="text-gray-600">
                We couldn't find your profile. Please contact support if this persists.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                    <AvatarImage src={profile.profileImage?.docUrl || ""} />
                    <AvatarFallback className="bg-white text-blue-600 text-2xl font-bold">
                      {profile.fullName[0]}
                    </AvatarFallback>
                  </Avatar>
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
                    Dr. {profile.fullName}
                  </h1>
                  <p className="text-blue-100 text-lg mb-2">
                    {formatSpecialization(profile.specialization)} • {profile.experience} years experience
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {profile.pitches.length} Applications
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {profile.accepted.length} Active Jobs
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
          {/* Personal Information */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Personal Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={editing ? editData.fullName || "" : profile.fullName}
                  onChange={(e) => editing && setEditData({...editData, fullName: e.target.value})}
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
                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  value={editing ? editData.phoneNumber || "" : profile.phoneNumber}
                  onChange={(e) => editing && setEditData({...editData, phoneNumber: e.target.value})}
                  disabled={!editing}
                  className={editing ? "border-blue-300" : "bg-gray-50"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={editing ? editData.gender || "" : profile.gender} 
                  onValueChange={(value) => editing && setEditData({...editData, gender: value})}
                  disabled={!editing}
                >
                  <SelectTrigger className={editing ? "border-blue-300" : "bg-gray-50"}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={editing ? editData.dateOfBirth?.split('T')[0] || "" : profile.dateOfBirth.split('T')[0]}
                  onChange={(e) => editing && setEditData({...editData, dateOfBirth: e.target.value})}
                  disabled={!editing}
                  className={editing ? "border-blue-300" : "bg-gray-50"}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <Input
                  id="address"
                  value={editing ? editData.address || "" : profile.address}
                  onChange={(e) => editing && setEditData({...editData, address: e.target.value})}
                  disabled={!editing}
                  className={editing ? "border-blue-300" : "bg-gray-50"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-lg">
                  <Stethoscope className="h-5 w-5 text-emerald-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Professional Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="specialization" className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Specialization
                </Label>
                <Select 
                  value={editing ? editData.specialization || "" : profile.specialization} 
                  onValueChange={(value) => editing && setEditData({...editData, specialization: value as DoctorSpecialization})}
                  disabled={!editing}
                >
                  <SelectTrigger className={editing ? "border-blue-300" : "bg-gray-50"}>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DoctorSpecialization).map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {formatSpecialization(spec)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Experience
                  </span>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                    {editing ? editData.experience || 0 : profile.experience} years
                  </span>
                </Label>
                {editing ? (
                  <div className="px-3">
                    <Slider 
                      value={[editData.experience || 0]} 
                      onValueChange={(val) => setEditData({...editData, experience: val[0]})} 
                      max={50}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0 years</span>
                      <span>50+ years</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-6 bg-gray-100 rounded-full">
                    <div 
                      className="h-6 bg-blue-500 rounded-full transition-all duration-300"
                      style={{width: `${(profile.experience / 50) * 100}%`}}
                    ></div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="about">About</Label>
                <Textarea
                  id="about"
                  value={editing ? editData.about || "" : profile.about}
                  onChange={(e) => editing && setEditData({...editData, about: e.target.value})}
                  disabled={!editing}
                  className={editing ? "border-blue-300" : "bg-gray-50"}
                  rows={4}
                  placeholder="Tell potential employers about yourself..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="additionalInformation">Additional Information</Label>
                <Textarea
                  id="additionalInformation"
                  value={editing ? editData.additionalInformation || "" : profile.additionalInformation}
                  onChange={(e) => editing && setEditData({...editData, additionalInformation: e.target.value})}
                  disabled={!editing}
                  className={editing ? "border-blue-300" : "bg-gray-50"}
                  rows={3}
                />
              </div>

              {/* Certifications */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Certifications
                </Label>
                
                {editing && (
                  <div className="flex gap-2">
                    <Input
                      value={currentCertification}
                      onChange={(e) => setCurrentCertification(e.target.value)}
                      placeholder="Enter certification"
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                    />
                    <Button 
                      type="button" 
                      onClick={addCertification}
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {(editing ? editData.certifications : profile.certifications)?.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-full text-sm">
                      <span>{cert}</span>
                      {editing && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCertification(index)}
                          className="h-auto p-0 hover:bg-transparent"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity & Stats */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Professional Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{profile.pitches.length}</div>
                  <div className="text-sm text-gray-600">Applications</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{profile.accepted.length}</div>
                  <div className="text-sm text-gray-600">Active Jobs</div>
                </div>
              </div>

              {/* Recent Applications */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Recent Applications
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {profile.pitches.slice(0, 5).map((pitch) => (
                    <div key={pitch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{pitch.jobRequirement.title}</p>
                        <p className="text-xs text-gray-600">{pitch.jobRequirement.clinic.clinicName}</p>
                      </div>
                      <Badge className={getStatusColor(pitch.status)}>
                        {pitch.status.toLowerCase()}
                      </Badge>
                    </div>
                  ))}
                  {profile.pitches.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No applications yet</p>
                  )}
                </div>
              </div>

              {/* Active Jobs */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Active Jobs
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {profile.accepted.map((job) => (
                    <div key={job.id} className="p-3 bg-green-50 rounded-lg">
                      <p className="font-medium text-sm">{job.job.title}</p>
                      <p className="text-xs text-gray-600">{job.clinic.clinicName}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {job.job.type.toLowerCase()}
                      </Badge>
                    </div>
                  ))}
                  {profile.accepted.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No active jobs</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        {editing && (
          <div className="mt-8 flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setEditing(false);
                setEditData(profile);
              }}
              className="px-8"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save All Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}