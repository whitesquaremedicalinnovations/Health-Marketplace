"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDay, Modifiers } from "react-day-picker"
import { useUserContext } from "@/provider/user-provider"
import { axiosInstance } from "@/lib/axios"
import CalendarMap from "./calender-map"
import { APIProvider } from "@vis.gl/react-google-maps"

type Meeting = {
  id: string;
  title: string;
  clinic: string;
  jobDate: string | null;
  jobTime: string | null;
  jobLocation: string;
  jobLatitude: number | null;
  jobLongitude: number | null;
};

type CalendarSize = 'sm' | 'lg';

interface MeetingCalendarProps {
  size?: CalendarSize;
}

// Helper function to format time from HH:MM to 12-hour format
const formatTime = (time: string | null): string | null => {
  if (!time) return null;
  
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch (error) {
    console.log(error)
    return time; // Return original if parsing fails
  }
};

const dummymeetings: Meeting[] = [
  { 
    id: "1", 
    title: "Client Meeting", 
    clinic: "City Clinic",
    jobDate: "August 21, 2025",
    jobTime: "10:00 AM",
    jobLocation: "123 Main St, City",
    jobLatitude: 40.7128,
    jobLongitude: -74.0060,
  },
  { 
    id: "2", 
    title: "Team Sync", 
    clinic: "Medical Center",
    jobDate: "August 21, 2025",
    jobTime: "2:00 PM",
    jobLocation: "456 Oak Ave, City",
    jobLatitude: 40.7589,
    jobLongitude: -73.9851,
  },
  { 
    id: "3", 
    title: "Project Review", 
    clinic: "Health Hub",
    jobDate: "August 22, 2025",
    jobTime: "4:00 PM",
    jobLocation: "789 Pine St, City",
    jobLatitude: 40.7505,
    jobLongitude: -73.9934,
  },
  { 
    id: "4", 
    title: "Follow-up Call", 
    clinic: "Wellness Clinic",
    jobDate: "August 23, 2025",
    jobTime: "11:00 AM",
    jobLocation: "321 Elm St, City",
    jobLatitude: 40.7829,
    jobLongitude: -73.9654,
  },
  { 
    id: "5", 
    title: "Consultation", 
    clinic: "Family Medical",
    jobDate: "August 23, 2025",
    jobTime: "3:30 PM",
    jobLocation: "654 Maple Dr, City",
    jobLatitude: 40.7549,
    jobLongitude: -73.9840,
  },
];
console.log("dummymeetings", dummymeetings)

export default function MeetingCalendar({ size = 'sm' }: MeetingCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [meetings, setMeetings] = React.useState<Meeting[]>(dummymeetings)
  const {userData} = useUserContext()
  const [isLoading, setIsLoading] = React.useState(false)

  const fetchMeetings = async()=>{
    try {
      setIsLoading(true)
      const response = await axiosInstance.get(`/api/doctor/get-meetings/${userData?.doctor.id}`)
      if(response.status === 200){
        console.log("meetings", response.data.meetings)
        setMeetings(response.data.meetings)
      }
    } catch (error) {
      console.error("Error fetching meetings:", error)
    }
    finally{
      setIsLoading(false)
    }
  }

  React.useEffect(()=>{
    console.log("user data", userData)
    if(userData){
      fetchMeetings()    
    }
  }, [userData])

  const meetingsByDate = (date: Date) =>
    meetings.filter(m => {
      if (!m.jobDate) return false;
      const meetingDate = new Date(m.jobDate);
      return meetingDate.toDateString() === date.toDateString();
    })

  const selectedMeetings = selectedDate ? meetingsByDate(selectedDate) : []

  // Custom DayButton component to show meeting indicators and titles
  const CustomDayButton = ({ 
    day, 
    modifiers, 
    className, 
    ...props 
  }: { 
    day: CalendarDay; 
    modifiers: Modifiers; 
  } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const dayMeetings = meetingsByDate(day.date)
    const hasMeetings = dayMeetings.length > 0

    return (
      <Button
        variant="ghost"
        size="icon"
        className={`relative ${size === 'lg' ? 'h-20 w-full p-2' : 'h-14 w-full p-1'} ${
          hasMeetings 
            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200' 
            : 'hover:bg-gray-50'
        } ${className || ''} transition-all duration-200 ease-in-out`}
        {...props}
      >
        {!isLoading && (
          <div className="flex flex-col items-center w-full h-full justify-between">
            <span className={`font-semibold ${size === 'lg' ? 'text-base' : 'text-sm'} ${
              hasMeetings ? 'text-blue-700' : 'text-gray-900'
            }`}>
              {day.date.getDate()}
            </span>
            
            {hasMeetings && (
              <div className="flex flex-col items-center w-full space-y-0.5 mt-1">
                {dayMeetings.length} meetings
              </div>
            )}
          </div>
        )}
      </Button>
    )
  }

  return (
    <div className="w-full p-4 md:p-6 flex flex-col items-center bg-gray-50">
      {/* Top Section: Calendar and Jobs */}
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 mb-6">
        {/* Calendar */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                {size === 'sm' ? 'Your Schedule' : 'Meeting Calendar'}
              </h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{
                  hasMeetings: (day) => meetingsByDate(day).length > 0,
                }}
                modifiersClassNames={{
                  hasMeetings: "",
                }}
                components={{
                  DayButton: CustomDayButton,
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Meeting List */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 h-fit">
            <h2 className="font-semibold mb-4 text-lg md:text-xl lg:text-2xl text-center lg:text-left text-gray-800">
              {selectedDate ? (
                <>
                  Appointments On {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </>
              ) : (
                "Select a date to view jobs"
              )}
            </h2>

            {selectedMeetings.length > 0 ? (
              <div className="space-y-3 max-h-96 lg:max-h-[calc(100vh-400px)] overflow-y-auto">
                {selectedMeetings.map(meeting => (
                  <Card key={meeting.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-base md:text-lg lg:text-xl text-gray-800">{meeting.title}</p>
                          <p className="text-blue-600 mt-1 text-sm md:text-base font-medium">{meeting.clinic}</p>
                          {meeting.jobTime && (
                            <div className="flex items-center mt-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                              <p className="text-gray-600 text-sm md:text-base">{formatTime(meeting.jobTime)}</p>
                            </div>
                          )}
                          <div className="flex items-center mt-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                            <p className="text-gray-500 text-xs md:text-sm">{meeting.jobLocation}</p>
                          </div>
                        </div>
                        <div className="text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-xs md:text-sm font-semibold border border-blue-200">
                          Job
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 md:py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-lg md:text-xl font-medium">No jobs scheduled for this day.</p>
                <p className="text-gray-400 mt-2 text-sm md:text-base">Select another date or find new job opportunities.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Map */}
      {size==='lg' && selectedMeetings.length > 0 &&
        <div className="w-full max-w-7xl">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="font-semibold mb-4 text-lg md:text-xl lg:text-2xl text-center text-gray-800">Job Locations</h2>
            <div className="w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden border border-gray-200 shadow-md">
              {selectedMeetings.length > 0 && selectedMeetings.some(meeting => meeting.jobLatitude && meeting.jobLongitude) ? (
                <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
                  <CalendarMap
                    places={selectedMeetings
                      .filter(meeting => meeting.jobLatitude && meeting.jobLongitude)
                      .map(meeting => ({
                        lat: meeting.jobLatitude!,
                        lng: meeting.jobLongitude!,
                        clinicName: meeting.clinic
                      }))}
                    center={{
                      lat: selectedMeetings.find(m => m.jobLatitude)?.jobLatitude || 40.7128,
                      lng: selectedMeetings.find(m => m.jobLongitude)?.jobLongitude || -74.0060
                    }}
                    zoom={12}
                    updateLocation={() => {}} // No-op since we don't need to update locations
                  />
                </APIProvider>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-lg font-medium">No jobs selected</p>
                    <p className="text-gray-400 text-sm mt-2">Select a date with jobs to see locations on the map</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      }
    </div>
  )
}
