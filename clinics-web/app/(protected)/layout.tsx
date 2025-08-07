'use client'
import { Header } from "@/components/ui/header"
import { useUserContext }  from "@/provider/user-provider";
import { Loader2, Shield, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { userData, loading, error } = useUserContext();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        if(userData?.clinic?.isVerified){
            setIsVerified(true);
        }
        console.log("userData", userData)
    }, [userData]);

    if(loading){
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-6">
                    <div className="relative">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Loading your page...</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Please wait while we fetch your data</p>
                    </div>
                </div>
            </div>
        )
    }

    if(error){
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-950 dark:via-red-950/20 dark:to-gray-900 flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-red-200 dark:border-red-800 p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Something went wrong</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Error: {error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
            <Header />
            <main className="relative">
                {
                    !isVerified && !loading && userData?.clinic?.isVerified === false ? (
                        <div className="min-h-[calc(100vh-5rem)] bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
                            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                                <div className="space-y-6">
                                    {/* Icon */}
                                    <div className="flex justify-center">
                                        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                                            <Shield className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="space-y-3">
                                        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                            Account Under Verification
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Your clinic account is being reviewed by our team. You&apod;ll be notified once verification is complete.
                                        </p>
                                    </div>

                                    {/* Simple status */}
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                                                Verification in progress
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contact info */}
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Need help? Email us at{" "}
                                        <a href="mailto:support@healthplatform.com" className="text-blue-600 hover:text-blue-500">
                                            support@healthplatform.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="min-h-[calc(100vh-5rem)]">
                            {children}
                        </div>
                    )
                }
            </main>
        </div>
    )
}