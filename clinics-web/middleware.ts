import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/api/upload',
]) 


export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl.clone()
  const onboarded = req.cookies.get("onboarded")?.value

  if (!isPublicRoute(req)) {
    await auth.protect()
  }else{
    return NextResponse.next()
  }

  
  if (!onboarded && !url.pathname.startsWith("/onboarding")) {
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }

  //check if onboarded and on onboarding page
  if(onboarded && url.pathname.startsWith("/onboarding")){
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }


  const headers = new Headers();
  headers.set("x-current-path", req.nextUrl.pathname);
  return NextResponse.next({ headers });
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
