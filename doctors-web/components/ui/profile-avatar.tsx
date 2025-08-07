"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  src?: string | null;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg" | "xl";
  profileId?: string;
  profileType?: "doctor" | "clinic";
  className?: string;
  clickable?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24"
};

const fallbackSizeClasses = {
  sm: "text-xs",
  md: "text-sm font-bold",
  lg: "text-lg font-bold",
  xl: "text-2xl font-bold"
};

export const ProfileAvatar = ({ 
  src, 
  alt, 
  fallback, 
  size = "md", 
  profileId, 
  profileType, 
  className,
  clickable = true
}: ProfileAvatarProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (!clickable || !profileId || !profileType) return;
    
    // For doctors-web, navigate to different routes based on profile type
    if (profileType === "doctor") {
      router.push(`/search-doctors/${profileId}`);
    } else if (profileType === "clinic") {
      router.push(`/clinics/${profileId}`);
    }
  };

  return (
    <Avatar 
      className={cn(
        sizeClasses[size],
        clickable && profileId && profileType && "cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all duration-200",
        "border-2 border-gray-200",
        className
      )}
      onClick={handleClick}
    >
      <AvatarImage src={src || ""} alt={alt || "Profile"} />
      <AvatarFallback className={cn(
        "bg-gradient-to-br text-white font-semibold",
        profileType === "doctor" 
          ? "from-green-500 to-blue-600" 
          : "from-blue-500 to-indigo-600",
        fallbackSizeClasses[size]
      )}>
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}; 