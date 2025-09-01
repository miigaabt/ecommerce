// Session management utilities
import { getSession } from "next-auth/react";
import { toast } from "react-hot-toast";

export interface SessionInfo {
  isValid: boolean;
  user: any;
  expiresAt: number;
  timeRemaining: number;
}

export class SessionManager {
  private static instance: SessionManager;
  private checkInterval: NodeJS.Timeout | null = null;
  private warningShown = false;
  private readonly WARNING_TIME = 5 * 60 * 1000; // 5 минут
  private readonly CHECK_INTERVAL = 30 * 1000; // 30 секунд

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  async getSessionInfo(): Promise<SessionInfo | null> {
    try {
      const session = await getSession();

      if (!session?.expires) {
        return null;
      }

      const expiresAt = new Date(session.expires).getTime();
      const now = Date.now();
      const timeRemaining = expiresAt - now;

      return {
        isValid: timeRemaining > 0,
        user: session.user,
        expiresAt,
        timeRemaining,
      };
    } catch (error) {
      console.error("Failed to get session info:", error);
      return null;
    }
  }

  startSessionMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      const sessionInfo = await this.getSessionInfo();

      if (!sessionInfo) {
        this.stopSessionMonitoring();
        return;
      }

      if (!sessionInfo.isValid) {
        this.handleSessionExpired();
        return;
      }

      // Show warning if session expires soon
      if (
        sessionInfo.timeRemaining <= this.WARNING_TIME &&
        !this.warningShown
      ) {
        this.showExpirationWarning(sessionInfo.timeRemaining);
      }
    }, this.CHECK_INTERVAL);
  }

  stopSessionMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.warningShown = false;
  }

  private showExpirationWarning(timeRemaining: number) {
    this.warningShown = true;
    const minutes = Math.ceil(timeRemaining / (60 * 1000));

    toast.error(
      `Сессийн хугацаа дууссан. ${minutes} минутын дараа автоматаар гарах болно.`,
      {
        duration: 30000,
        position: "top-center",
      }
    );
  }

  private handleSessionExpired() {
    this.stopSessionMonitoring();

    toast.error("Сессийн хугацаа дууслаа. Дахин нэвтэрнэ үү.", {
      duration: 5000,
      position: "top-center",
    });

    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = "/auth/login";
    }, 2000);
  }

  private async refreshSession() {
    try {
      // Trigger a session refresh by making a request to the session endpoint
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Сессийн хугацааг сунгалаа");
        this.warningShown = false;
      } else {
        throw new Error("Failed to refresh session");
      }
    } catch (error) {
      console.error("Failed to refresh session:", error);
      toast.error("Сессийг сунгахад алдаа гарлаа");
      this.handleSessionExpired();
    }
  }

  // Utility to check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const sessionInfo = await this.getSessionInfo();
    return sessionInfo?.isValid ?? false;
  }

  // Get remaining session time in a human-readable format
  async getTimeRemaining(): Promise<string | null> {
    const sessionInfo = await this.getSessionInfo();

    if (!sessionInfo?.isValid) {
      return null;
    }

    const minutes = Math.floor(sessionInfo.timeRemaining / (60 * 1000));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours} цаг ${minutes % 60} минут`;
    }

    return `${minutes} минут`;
  }
}
