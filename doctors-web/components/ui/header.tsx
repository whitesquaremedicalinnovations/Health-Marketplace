'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import {
  Hospital,
  LayoutDashboard,
  Newspaper,
  Stethoscope,
  Menu,
  X,
  MessageCircle,
  Users,
  LogOut,
  UserCog,
  FileText,
} from 'lucide-react';

import { Button } from './button';
import { cn } from '@/lib/utils';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ModeToggle } from './theme-toggle';
import { useUserContext } from '@/provider/user-provider';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/requirements', label: 'Find Jobs', icon: Hospital },
  { href: '/applications', label: 'My Applications', icon: FileText },
  { href: '/connections', label: 'Active Positions', icon: Users },
  { href: '/patients', label: 'Patients', icon: Users },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/news', label: 'News', icon: Newspaper },
];

export const Header = () => {
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const {userData} = useUserContext()
  console.log("userData", userData)
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isMenuOpen) setIsMenuOpen(false);
    };
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen]);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300 border-b backdrop-blur-md",
      scrolled 
        ? "bg-background/80 shadow-lg border-border/50" 
        : "bg-background/95 border-border/30"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <Hospital className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              HealthPlatform
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1">
            {isSignedIn &&
              navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-accent/50',
                    pathname === link.href 
                      ? 'text-primary bg-primary/10 shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="hidden xl:inline">{link.label}</span>
                </Link>
              ))}
          </nav>

          {/* Right side items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle - Hidden on mobile to save space */}
            <div className="hidden sm:block">
              <ModeToggle />
            </div>

            {isSignedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={userData?.doctor?.profileImage} alt={user?.fullName || 'User'} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {user?.firstName?.[0] ?? user?.emailAddresses[0]?.emailAddress[0]?.toUpperCase() ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 bg-background/95 backdrop-blur-md border border-border/50">
                  <div className="px-3 py-2 border-b border-border/50">
                    <p className="text-sm font-medium text-foreground">
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                  
                  <DropdownMenuItem asChild className="gap-2 py-3 cursor-pointer">
                    <Link href="/profile">
                      <UserCog className="h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="gap-2 py-3 cursor-pointer">
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  {/* Mobile-only theme toggle */}
                  <div className="sm:hidden">
                    <DropdownMenuSeparator />
                    <div className="px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Theme</span>
                        <ModeToggle />
                      </div>
                    </div>
                  </div>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({redirectUrl: "/api/auth/sign-out"})}
                    className="gap-2 py-3 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex gap-2">
                <Button size="sm" variant="ghost" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-10 w-10 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Mobile Menu */}
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-xl z-50">
            <div className="container mx-auto px-4 py-6 space-y-2">
              {isSignedIn ? (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200',
                        pathname === link.href 
                          ? 'text-primary bg-primary/10 shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  ))}
                  
                  <div className="border-t border-border/50 pt-4 mt-4">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserCog className="h-5 w-5" />
                      My Profile
                    </Link>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <Button asChild className="w-full h-12 text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg" onClick={() => setIsMenuOpen(false)}>
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full h-12 text-base" onClick={() => setIsMenuOpen(false)}>
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};
