import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Health Platform",
  description: "Create a Health Platform account to get started.",
};

export default function Page() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden">
      {/* Enhanced Branding Section */}
      <div className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-green-600 via-blue-700 to-purple-800 text-white">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-ping delay-500"></div>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                {/* Floating particles */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-green-300 rounded-full animate-bounce"></div>
                <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-blue-300 rounded-full animate-bounce delay-700"></div>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-bold leading-tight">
                Start Your
                <span className="block bg-gradient-to-r from-green-200 to-blue-200 bg-clip-text text-transparent">
                  Healthcare Journey
                </span>
              </h1>
              <p className="text-xl text-white/80 leading-relaxed">
                Join thousands of healthcare professionals already transforming patient care with our platform.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 gap-4 mt-8">
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Get Started in Under 2 Minutes</span>
            </div>
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Enterprise-Grade Security</span>
            </div>
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Free Trial - No Credit Card Required</span>
            </div>
          </div>

          {/* Success Stories */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-center space-x-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-4 h-4 text-yellow-300 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-white/90 text-sm leading-relaxed">
              &quot;This platform transformed how we connect with specialists. Our patient outcomes improved by 40% in just 3 months!&quot;
            </p>
            <p className="text-white/70 text-xs mt-2">- Dr. Sarah Johnson, Metro Health Clinic</p>
          </div>
        </div>
      </div>

      {/* Sign Up Section */}
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-12 py-8 bg-background relative z-10 lg:order-2">
        <div className="w-full max-w-md space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Create Your Account
              </h1>
              <p className="text-muted-foreground text-base mt-2">
                Join the future of healthcare collaboration
              </p>
            </div>
          </div>

          {/* Clerk Sign Up Component */}
          <SignUp
            path="/sign-up"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-card/50 backdrop-blur-xl text-card-foreground rounded-2xl shadow-2xl border border-border/50 p-0 overflow-hidden",
                headerTitle: "text-2xl font-bold tracking-tight",
                headerSubtitle: "text-muted-foreground text-sm",
                socialButtonsBlockButton: "border border-border/50 hover:bg-accent/50 transition-all duration-200 rounded-xl h-12 backdrop-blur-sm",
                socialButtonsBlockButtonText: "text-foreground font-medium",
                formButtonPrimary: "bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200",
                formFieldInput: "rounded-xl border-border/50 bg-background/50 backdrop-blur-sm py-3 px-4 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200",
                footerActionLink: "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors",
                formFieldLabel: "text-foreground font-medium",
                dividerLine: "bg-border/30",
                dividerText: "text-muted-foreground text-sm",
                formFieldRow: "space-y-2",
                footer: "mt-6"
              },
            }}
          />

          {/* Trust Indicators */}
          <div className="pt-6 border-t border-border/50">
            <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Data Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Background for Small Screens */}
      <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-950/50 dark:to-blue-950/50 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
      </div>
    </div>
  );
}
