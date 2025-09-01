"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

export function useAuthGuard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Check if session has expired
    if (session?.error === "RefreshAccessTokenError") {
      console.log("Session expired, signing out user");

      // Show notification
      toast.error("Таны нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.", {
        duration: 5000,
        id: "session-expired-hook",
      });

      signOut({
        callbackUrl: "/auth/login",
        redirect: true,
      });
    }
  }, [session]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Only set up interval if user is logged in
    if (status === "authenticated" && session?.accessToken) {
      // Check session status every 30 seconds for testing
      intervalId = setInterval(async () => {
        try {
          // Make a simple API call to check if token is still valid
          const response = await fetch("/api/auth/validate");

          if (!response.ok) {
            console.log("Session check failed, signing out user");

            // Show notification
            toast.error(
              "Таны нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.",
              {
                duration: 5000,
                id: "session-check-failed",
              }
            );

            await signOut({
              callbackUrl: "/auth/login",
              redirect: true,
            });
          }
        } catch (error) {
          console.error("Session check error:", error);
        }
      }, 30 * 1000); // 30 seconds for testing
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [status, session]);

  return {
    session,
    status,
    isAuthenticated: status === "authenticated" && !session?.error,
    isLoading: status === "loading",
  };
}
