import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isDev = process.env.NODE_ENV === "development";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    // Add security headers
    const response = NextResponse.next();

    if (isDev) {
      // Development - зөөлөн CSP
      response.headers.set(
        "Content-Security-Policy",
        [
          "default-src 'self'",
          `connect-src 'self' ${apiUrl} ws://localhost:* wss://localhost:*`,
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob:",
          "font-src 'self' data:",
          "frame-src 'self'",
        ].join("; ")
      );
    } else {
      // Production - хатуу CSP
      response.headers.set(
        "Content-Security-Policy",
        [
          "default-src 'self'",
          "connect-src 'self' https:",
          "script-src 'self'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https:",
          "font-src 'self'",
          "frame-src 'none'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; ")
      );
    }

    // Бусад security headers
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes - нэвтрэх шаардлагагүй
        if (
          pathname.startsWith("/auth/") ||
          pathname === "/" ||
          pathname.startsWith("/api/auth/") ||
          pathname.startsWith("/_next/") ||
          pathname.startsWith("/favicon")
        ) {
          return true;
        }

        // Admin routes - admin эрхтэй байх ёстой
        if (pathname.startsWith("/admin")) {
          return token?.role === "admin";
        }

        // Protected routes - нэвтэрсэн байх ёстой
        if (
          pathname.startsWith("/dashboard") ||
          pathname.startsWith("/profile") ||
          pathname.startsWith("/orders")
        ) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Бүх request path-д хамаарна, зөвхөн дараахыг оруулахгүй:
     * 1. /_next/static (static files)
     * 2. /_next/image (image optimization files)
     * 3. /favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
