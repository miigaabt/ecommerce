"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { SessionManager } from "@/lib/session-manager";
import { useSession } from "next-auth/react";

interface Props {
  children: ReactNode;
}

function SessionMonitor() {
  const { data: session } = useSession();

  useEffect(() => {
    const sessionManager = SessionManager.getInstance();

    if (session) {
      sessionManager.startSessionMonitoring();
    } else {
      sessionManager.stopSessionMonitoring();
    }

    return () => {
      sessionManager.stopSessionMonitoring();
    };
  }, [session]);

  return null;
}

export default function Providers({ children }: Props) {
  return (
    <SessionProvider>
      <SessionMonitor />
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#4ade80",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </SessionProvider>
  );
}
