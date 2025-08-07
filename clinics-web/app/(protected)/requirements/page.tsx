"use client";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Eye, Edit3, Trash2, Briefcase, Calendar, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { axiosInstance } from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";

interface Requirement {
  id: string;
  title: string;
  type: string;
  requirementStatus: string;
  createdAt: string;
  description?: string;
  specialization?: string;
}

export default function Requirements() {
  const { userId } = useAuth();
  const router = useRouter();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [requirementToDelete, setRequirementToDelete] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchRequirements = async () => {
      if (userId) {
        try {
          setLoading(true);
          const response = await axiosInstance.get(`/api/clinic/get-requirements-by-clinic/${userId}`)
          console.log("response", response)
          if(response.status === 200){
            setRequirements(response.data.requirements)
          }else{
            alert("Failed to fetch requirements")
          }
        } catch (error) {
          console.error("Error fetching requirements:", error);
          alert("Failed to fetch requirements")
        } finally {
          setLoading(false);
        }
      }
    };
    fetchRequirements();
  }, [userId]);

  const handleEdit = (id: string) => {
    router.push(`/requirements/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!requirementToDelete) return;

    const response = await axiosInstance.delete(`/api/clinic/delete-requirement/${requirementToDelete}`, {
      data: { clinicId: userId },
    })
    if(response.status === 204){
      setRequirements(requirements.filter((req) => req.id !== requirementToDelete))
    }else{
      alert("Failed to delete requirement")
    }

    setRequirements(
      requirements.filter((req) => req.id !== requirementToDelete)
    );
    setShowDeleteDialog(false);
    setRequirementToDelete(null);
  };

  const openDeleteDialog = (id: string) => {
    setRequirementToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleView = (id: string) => {
    router.push(`/requirements/view/${id}`);
  };

  const getStatusColor = (status: string) => {
    return status === 'POSTED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FULLTIME':
        return <Briefcase className="h-4 w-4" />;
      case 'PARTTIME':
        return <Calendar className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const formatSpecialization = (specialization: string) => {
    return specialization
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (loading) {
    return <Loading variant="page" icon="briefcase" text="Loading your job requirements..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Job Requirements
                </h1>
                <p className="text-blue-100 text-lg">
                  Manage and track your hiring needs
                </p>
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2 text-white/90">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-sm">{requirements.filter(r => r.requirementStatus === 'POSTED').length} Active</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm">{requirements.filter(r => r.requirementStatus === 'COMPLETED').length} Completed</span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => router.push("/requirements/new")}
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 border-0"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Post New Requirement
              </Button>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-300/20 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Requirements Grid */}
        {requirements.length === 0 ? (
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Requirements Yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start by posting your first job requirement to connect with qualified healthcare professionals.
              </p>
              <Button 
                onClick={() => router.push("/requirements/new")}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Post Your First Requirement
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {requirements.map((req) => (
              <Card key={req.id} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                          {getTypeIcon(req.type)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{req.title}</h3>
                          <p className="text-gray-600">{req.specialization ? formatSpecialization(req.specialization) : 'General Practice'}</p>
                        </div>
                      </div>
                      
                      {req.description && (
                        <p className="text-gray-700 mb-4 line-clamp-2">{req.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 mb-4">
                        <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                          {req.type.charAt(0) + req.type.slice(1).toLowerCase()}
                        </Badge>
                        <Badge className={getStatusColor(req.requirementStatus)}>
                          {req.requirementStatus}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(req.id)}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 w-full justify-start"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(req.id)}
                        className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 w-full justify-start"
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(req.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50 w-full justify-start"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              This action cannot be undone. This will permanently delete the requirement and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}