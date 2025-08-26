"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Settings, 
  ArrowLeft,
  DollarSign,
  Save,
  LogOut
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { adminApi } from "../../lib/api";
import { useAuthStore } from "../../lib/auth-store";

export default function SettingsPage() {
  const [onboardingFee, setOnboardingFee] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { admin, logout } = useAuthStore();

  // Fetch current settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getOnboardingFee();
      setOnboardingFee(data.fee);
    } catch (error) {
      toast.error("Failed to fetch settings");
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveOnboardingFee = async () => {
    try {
      setSaving(true);
      await adminApi.setOnboardingFee(onboardingFee);
      toast.success("Onboarding fee updated successfully");
    } catch (error) {
      toast.error("Failed to update onboarding fee");
      console.error("Error updating onboarding fee:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage platform configuration and settings</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Welcome, {admin?.name}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  logout();
                  toast.success("Logged out successfully");
                }}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Onboarding Fee Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Onboarding Fee
              </CardTitle>
              <CardDescription>
                Set the fee that users pay when joining the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="onboarding-fee" className="block text-sm font-medium text-gray-700 mb-2">
                    Fee Amount (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      id="onboarding-fee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={onboardingFee}
                      onChange={(e) => setOnboardingFee(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter fee amount"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleSaveOnboardingFee}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Platform Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                Platform Information
              </CardTitle>
              <CardDescription>
                Current platform status and information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-gray-700">Platform Version</span>
                  <span className="text-sm text-gray-600">v1.0.0</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-gray-700">Environment</span>
                  <span className="text-sm text-gray-600">Development</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-gray-700">Last Updated</span>
                  <span className="text-sm text-gray-600">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-700">Admin User</span>
                  <span className="text-sm text-gray-600">{admin?.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}