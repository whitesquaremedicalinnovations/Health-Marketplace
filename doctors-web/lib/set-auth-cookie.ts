"use server"

import { cookies } from "next/headers"

export const setAuthCookie = async (key: string, value: string) => {
    const cookieStore = await cookies()
    //first check if the cookie is already set
    if(cookieStore.get(key)){
        cookieStore.delete(key)
    }
    cookieStore.set(key, value, {
        httpOnly: true,
        path: "/",
    })
}

export const deleteAuthCookie = async (key: string) => {
    const cookieStore = await cookies()
    cookieStore.delete(key)
}