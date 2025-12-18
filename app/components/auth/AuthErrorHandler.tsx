"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

export function AuthErrorHandler() {
  const { data: session } = useSession();

  useEffect(() => {
    // If session has token error, automatically sign out and redirect to login
    if (session?.error === "RefreshAccessTokenError") {
      console.error("[Auth] Token refresh failed - signing out user");
      
      // Show toast/notification (optional)
      // toast.error("Your session expired. Please sign in again.");
      
      // Auto sign out
      signOut({ callbackUrl: "/" });
    }
  }, [session]);

  return null;
}