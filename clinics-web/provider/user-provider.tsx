'use client'

import { useUser } from "@clerk/nextjs"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { getUser } from "@/lib/utils"

type UserDataType = any // Replace `any` with your actual user type if possible

interface UserContextType {
  userData: UserDataType | null
  loading: boolean
  error: string | null
  refetchUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | null>(null)

export function useUserContext() {
  const context = useContext(UserContext)
  if (!context) throw new Error("useUserContext must be used within UserProvider")
  return context
}

export default function UserProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const [userData, setUserData] = useState<UserDataType | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserData = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const response = await getUser(user.id)
      if (response.status === 200) {
        setUserData(response.data)
      }else if(response.status === 404){
        setUserData(null)
      }else {
        setError("Failed to fetch user data")
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  const value: UserContextType = {
    userData,
    loading,
    error,
    refetchUser: fetchUserData,
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
