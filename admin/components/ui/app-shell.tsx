"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Shield, Users, Building, BarChart3, Newspaper, Settings, LogOut, Search, LayoutGrid } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Avatar, AvatarFallback } from "./avatar";
import { ThemeToggle } from "./theme-toggle";
import { useAuthStore } from "../../lib/auth-store";

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/users", label: "Users", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { admin, logout } = useAuthStore();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[260px_1fr] bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col border-r bg-card">
        <div className="h-16 px-4 flex items-center gap-2 border-b">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold">Admin Panel</span>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{admin?.name?.[0] ?? "A"}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium leading-none">{admin?.name ?? "Admin"}</div>
                <div className="text-muted-foreground text-xs">{admin?.email ?? "admin"}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b bg-background px-4 flex items-center gap-2">
          <div className="lg:hidden mr-2 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9" />
          </div>
          <ThemeToggle />
          <Link href="/settings">
            <Button variant="outline" size="sm">Settings</Button>
          </Link>
        </header>

        {/* Content */}
        <main className="p-4 md:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
} 