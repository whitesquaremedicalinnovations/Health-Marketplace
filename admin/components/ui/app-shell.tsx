"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { 
  Shield, 
  Users, 
  Building, 
  BarChart3, 
  Newspaper, 
  Settings, 
  LogOut, 
  Search, 
  LayoutGrid,
  Menu,
  X,
  Bell,
  ChevronDown,
  Home,
  Calendar,
  FileText,
  TrendingUp,
  UserCheck,
  Zap
} from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Avatar, AvatarFallback } from "./avatar";
import { ThemeToggle } from "./theme-toggle";
import { Badge } from "./badge";
import { Separator } from "./separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { useAuthStore } from "../../lib/auth-store";
import { cn } from "../../lib/utils";

interface AppShellProps {
  children: ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  description?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { 
        href: "/", 
        label: "Dashboard", 
        icon: LayoutGrid,
        description: "Overview and analytics"
      },
      { 
        href: "/analytics", 
        label: "Analytics", 
        icon: BarChart3,
        description: "Detailed insights"
      },
    ]
  },
  {
    title: "Content Management",
    items: [
      { 
        href: "/news", 
        label: "News", 
        icon: Newspaper,
        description: "Manage articles"
      },
    ]
  },
  {
    title: "User Management",
    items: [
      { 
        href: "/users", 
        label: "Users", 
        icon: Users,
        description: "Manage all users"
      },
    ]
  },
  {
    title: "System",
    items: [
      { 
        href: "/settings", 
        label: "Settings", 
        icon: Settings,
        description: "System configuration"
      },
    ]
  }
];

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { admin, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getCurrentPageTitle = () => {
    for (const section of navSections) {
      for (const item of section.items) {
        if (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))) {
          return item.label;
        }
      }
    }
    return "Dashboard";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Sidebar Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">HealthCare</h1>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Admin Profile Section */}
          <div className="p-6 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                  {admin?.name?.[0]?.toUpperCase() ?? "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{admin?.name ?? "Admin User"}</p>
                <p className="text-sm text-muted-foreground truncate">{admin?.email ?? "admin@healthcare.com"}</p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {admin?.role ?? "Administrator"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {navSections.map((section, sectionIndex) => (
              <div key={section.title}>
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                        <div className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-md" 
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}>
                          <Icon className={cn(
                            "h-5 w-5 transition-transform group-hover:scale-110",
                            isActive ? "text-primary-foreground" : "text-muted-foreground"
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "font-medium truncate",
                              isActive ? "text-primary-foreground" : ""
                            )}>
                              {item.label}
                            </p>
                            {item.description && (
                              <p className={cn(
                                "text-xs truncate",
                                isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}>
                                {item.description}
                              </p>
                            )}
                          </div>
                          {item.badge && (
                            <Badge variant={isActive ? "secondary" : "outline"} className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
                {sectionIndex < navSections.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t bg-muted/30">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-between h-auto p-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                        {admin?.name?.[0]?.toUpperCase() ?? "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left min-w-0">
                      <p className="font-medium text-sm truncate">{admin?.name ?? "Admin"}</p>
                      <p className="text-xs text-muted-foreground">Manage account</p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Header */}
          <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="h-full px-4 lg:px-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                
                <div className="hidden lg:block">
                  <h1 className="text-xl font-semibold">{getCurrentPageTitle()}</h1>
                  <p className="text-sm text-muted-foreground">
                    Welcome back, {admin?.name?.split(' ')[0] ?? 'Admin'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Global Search */}
                <div className="relative hidden md:block w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search anything..." 
                    className="pl-9 bg-muted/50 border-0 focus-visible:bg-background transition-colors"
                  />
                </div>

                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="h-5 w-5" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        3
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="space-y-1">
                      <DropdownMenuItem className="flex items-start gap-3 p-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">New user registration</p>
                          <p className="text-xs text-muted-foreground">A new doctor has signed up</p>
                          <p className="text-xs text-muted-foreground">2 minutes ago</p>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-start gap-3 p-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">News article published</p>
                          <p className="text-xs text-muted-foreground">Healthcare guidelines updated</p>
                          <p className="text-xs text-muted-foreground">1 hour ago</p>
                        </div>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <ThemeToggle />

                <div className="hidden lg:block">
                  <Avatar className="h-8 w-8 border-2 border-muted">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                      {admin?.name?.[0]?.toUpperCase() ?? "A"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1">
            <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 