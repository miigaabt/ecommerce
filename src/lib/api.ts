import axios from "axios";
import axiosRetry from "axios-retry";
import { getSession, signOut } from "next-auth/react";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Configure retry mechanism
axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors and 5xx server errors
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response?.status !== undefined && error.response.status >= 500)
    );
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();

    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      if (typeof window !== "undefined") {
        toast.error("Сүлжээний алдаа. Интернет холболтоо шалгана уу.", {
          duration: 5000,
          id: "network-error",
        });
      }
      return Promise.reject(new Error("Network error"));
    }

    const { status } = error.response;

    switch (status) {
      case 401:
        // Token expired or invalid
        console.log("Token expired or invalid, signing out user");

        if (typeof window !== "undefined") {
          toast.error(
            "Таны нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.",
            {
              duration: 5000,
              id: "session-expired",
            }
          );
        }

        await signOut({
          callbackUrl: "/auth/login",
          redirect: true,
        });

        return Promise.reject(new Error("Session expired"));

      case 403:
        console.error("Access forbidden");
        if (typeof window !== "undefined") {
          toast.error("Танд энэ үйлдлийг хийх эрх байхгүй байна.", {
            duration: 5000,
            id: "access-forbidden",
          });
        }
        break;

      case 404:
        console.error("Resource not found");
        if (typeof window !== "undefined") {
          toast.error("Хүссэн мэдээлэл олдсонгүй.", {
            duration: 3000,
            id: "not-found",
          });
        }
        break;

      case 429:
        console.error("Too many requests");
        if (typeof window !== "undefined") {
          toast.error("Хэт олон хүсэлт илгээсэн байна. Түр хүлээнэ үү.", {
            duration: 5000,
            id: "rate-limit",
          });
        }
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        console.error("Server error:", status);
        if (typeof window !== "undefined") {
          toast.error("Серверийн алдаа гарлаа. Түр хүлээнэ үү.", {
            duration: 5000,
            id: "server-error",
          });
        }
        break;

      default:
        console.error("API error:", error.response.data);
        if (typeof window !== "undefined") {
          const message = error.response.data?.message || "Алдаа гарлаа";
          toast.error(message, {
            duration: 3000,
            id: "api-error",
          });
        }
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    // Convert to backend format
    const backendData = {
      firstname: userData.firstName,
      lastname: userData.lastName,
      email: userData.email,
      password: userData.password,
      password_confirmation: userData.password,
      phone: userData.phone || "",
    };

    const response = await apiClient.post("/auth/register", backendData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get("/auth/profile");
    return response.data;
  },

  updateProfile: async (userData: any) => {
    const response = await apiClient.put("/auth/profile", userData);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await apiClient.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  },
};

export default apiClient;
