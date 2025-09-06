import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";
import { getTokenExpirationTime } from "./jwt-utils";
import { InputValidator } from "./validation";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:4000/api";

declare module "next-auth" {
  interface User {
    accessTokenExpires?: number;
    accessToken?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("И-мэйл хаяг болон нууц үг шаардлагатай");
        }

        // OWASP Input validation
        const emailValidation = InputValidator.validateEmail(credentials.email);
        if (!emailValidation.isValid) {
          throw new Error(
            `И-мэйл алдаатай: ${emailValidation.errors.join(", ")}`
          );
        }

        const passwordValidation = InputValidator.validatePassword(
          credentials.password
        );
        if (!passwordValidation.isValid) {
          throw new Error(
            `Нууц үг алдаатай: ${passwordValidation.errors.join(", ")}`
          );
        }

        try {
          // 🔐 Password-г console log дээр харуулахгүй
          console.log("🔐 Attempting login for user:", credentials.email);

          const loginData = {
            email: credentials.email.toLowerCase().trim(),
            password: credentials.password,
          };

          const response = await axios.post(
            `${API_BASE_URL}/auth/login`,
            loginData,
            {
              timeout: 10000, // 10 seconds timeout
              headers: {
                "Content-Type": "application/json",
                "User-Agent": "NextAuth-Client/1.0",
                "X-Requested-With": "XMLHttpRequest",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                // 🔐 Password request marking
                "X-Auth-Request": "credentials-login",
              },
            }
          );

          // 🔐 Clear password reference immediately
          (loginData as any).password = "";
          delete (loginData as any).password;

          console.log("Login response status:", response.status);
          const { data } = response.data;
          const { user, accessToken } = data;

          if (user && accessToken) {
            console.log("✅ Login successful for user:", user.email);

            const tokenExpiration = getTokenExpirationTime(accessToken);

            return {
              id: user.id.toString(),
              email: user.email,
              name: `${user.firstname} ${user.lastname}`,
              firstName: user.firstname,
              lastName: user.lastname,
              role: user.role?.name || "user",
              accessToken: accessToken,
              accessTokenExpires: tokenExpiration ?? undefined,
            };
          }

          console.log("Invalid response format from API");
          return null;
        } catch (error: any) {
          console.error("🔐 Authentication error:", error.message);

          // NIST Error handling - алдааны мэдээлэл хязгаарлах
          if (error.response?.status === 401) {
            throw new Error("И-мэйл эсвэл нууц үг буруу байна");
          } else if (error.response?.status === 429) {
            throw new Error(
              "Хэт олон оролдлого. 15 минутын дараа дахин оролдоно уу"
            );
          } else if (error.code === "ECONNREFUSED") {
            throw new Error(
              "Backend сервер ажиллахгүй байна. localhost:4000 дээр Node.js сервер ажиллаж байгаа эсэхийг шалгана уу."
            );
          } else {
            throw new Error("Системийн алдаа гарлаа");
          }
        }

        return null;
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        return {
          ...token,
          accessToken: user.accessToken,
          accessTokenExpires: user.accessTokenExpires,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        };
      }

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (token.accessTokenExpires && now > token.accessTokenExpires) {
        console.log("🔐 Token expired, forcing re-authentication");
        return { ...token, error: "TokenExpired" };
      }

      return token;
    },

    async session({ session, token }) {
      if (token.error === "TokenExpired") {
        return {
          ...session,
          error: "TokenExpired",
        };
      }

      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          firstName: token.firstName,
          lastName: token.lastName,
          role: token.role,
        },
        accessToken: token.accessToken,
      };
    },

    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Register or login with Google
          const response = await axios.post(`${API_BASE_URL}/auth/google`, {
            email: user.email,
            name: user.name,
            googleId: account.providerAccountId,
            picture: user.image,
          });

          const { data } = response.data;
          if (data?.user) {
            // Update user object with backend data
            user.id = data.user.id.toString();
            user.firstName = data.user.firstname;
            user.lastName = data.user.lastname;
            user.role = data.user.role?.name || "user";
            user.accessToken = data.accessToken;
            user.accessTokenExpires =
              getTokenExpirationTime(data.accessToken) ?? undefined;
          }
        } catch (error) {
          console.error("Google login error:", error);
          return false;
        }
      }

      return true;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};
