import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Star, MapPin, Clock, Award } from "lucide-react";

interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
  experience: number;
  profileImage: string | null;
}

interface DoctorCardProps {
  doctor: Doctor;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const router = useRouter();

  const getExperienceColor = (years: number) => {
    if (years >= 10) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (years >= 5) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-3 border-white shadow-lg ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-300">
              <AvatarImage 
                src={doctor.profileImage || ""} 
                alt={doctor.fullName}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                {doctor.fullName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-200 truncate">
                  {doctor.fullName}
                </h3>
                <p className="text-blue-600 font-medium text-sm mb-1">
                  {doctor.specialization}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <Badge 
                variant="outline" 
                className={getExperienceColor(doctor.experience)}
              >
                <Clock className="h-3 w-3 mr-1" />
                {doctor.experience} {doctor.experience === 1 ? 'year' : 'years'}
              </Badge>
              
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-medium text-gray-700">4.8</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 text-gray-500">
                <MapPin className="h-3 w-3" />
                <span className="text-xs">Available nearby</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Award className="h-3 w-3" />
                <span className="text-xs">Verified</span>
              </div>
            </div>

            <Button 
              onClick={() => router.push(`/search-doctors/${doctor.id}`)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              size="sm"
            >
              View Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 