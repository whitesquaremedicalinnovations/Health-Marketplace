import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Health Platform",
  description: "Sign in to your Health Platform account.",
};

export default function Page() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden">
      {/* Sign In Section */}
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-12 py-8 bg-background relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-muted-foreground text-base mt-2">
                Sign in to your Health Platform account
              </p>
            </div>
          </div>

          {/* Clerk Sign In Component */}
          <SignIn
            path="/sign-in"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-card/50 backdrop-blur-xl text-card-foreground rounded-2xl shadow-2xl border border-border/50 p-0 overflow-hidden",
                headerTitle: "text-2xl font-bold tracking-tight",
                headerSubtitle: "text-muted-foreground text-sm",
                socialButtonsBlockButton: "border border-border/50 hover:bg-accent/50 transition-all duration-200 rounded-xl h-12 backdrop-blur-sm",
                socialButtonsBlockButtonText: "text-foreground font-medium",
                formButtonPrimary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200",
                formFieldInput: "rounded-xl border-border/50 bg-background/50 backdrop-blur-sm py-3 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200",
                footerActionLink: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors",
                formFieldLabel: "text-foreground font-medium",
                dividerLine: "bg-border/30",
                dividerText: "text-muted-foreground text-sm",
                formFieldRow: "space-y-2",
                footer: "mt-6"
              },
            }}
          />
        </div>
      </div>

      {/* Enhanced Branding Section */}
      <div className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-700 to-blue-800 text-white">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-2xl animate-ping"></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-8 px-12 max-w-lg">
          <div className="space-y-6">
            {/* Enhanced Logo */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                {/* Floating particles */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-300 rounded-full animate-bounce"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-green-300 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-bold leading-tight">
                Welcome to
                <span className="block bg-gradient-to-r from-yellow-200 to-green-200 bg-clip-text text-transparent">
                  Health Platform
                </span>
              </h1>
              <p className="text-xl text-white/80 leading-relaxed">
                Revolutionizing healthcare connections with cutting-edge technology and seamless collaboration tools.
              </p>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 gap-4 mt-8">
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium">Secure & HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Lightning Fast Performance</span>
            </div>
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium">24/7 Expert Support</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-200">10K+</div>
              <div className="text-xs text-white/70">Active Clinics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-200">50K+</div>
              <div className="text-xs text-white/70">Medical Professionals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-200">99.9%</div>
              <div className="text-xs text-white/70">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Background for Small Screens */}
      <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/50 dark:to-purple-950/50 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
      </div>
    </div>
  );
}
