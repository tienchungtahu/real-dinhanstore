import createMiddleware from "next-intl/middleware";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const pathname = request.nextUrl.pathname;

  // Skip for API routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Admin routes - just pass through, auth check happens in layout
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Handle intl for all other routes
  return intlMiddleware(request);
});

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
