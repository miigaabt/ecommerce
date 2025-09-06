import axios from "axios";
import axiosRetry from "axios-retry";
import { getSession, signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { InputValidator } from "./validation";

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

// Request interceptor - Password нууцлах болон auth token нэмэх
apiClient.interceptors.request.use(
  async (config) => {
    // 🔐 Password-тай request-үүдийг тусгайлан боловсруулах
    if (config.data && typeof config.data === "object") {
      const sensitiveFields = [
        "password",
        "password_confirmation",
        "newPassword",
        "oldPassword",
      ];
      const hasSensitiveData = sensitiveFields.some(
        (field) => config.data[field]
      );

      if (hasSensitiveData) {
        // Console log дээр password харуулахгүй
        const safeData = { ...config.data };
        sensitiveFields.forEach((field) => {
          if (safeData[field]) {
            safeData[field] = "[REDACTED]";
          }
        });
        console.log("🔐 API Request (sensitive data hidden):", {
          url: config.url,
          method: config.method,
          data: safeData,
        });
      }
    }

    // Add auth token if available
    if (typeof window !== "undefined") {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor сайжруулах
apiClient.interceptors.response.use(
  (response) => {
    // Success response дээр password хасах
    if (response.data && typeof response.data === "object") {
      const sensitiveFields = ["password", "password_confirmation"];
      sensitiveFields.forEach((field) => {
        if (response.data[field]) {
          delete response.data[field];
        }
      });
    }
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    // Rate limiting хэрэгжүүлэх
    if (!originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }

    switch (status) {
      case 401:
        console.error("Unauthorized access");
        if (typeof window !== "undefined" && !originalRequest._retry) {
          originalRequest._retry = true;
          await signOut({ callbackUrl: "/auth/login" });
          toast.error(
            "Таны нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.",
            {
              duration: 5000,
              id: "session-expired",
            }
          );
        }
        break;

      case 403:
        if (typeof window !== "undefined") {
          toast.error("Таны эрх хүрэлцэхгүй байна.", {
            duration: 3000,
            id: "forbidden",
          });
        }
        break;

      case 404:
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
        if (typeof window !== "undefined") {
          toast.error("Серверийн алдаа гарлаа. Түр хүлээнэ үү.", {
            duration: 5000,
            id: "server-error",
          });
        }
        break;

      default:
        if (typeof window !== "undefined" && status >= 400) {
          let errorMessage = "Тодорхойгүй алдаа гарлаа.";
          if (error.response?.data?.errorCode === "VALIDATION_ERROR") {
            if (error.response?.data?.errors.length > 0) {
              errorMessage = error.response?.data?.errors[0].message;
            }
          }
          toast.error(errorMessage, {
            duration: 3000,
            id: "unknown-error",
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
    // Input validation
    const emailValidation = InputValidator.validateEmail(userData.email);
    if (!emailValidation.isValid) {
      throw new Error(`И-мэйл алдаатай: ${emailValidation.errors.join(", ")}`);
    }

    const passwordValidation = InputValidator.validatePassword(
      userData.password
    );
    if (!passwordValidation.isValid) {
      throw new Error(
        `Нууц үг алдаатай: ${passwordValidation.errors.join(", ")}`
      );
    }

    // Convert to backend format
    const backendData = {
      firstname: InputValidator.sanitizeInput(userData.firstName.trim()),
      lastname: InputValidator.sanitizeInput(userData.lastName.trim()),
      email: InputValidator.sanitizeInput(userData.email.toLowerCase().trim()),
      password: userData.password, // Password-г sanitize хийхгүй!
      password_confirmation: userData.password,
      phone: userData.phone
        ? InputValidator.sanitizeInput(userData.phone.trim())
        : "",
    };

    console.log("🔐 Registering user with secure data transmission");

    try {
      const response = await apiClient.post("/auth/register", backendData, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          // 🔐 Password request marking
          "X-Auth-Request": "register",
        },
      });

      // 🔐 Immediately clear passwords from memory
      (backendData as any).password = "";
      (backendData as any).password_confirmation = "";
      delete (backendData as any).password;
      delete (backendData as any).password_confirmation;

      console.log("✅ Registration successful");
      return response.data;
    } catch (error) {
      // 🔐 Clear passwords even on error
      (backendData as any).password = "";
      (backendData as any).password_confirmation = "";
      delete (backendData as any).password;
      delete (backendData as any).password_confirmation;

      console.error("❌ Registration failed:", error);
      throw error;
    }
  },

  login: async (credentials: { email: string; password: string }) => {
    // Input validation
    const emailValidation = InputValidator.validateEmail(credentials.email);
    if (!emailValidation.isValid) {
      throw new Error(`И-мэйл алдаатай: ${emailValidation.errors.join(", ")}`);
    }

    const loginData = {
      email: InputValidator.sanitizeInput(
        credentials.email.toLowerCase().trim()
      ),
      password: credentials.password, // Password-г sanitize хийхгүй!
    };

    console.log("🔐 Authenticating user securely");

    try {
      const response = await apiClient.post("/auth/login", loginData, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          // 🔐 Password request marking
          "X-Auth-Request": "login",
        },
      });

      // 🔐 Immediately clear password from memory
      (loginData as any).password = "";
      delete (loginData as any).password;

      console.log("✅ Login successful");
      return response.data;
    } catch (error) {
      // 🔐 Clear password even on error
      (loginData as any).password = "";
      delete (loginData as any).password;

      console.error("❌ Login failed:", error);
      throw error;
    }
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
