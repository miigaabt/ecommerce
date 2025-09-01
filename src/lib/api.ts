import axios from "axios";
import { getSession, signOut } from "next-auth/react";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
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
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log("Token expired or invalid, signing out user");

      // Show notification to user
      if (typeof window !== "undefined") {
        toast.error("Таны нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.", {
          duration: 5000,
          id: "session-expired", // Prevent duplicate toasts
        });
      }

      // Sign out the user automatically
      await signOut({
        callbackUrl: "/auth/login",
        redirect: true,
      });

      return Promise.reject(new Error("Session expired"));
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
