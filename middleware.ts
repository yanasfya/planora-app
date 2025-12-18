import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Note: We're using a simple middleware here instead of NextAuth's auth middleware
// because the MongoDB adapter is not compatible with Edge runtime.
//
// The actual authentication check happens in the dashboard page itself,
// which redirects unauthenticated users to the sign-in page.
//
// This middleware serves as a placeholder for any future edge-compatible
// route protection or redirects you may need.

export function middleware(request: NextRequest) {
  // Allow all requests to pass through
  // Authentication is handled by individual pages using the auth() function
  return NextResponse.next();
}

export const config = {
  // Matcher is empty - no routes are being intercepted by middleware
  // This effectively disables the middleware while keeping the file for future use
  matcher: [],
};
