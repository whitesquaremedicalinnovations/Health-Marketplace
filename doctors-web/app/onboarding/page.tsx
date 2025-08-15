"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { checkUserExists, getUser, onboardingDoctor } from "@/lib/utils"
import { setAuthCookie } from "@/lib/set-auth-cookie"
import { Loader2, Trash2, Upload, Camera, MapPin, Phone, User, Stethoscope, FileText, CheckCircle2, Calendar, Award } from "lucide-react"
import { APIProvider } from "@vis.gl/react-google-maps"
import OnboardingMapSection from "@/components/onboarding-map-section"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

enum DoctorSpecialization {
  GENERAL_PHYSICIAN = "GENERAL_PHYSICIAN",
  CARDIOLOGIST = "CARDIOLOGIST", 
  DERMATOLOGIST = "DERMATOLOGIST",
  ENDOCRINOLOGIST = "ENDOCRINOLOGIST",
  GYNECOLOGIST = "GYNECOLOGIST",
  NEUROSURGEON = "NEUROSURGEON",
  ORTHOPEDIC_SURGEON = "ORTHOPEDIC_SURGEON",
  PLASTIC_SURGEON = "PLASTIC_SURGEON",
  UROLOGIST = "UROLOGIST",
  ENT_SPECIALIST = "ENT_SPECIALIST",
  PEDIATRICIAN = "PEDIATRICIAN",
  PSYCHIATRIST = "PSYCHIATRIST",
  DENTIST = "DENTIST"
}

export default function Onboarding() {
  const { user } = useUser()
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Personal Information
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [gender, setGender] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")

  // Professional Information
  const [specialization, setSpecialization] = useState<DoctorSpecialization>(DoctorSpecialization.GENERAL_PHYSICIAN)
  const [experience, setExperience] = useState(0)
  const [about, setAbout] = useState("")
  const [additionalInformation, setAdditionalInformation] = useState("")
  const [certifications, setCertifications] = useState<string[]>([])
  const [currentCertification, setCurrentCertification] = useState("")

  // Location and Documents
  const [address, setAddress] = useState("")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [preferredRadius, setPreferredRadius] = useState(25)
  const [locationRange, setLocationRange] = useState(50)
  const [mapCenter, setMapCenter] = useState({ lat: 51.5072, lng: -0.1276 })
  const [documents, setDocuments] = useState<File[]>([])
  const [profileImage, setProfileImage] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)
  const [isCheckingUser] = useState(true)

  const handleNext = () => setStep((s) => s + 1)
  const handlePrev = () => setStep((s) => s - 1)

  useEffect(() => {
    const initializeOnboarding = async () => {
      const check_user = await getUser(user?.id ?? "")
      if (check_user) {
        const existingUser = await checkUserExists(user?.id ?? "")
        if (existingUser.status === 200 && existingUser.data?.onboarded) {
          router.push('/dashboard')
        } else {
          // Initialize form with user data
          setFullName(`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim())
          setEmail(user?.emailAddresses[0]?.emailAddress ?? "")
          setPhoneNumber(user?.phoneNumbers[0]?.phoneNumber ?? "")
        }
      } else {
        router.push('/sign-in')
      }
    }
    initializeOnboarding()
  }, [router, user?.id, user?.firstName, user?.lastName, user?.emailAddresses, user?.phoneNumbers])

  const addCertification = () => {
    if (currentCertification.trim() && !certifications.includes(currentCertification.trim())) {
      setCertifications([...certifications, currentCertification.trim()])
      setCurrentCertification("")
    }
  }

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    if (profileImage) formData.append("profileImage", profileImage)
    documents.forEach((doc) => formData.append("documents", doc))

    let profileImageUrl = null
    let documentUrls: string[] = []

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      profileImageUrl = data.uploaded.find((item: { fieldName: string; url: string; }) => item.fieldName === "profileImage")?.url
      documentUrls = data.uploaded.filter((item: { fieldName: string; url: string; }) => item.fieldName === "documents").map((item: { url: string; }) => item.url)
    } catch (err) {
      console.error("Upload failed", err)
      alert("Upload failed")
      setLoading(false)
      return;
    }

    try {
      const doctorData = {
        doctorId: user?.id ?? "",
        email,
        fullName,
        gender,
        dateOfBirth,
        phoneNumber,
        address,
        specialization,
        additionalInformation,
        experience,
        about,
        certifications,
        profileImage: profileImageUrl,
        documents: documentUrls,
        locationRange,
        location,
        preferredRadius,
      }

      const response = await onboardingDoctor(doctorData)
      if (response.status === 200) {
        setAuthCookie("onboarded", "true")
        router.push("/dashboard")
      } else {
        alert("Failed to complete onboarding. Please try again.")
        console.error("Onboarding failed with status:", response.status)
      }
    } catch (err) {
      console.error("Error during onboarding:", err)
      alert("An error occurred during onboarding. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (isCheckingUser) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Checking your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300/5 to-purple-300/5 rounded-full blur-2xl animate-ping"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] opacity-30"></div>

      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="w-full max-w-2xl mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">Personal Info</span>
            </div>
            <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                {step > 2 ? <CheckCircle2 className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">Professional</span>
            </div>
            <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                <MapPin className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">Location & Docs</span>
            </div>
          </div>
        </div>

        <Card className="w-full max-w-4xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50 transition-all duration-300 hover:shadow-3xl">
          <CardHeader className="text-center pb-8">
            <div className="flex flex-col items-center space-y-6">
              {/* Profile Image Upload */}
              <div className="relative group">
                <div
                  className={`relative w-32 h-32 rounded-full border-4 border-dashed transition-all duration-300 cursor-pointer group-hover:border-blue-400 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-950/50 ${profileImage ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/50' : 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50'}`}
                  onClick={() => document.getElementById("profileImage")?.click()}
                >
                  {profileImage ? (
                    <>
                      <Image
                        src={URL.createObjectURL(profileImage)}
                        alt="Profile Preview"
                        className="h-full w-full object-cover rounded-full"
                        width={128}
                        height={128}
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2 group-hover:text-blue-500 transition-colors" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">Upload Photo</p>
                    </div>
                  )}
                </div>
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                />
              </div>

              <div className="text-center">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Join the Medical Professional Network
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                  Set up your professional profile to start finding great opportunities
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {step === 1 && (
                <div className="space-y-8 animate-in slide-in-from-right-5 duration-300">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Personal Information</h3>
                    <p className="text-gray-600 dark:text-gray-400">Tell us about yourself</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 group space-y-3">
                      <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Full Name
                      </Label>
                      <Input 
                        id="fullName" 
                        placeholder="Dr. John Smith" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        required 
                        className="h-12 border-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                      />
                    </div>
                    
                    <div className="group space-y-3">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <Input 
                        id="email" 
                        type="email" 
                        disabled 
                        value={email} 
                        className="h-12 bg-gray-50 dark:bg-gray-800 border-2"
                      />
                      <p className="text-xs text-gray-500">This email is from your account and cannot be changed</p>
                    </div>
                    
                    <div className="group space-y-3">
                      <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Phone Number
                      </Label>
                      <Input 
                        id="phoneNumber" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                        placeholder="+1 (555) 123-4567" 
                        className="h-12 border-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                      />
                    </div>

                    <div className="group space-y-3">
                      <Label htmlFor="gender" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Gender
                      </Label>
                      <Select onValueChange={setGender} value={gender}>
                        <SelectTrigger className="h-12 border-2 transition-all duration-200 focus:border-blue-500">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="group space-y-3">
                      <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Date of Birth
                      </Label>
                      <Input 
                        id="dateOfBirth" 
                        type="date"
                        value={dateOfBirth} 
                        onChange={(e) => setDateOfBirth(e.target.value)} 
                        required 
                        className="h-12 border-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-in slide-in-from-left-5 duration-300">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Professional Information</h3>
                    <p className="text-gray-600 dark:text-gray-400">Tell us about your medical expertise</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="group space-y-3">
                        <Label htmlFor="specialization" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                          <Stethoscope className="w-4 h-4 mr-2" />
                          Specialization
                        </Label>
                        <Select onValueChange={(value) => setSpecialization(value as DoctorSpecialization)} value={specialization}>
                          <SelectTrigger className="h-12 border-2 transition-all duration-200 focus:border-blue-500">
                            <SelectValue placeholder="Select your specialization" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(DoctorSpecialization).map((spec) => (
                              <SelectItem key={spec} value={spec}>
                                {spec.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="group space-y-3">
                        <Label htmlFor="experience" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
                          <span className="flex items-center">
                            <Award className="w-4 h-4 mr-2" />
                            Years of Experience
                          </span>
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                            {experience} years
                          </span>
                        </Label>
                        <div className="px-3">
                          <Slider 
                            id="experience" 
                            min={0} 
                            max={50} 
                            step={1} 
                            value={[experience]} 
                            onValueChange={(val) => setExperience(val[0])} 
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0 years</span>
                            <span>50+ years</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="group space-y-3">
                        <Label htmlFor="about" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          About You
                        </Label>
                        <Textarea 
                          id="about" 
                          value={about} 
                          onChange={(e) => setAbout(e.target.value)} 
                          placeholder="Tell us about your background, interests, and what drives your passion for medicine..."
                          className="min-h-[120px] border-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 resize-none"
                        />
                      </div>

                      <div className="group space-y-3">
                        <Label htmlFor="additionalInformation" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Additional Information
                        </Label>
                        <Textarea 
                          id="additionalInformation" 
                          value={additionalInformation} 
                          onChange={(e) => setAdditionalInformation(e.target.value)} 
                          placeholder="Any additional information you'd like to share with potential employers..."
                          className="min-h-[100px] border-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Certifications Section */}
                  <div className="space-y-4">
                    <Label htmlFor="certifications" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <Award className="w-4 h-4 mr-2" />
                      Certifications & Qualifications
                    </Label>
                    
                    <div className="flex gap-2">
                      <Input
                        value={currentCertification}
                        onChange={(e) => setCurrentCertification(e.target.value)}
                        placeholder="Enter certification (e.g., MD, Board Certified in Internal Medicine)"
                        className="flex-1 h-12 border-2 transition-all duration-200 focus:border-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                      />
                      <Button 
                        type="button" 
                        onClick={addCertification}
                        className="h-12 px-6"
                      >
                        Add
                      </Button>
                    </div>

                    {certifications.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {certifications.map((cert, index) => (
                          <div key={index} className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-full text-sm">
                            <span>{cert}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCertification(index)}
                              className="h-auto p-0 hover:bg-transparent"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-in slide-in-from-right-5 duration-300">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Location & Documents</h3>
                    <p className="text-gray-600 dark:text-gray-400">Where do you want to work and verification documents</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="group space-y-3">
                        <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Current Address
                        </Label>
                        <Input 
                          id="address" 
                          value={address} 
                          onChange={(e) => setAddress(e.target.value)} 
                          placeholder="123 Main St, City, State, Country" 
                          required 
                          className="h-12 border-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                        />
                      </div>

                      <div className="group space-y-3">
                        <Label htmlFor="preferredRadius" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            Preferred Work Radius
                          </span>
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                            {preferredRadius} km
                          </span>
                        </Label>
                        <div className="px-3">
                          <Slider 
                            id="preferredRadius" 
                            min={1} 
                            max={100} 
                            step={1} 
                            value={[preferredRadius]} 
                            onValueChange={(val) => setPreferredRadius(val[0])} 
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>1 km</span>
                            <span>100 km</span>
                          </div>
                        </div>
                      </div>

                      <div className="group space-y-3">
                        <Label htmlFor="locationRange" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            Maximum Travel Distance
                          </span>
                          <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                            {locationRange} km
                          </span>
                        </Label>
                        <div className="px-3">
                          <Slider 
                            id="locationRange" 
                            min={1} 
                            max={200} 
                            step={1} 
                            value={[locationRange]} 
                            onValueChange={(val) => setLocationRange(val[0])} 
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>1 km</span>
                            <span>200 km</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="group space-y-3">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Set Your Location
                        </Label>
                        <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                          <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                            <OnboardingMapSection
                              clinicAddress={address}
                              setClinicAddress={setAddress}
                              clinicLocation={location}
                              setClinicLocation={setLocation}
                              mapCenter={mapCenter}
                              setMapCenter={setMapCenter}
                            />
                          </APIProvider>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document Upload Section */}
                  <div className="space-y-4">
                    <Label htmlFor="documents" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Professional Documents (Optional)
                    </Label>
                    
                    <div 
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/50 transition-all duration-300 cursor-pointer"
                      onClick={() => document.getElementById("documents")?.click()}
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Upload medical license, certifications, resume</p>
                      <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB each</p>
                      <Input 
                        id="documents" 
                        type="file" 
                        multiple 
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setDocuments(e.target.files ? Array.from(e.target.files) : [])} 
                        className="hidden"
                      />
                    </div>

                    {documents.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                        {documents.map((doc, index) => (
                          <div key={index} className="relative group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                            {doc.type.startsWith("image/") ? (
                              <Image 
                                src={URL.createObjectURL(doc)} 
                                alt="Document" 
                                className="w-full h-24 object-cover" 
                                width={128} 
                                height={96} 
                              />
                            ) : (
                              <div className="w-full h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-gray-500" />
                              </div>
                            )}
                            <div className="p-2">
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={doc.name}>
                                {doc.name}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onClick={() => setDocuments(documents.filter((_, i) => i !== index))}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
                {step > 1 ? (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePrev}
                    className="px-6 py-3 border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    Previous
                  </Button>
                ) : (
                  <div></div>
                )}
                
                {step < 3 ? (
                  <Button 
                    type="button" 
                    onClick={handleNext}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating your profile...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Complete Profile
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}