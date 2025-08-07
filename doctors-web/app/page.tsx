"use client"

import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { 
  Hospital, 
  Users, 
  Shield, 
  Clock, 
  CheckCircle, 
  Star,
  ArrowRight,
  Stethoscope,
  HeartHandshake,
  Building,
  Award,
  MapPin,
  Calendar,
  TrendingUp
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-gray-900 dark:text-white">Find Your Perfect</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Healthcare Position
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Connect with amazing clinics looking for talented healthcare professionals like you. Find opportunities that match your skills, schedule, and career goals.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
                  <Link href="/sign-up">
                    Start Your Search
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base border-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Link href="/sign-in">
                    I Have An Account
                  </Link>
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Verified Clinics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span>Safe & Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <span>Quick Responses</span>
                </div>
              </div>
            </div>
            
            {/* Right Content - Visual */}
            <div className="relative">
              <div className="relative mx-auto max-w-lg">
                {/* Main Card */}
                <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex space-x-1">
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Dr. Sarah Johnson</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Family Medicine • 8 years experience</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">5 Active Applications</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Connected to 3 Clinics</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">95% Response Rate</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-8 -left-8 w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                  <Calendar className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center shadow-lg animate-bounce delay-1000">
                  <MapPin className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 sm:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Why Healthcare Professionals Choose Us
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to find great healthcare opportunities and build your career
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "Find Jobs Near You",
                description: "Search for positions based on location, distance, and your preferred commute. We'll show you opportunities right in your area."
              },
              {
                icon: Calendar,
                title: "Flexible Scheduling",
                description: "Find full-time, part-time, or one-time positions that fit your schedule and lifestyle. Work when you want, where you want."
              },
              {
                icon: Shield,
                title: "Verified Opportunities",
                description: "All clinics are verified and background-checked. We make sure you're connecting with legitimate, reputable healthcare facilities."
              },
              {
                icon: TrendingUp,
                title: "Career Growth",
                description: "Track your applications, build professional relationships, and grow your network in the healthcare community."
              },
              {
                icon: Users,
                title: "Great Work Environment",
                description: "Connect with clinics that value their team members and provide supportive, collaborative work environments."
              },
              {
                icon: HeartHandshake,
                title: "Make a Difference",
                description: "Find positions where you can truly impact patient care and be part of teams that are changing lives every day."
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 hover:scale-105">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-20 sm:py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { number: "2,000+", label: "Healthcare Professionals" },
              { number: "500+", label: "Partner Clinics" },
              { number: "5,000+", label: "Successful Placements" },
              { number: "4.9★", label: "Average Rating" }
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold">{stat.number}</div>
                <div className="text-sm sm:text-base text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 sm:py-24 lg:py-32 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Ready to Find Your Next Opportunity?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Join thousands of healthcare professionals who have found amazing career opportunities through our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
                <Link href="/sign-up">
                  Start Finding Opportunities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <span className="text-sm text-gray-500 dark:text-gray-400">Free to join • No fees • Apply instantly</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl">MedConnect</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Connecting healthcare professionals with meaningful career opportunities.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Doctors</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Find Jobs</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Career Resources</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Professional Network</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Getting Started</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 MedConnect. Empowering healthcare careers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
