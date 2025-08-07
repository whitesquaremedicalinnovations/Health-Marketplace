import { deleteAuthCookie } from "@/lib/set-auth-cookie";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    await deleteAuthCookie("onboarded")
    return NextResponse.redirect(new URL("/sign-in", request.url))
}