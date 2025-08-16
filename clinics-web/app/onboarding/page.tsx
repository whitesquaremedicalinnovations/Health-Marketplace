"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { getUser, onboardingClinic } from "@/lib/utils"
import { setAuthCookie } from "@/lib/set-auth-cookie"
import { Loader2, Trash2, Upload, Camera, MapPin, Phone, User, Building, FileText, CheckCircle2 } from "lucide-react"
import { APIProvider } from "@vis.gl/react-google-maps"
import OnboardingMapSection from "@/components/onboarding-map-section"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import { axiosInstance } from "@/lib/axios"
import PaymentButton from "@/components/payment-button"

export default function Onboarding() {
  const { user } = useUser()
  const router = useRouter()
  const [step, setStep] = useState(1)

  const [ownerFirstName, setOwnerFirstName] = useState("")
  const [ownerLastName, setOwnerLastName] = useState("")
  const [ownerEmail, setOwnerEmail] = useState("")
  const [ownerPhoneNumber, setOwnerPhoneNumber] = useState("")

  const [clinicName, setClinicName] = useState("")
  const [clinicAddress, setClinicAddress] = useState("")
  const [clinicPhoneNumber, setClinicPhoneNumber] = useState("")
  const [clinicAdditionalDetails, setClinicAdditionalDetails] = useState("")
  const [clinicDocuments, setClinicDocuments] = useState<File[]>([])
  const [clinicProfileImage, setClinicProfileImage] = useState<File | null>(null)
  const [clinicLocation, setClinicLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [preferredRadius, setPreferredRadius] = useState(5)
  const [mapCenter, setMapCenter] = useState({ lat: 51.5072, lng: -0.1276 })

  const [loading, setLoading] = useState(false)
  const [isCheckingUser, setIsCheckingUser] = useState(true)

  const [onboardingAmount, setOnboardingAmount] = useState(0)
  const [hasEmailPaid, setHasEmailPaid] = useState(false)

  const handleNext = () => setStep((s) => s + 1)
  const handlePrev = () => setStep((s) => s - 1)

  useEffect(() => {
    const fetchOnboardingAmount = async () => {
      const res = await axiosInstance.get("/api/admin/get-onboarding-fee")
      const data = res.data
      setOnboardingAmount(data.onboardingFee.fee)
    }

    const checkEmailPayment = async () => {
      const res = await axiosInstance.get("/api/payments/get-email-payment", {
        params: {
          email: ownerEmail,
          userType: "CLINIC",
        }
      })
      const data = res.data
      setHasEmailPaid(data.data.payment !== null)
    }
    fetchOnboardingAmount()
    checkEmailPayment()
  }, [ownerEmail])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsCheckingUser(true)
        const userData = await getUser(user?.id ?? "")
        console.log("userData", userData)
        if (userData.status === 200) {
          setAuthCookie("onboarded", "true")
          router.push("/dashboard")
        } else {
          setIsCheckingUser(false)
          setOwnerFirstName(user?.firstName ?? "")
          setOwnerLastName(user?.lastName ?? "")
          setOwnerEmail(user?.emailAddresses[0]?.emailAddress ?? "")
          setOwnerPhoneNumber(user?.phoneNumbers[0]?.phoneNumber ?? "")
        }
      } catch (error) {
        console.log("Error fetching user data:", error)
        setIsCheckingUser(false)
        setOwnerFirstName(user?.firstName ?? "")
        setOwnerLastName(user?.lastName ?? "")
        setOwnerEmail(user?.emailAddresses[0]?.emailAddress ?? "")
        setOwnerPhoneNumber(user?.phoneNumbers[0]?.phoneNumber ?? "")
      }
    }

    if (user?.id) {
      fetchUserData()
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    if (clinicProfileImage) formData.append("clinicProfileImage", clinicProfileImage)
    clinicDocuments.forEach((doc) => formData.append("clinicDocuments", doc))

    let profileImage = null
    let documents: string[] = []

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      profileImage = data.uploaded.find((item: { fieldName: string; url: string; }) => item.fieldName === "clinicProfileImage")?.url
      documents = data.uploaded.filter((item: { fieldName: string; url: string; }) => item.fieldName === "clinicDocuments").map((item: { url: string; }) => item.url)
    } catch (err) {
      console.log("Upload failed", err)
      alert("Upload failed")
      setLoading(false)
      return;
    }

    try {
      const data = {
        clinicId: user?.id ?? "",
        ownerName: `${ownerFirstName} ${ownerLastName}`,
        ownerPhoneNumber,
        email: ownerEmail,
        clinicName,
        clinicAddress,
        clinicPhoneNumber,
        clinicAdditionalDetails,
        clinicProfileImage: profileImage ?? null,
        documents,
        location: clinicLocation,
        preferredRadius,
      }

      const response = await onboardingClinic(data)
      if (response.status === 200) {
        router.push("/dashboard")
      } else {
        alert("Failed to onboard clinic. Please try again.")
        console.log("Onboarding failed with status:", response.status)
      }
    } catch (err) {
      console.log("Error during onboarding:", err)
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
              <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">Owner Info</span>
            </div>
            <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                <Building className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">Clinic Details</span>
            </div>
          </div>
        </div>

        <Card className="w-full max-w-4xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50 transition-all duration-300 hover:shadow-3xl">
          <CardHeader className="text-center pb-8">
            <div className="flex flex-col items-center space-y-6">
              {/* Profile Image Upload */}
              <div className="relative group">
                <div
                  className={`relative w-32 h-32 rounded-full border-4 border-dashed transition-all duration-300 cursor-pointer group-hover:border-blue-400 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-950/50 ${clinicProfileImage ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/50' : 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50'}`}
                  onClick={() => document.getElementById("clinicProfileImage")?.click()}
                >
                  {clinicProfileImage ? (
                    <>
                      <Image
                        src={URL.createObjectURL(clinicProfileImage)}
                        alt="Clinic Preview"
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
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">Upload Logo</p>
                    </div>
                  )}
                </div>
                <input
                  id="clinicProfileImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setClinicProfileImage(e.target.files?.[0] || null)}
                />
              </div>

              <div className="text-center">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Welcome to HealthCare Platform
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                  Let&apos;s set up your clinic profile in just 2 simple steps
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {step === 1 && (
                <div className="space-y-8 animate-in slide-in-from-right-5 duration-300">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Owner Information</h3>
                    <p className="text-gray-600 dark:text-gray-400">Tell us about yourself</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group space-y-3">
                      <Label htmlFor="ownerFirstName" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        First Name
                      </Label>
                      <Input 
                        id="ownerFirstName" 
                        placeholder="John" 
                        value={ownerFirstName} 
                        onChange={(e) => setOwnerFirstName(e.target.value)} 
                        required 
                        className="h-12 border-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                      />
                    </div>
                    
                    <div className="group space-y-3">
                      <Label htmlFor="ownerLastName" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Last Name
                      </Label>
                      <Input 
                        id="ownerLastName" 
                        placeholder="Doe" 
                        value={ownerLastName} 
                        onChange={(e) => setOwnerLastName(e.target.value)} 
                        required 
                        className="h-12 border-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                      />
                    </div>
                    
                    <div className="md:col-span-2 group space-y-3">
                      <Label htmlFor="ownerEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <Input 
                        id="ownerEmail" 
                        type="email" 
                        disabled 
                        value={ownerEmail} 
                        className="h-12 bg-gray-50 dark:bg-gray-800 border-2"
                      />
                      <p className="text-xs text-gray-500">This email is from your account and cannot be changed</p>
                    </div>
                    
                    <div className="md:col-span-2 group space-y-3">
                      <Label htmlFor="ownerPhoneNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Phone Number
                      </Label>
                      <Input 
                        id="ownerPhoneNumber" 
                        value={ownerPhoneNumber} 
                        onChange={(e) => setOwnerPhoneNumber(e.target.value)} 
                        placeholder="+1 (555) 123-4567" 
                        className="h-12 border-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-in slide-in-from-left-5 duration-300">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Clinic Details</h3>
                    <p className="text-gray-600 dark:text-gray-400">Setup your clinic information</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="group space-y-3">
                        <Label htmlFor="clinicName" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                          <Building className="w-4 h-4 mr-2" />
                          Clinic Name
                        </Label>
                        <Input 
                          id="clinicName" 
                          value={clinicName} 
                          onChange={(e) => setClinicName(e.target.value)} 
                          placeholder="HealthCare Plus Medical Center" 
                          required 
                          className="h-12 border-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                        />
                      </div>

                      <div className="group space-y-3">
                        <Label htmlFor="clinicPhoneNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          Clinic Phone Number
                        </Label>
                        <Input 
                          id="clinicPhoneNumber" 
                          value={clinicPhoneNumber} 
                          onChange={(e) => setClinicPhoneNumber(e.target.value)} 
                          placeholder="+1 (555) 987-6543" 
                          className="h-12 border-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                        />
                      </div>

                      <div className="group space-y-3">
                        <Label htmlFor="preferredRadius" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            Service Radius
                          </span>
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                            {preferredRadius} km
                          </span>
                        </Label>
                        <div className="px-3">
                          <Slider 
                            id="preferredRadius" 
                            min={1} 
                            max={50} 
                            step={1} 
                            value={[preferredRadius]} 
                            onValueChange={(val) => setPreferredRadius(val[0])} 
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>1 km</span>
                            <span>50 km</span>
                          </div>
                        </div>
                      </div>

                      <div className="group space-y-3">
                        <Label htmlFor="clinicAdditionalDetails" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Additional Details
                        </Label>
                        <Textarea 
                          id="clinicAdditionalDetails" 
                          value={clinicAdditionalDetails} 
                          onChange={(e) => setClinicAdditionalDetails(e.target.value)} 
                          placeholder="Describe your services, timings, specializations, or any other important information..."
                          className="min-h-[100px] border-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="group space-y-3">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Clinic Location
                        </Label>
                        <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                          <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                            <OnboardingMapSection
                              clinicAddress={clinicAddress}
                              setClinicAddress={setClinicAddress}
                              clinicLocation={clinicLocation}
                              setClinicLocation={setClinicLocation}
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
                    <Label htmlFor="clinicDocuments" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Clinic Documents & Certifications
                    </Label>
                    
                    <div 
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/50 transition-all duration-300 cursor-pointer"
                      onClick={() => document.getElementById("clinicDocuments")?.click()}
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB each</p>
                      <Input 
                        id="clinicDocuments" 
                        type="file" 
                        multiple 
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setClinicDocuments(e.target.files ? Array.from(e.target.files) : [])} 
                        className="hidden"
                      />
                    </div>

                    {clinicDocuments.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                        {clinicDocuments.map((doc, index) => (
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
                              onClick={() => setClinicDocuments(clinicDocuments.filter((_, i) => i !== index))}
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
                
                {step < 2 ? (
                  <Button 
                    type="button" 
                    onClick={handleNext}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Continue
                  </Button>
                ) : (
                  <>
                    {hasEmailPaid ? (
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Setting up your clinic...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Complete Setup
                          </>
                        )}
                      </Button>
                    ):(
                      <PaymentButton amount={onboardingAmount} currency="INR" receipt="Onboarding Fee" name={clinicName} email={ownerEmail} phone={ownerPhoneNumber} userType="CLINIC" setHasEmailPaid={setHasEmailPaid}/>
                    )}
                  </>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}