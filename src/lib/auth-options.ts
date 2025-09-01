import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";
import { getTokenExpirationTime } from "./jwt-utils";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:4000/api";

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

        try {
          console.log("Attempting login to:", `${API_BASE_URL}/auth/login`);

          const response = await axios.post(
            `${API_BASE_URL}/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            },
            {
              timeout: 10000, // 10 seconds timeout
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          console.log("Login response status:", response.status);
          const { data } = response.data;
          const { user, accessToken } = data;

          if (user && accessToken) {
            console.log("Login successful for user:", user.email);
            return {
              id: user.id.toString(),
              email: user.email,
              name: `${user.firstname} ${user.lastname}`,
              firstName: user.firstname,
              lastName: user.lastname,
              role: user.role?.name || "user",
              accessToken: accessToken,
            };
          }

          console.log("Invalid response format from API");
          return null;
        } catch (error: any) {
          console.error("Login API error:", {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: `${API_BASE_URL}/auth/login`,
          });

          // Return more specific error messages
          if (error.code === "ECONNREFUSED") {
            throw new Error(
              "Backend сервер ажиллахгүй байна. localhost:4000 дээр Node.js сервер ажиллаж байгаа эсэхийг шалгана уу."
            );
          }

          if (error.response?.status === 401) {
            throw new Error("И-мэйл хаяг эсвэл нууц үг буруу байна");
          }

          if (error.response?.status === 404) {
            throw new Error(
              "Login API олдсонгүй. Backend API зөв тохируулагдсан эсэхийг шалгана уу."
            );
          }

          throw new Error(
            error.response?.data?.message ||
              error.message ||
              "Нэвтрэхэд алдаа гарлаа"
          );
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        const accessToken = (user as any).accessToken;

        // Extract expiration time from the actual JWT token
        let tokenExpires: number;
        const jwtExpiration = getTokenExpirationTime(accessToken);

        if (jwtExpiration) {
          console.log(
            "Using JWT expiration time:",
            new Date(jwtExpiration * 1000)
          );
          tokenExpires = jwtExpiration;
        } else {
          // Fallback: use current time + 2 minutes for testing
          console.log("Could not extract JWT expiration, using fallback");
          tokenExpires = Math.floor(Date.now() / 1000) + 2 * 60;
        }

        return {
          ...token,
          accessToken: accessToken,
          refreshToken: (user as any).refreshToken,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          accessTokenExpires: tokenExpires,
        };
      }

      // Return previous token if the access token has not expired yet
      const now = Math.floor(Date.now() / 1000);

      if (
        (token.accessTokenExpires as number) &&
        now < (token.accessTokenExpires as number)
      ) {
        return token;
      }

      // Access token has expired, try to update it
      console.log("Access token expired, user needs to re-login");
      return {
        ...token,
        error: "RefreshAccessTokenError",
      };
    },

    async session({ session, token }) {
      // Check if there's an error in the token (like expired)
      if (token.error) {
        console.log("Session error:", token.error);
        return {
          ...session,
          error: token.error,
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
      // Handle Google OAuth sign-in
      if (account?.provider === "google") {
        try {
          // Check if user exists in your backend
          const response = await axios.post(`${API_BASE_URL}/auth/google`, {
            email: profile?.email,
            name: profile?.name,
            googleId: profile?.sub,
            picture: (profile as any)?.picture,
          });

          if (response.data.user) {
            (user as any).accessToken = response.data.token;
            user.firstName = response.data.user.firstName;
            user.lastName = response.data.user.lastName;
            user.role = response.data.user.role;
            return true;
          }
        } catch (error) {
          console.error("Google sign-in error:", error);
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

  debug: process.env.NODE_ENV === "development",
};
