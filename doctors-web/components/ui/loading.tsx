import { cn } from "@/lib/utils";
import { Loader2, Activity, Heart, Users, Briefcase, MessageCircle, Newspaper } from "lucide-react";

interface LoadingProps {
  variant?: "default" | "page" | "card" | "button" | "pulse";
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  icon?: "default" | "activity" | "heart" | "users" | "briefcase" | "message" | "news";
  className?: string;
}

const iconMap = {
  default: Loader2,
  activity: Activity,
  heart: Heart,
  users: Users,
  briefcase: Briefcase,
  message: MessageCircle,
  news: Newspaper,
};

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const textSizeMap = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg", 
  xl: "text-xl",
};

export function Loading({ 
  variant = "default", 
  size = "md", 
  text, 
  icon = "default",
  className 
}: LoadingProps) {
  const Icon = iconMap[icon];

  if (variant === "page") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex justify-center items-center">
        <div className="text-center">
          <div className="relative mb-6 w-20 h-20 mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center animate-pulse">
              <Icon className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
            <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-blue-200 animate-ping"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">
            {text || "Loading..."}
          </p>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Icon className={cn("text-blue-600 animate-spin", sizeMap[size])} />
          </div>
          {text && (
            <p className={cn("text-gray-600 font-medium", textSizeMap[size])}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="space-y-4">
          <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-3/4"></div>
            <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "button") {
    return (
      <Icon className={cn("animate-spin", sizeMap[size], className)} />
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Icon className={cn("animate-spin text-blue-600", sizeMap[size])} />
      {text && (
        <span className={cn("text-gray-600 font-medium", textSizeMap[size])}>
          {text}
        </span>
      )}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden", className)}>
      <div className="animate-pulse">
        <div className="h-48 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200"></div>
        <div className="p-6 space-y-4">
          <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded"></div>
            <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-5/6"></div>
          </div>
          <div className="flex justify-between items-center pt-4">
            <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-20"></div>
            <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-lg p-6">
          <div className="animate-pulse flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-3/4"></div>
              <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/2"></div>
              <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={cn("border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden", className)}>
      <div className="animate-pulse">
        <div className="border-b border-gray-200 p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="h-4 bg-gradient-to-r from-slate-300 to-slate-400 rounded"></div>
            ))}
          </div>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="border-b border-gray-100 p-4 last:border-b-0">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {Array.from({ length: cols }).map((_, j) => (
                <div key={j} className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 