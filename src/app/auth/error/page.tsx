"use client";

import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const errorMessages: { [key: string]: string } = {
  Configuration: "Серверийн тохиргоонд алдаа байна.",
  AccessDenied: "Танд энэ үйлдэл хийх эрх байхгүй.",
  Verification: "Баталгаажуулах токен буруу эсвэл хугацаа дууссан.",
  Default: "Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.",
  CredentialsSignin: "И-мэйл хаяг эсвэл нууц үг буруу байна.",
  EmailSignin: "И-мэйл илгээхэд алдаа гарлаа.",
  OAuthSignin: "OAuth provider-тай холбогдоход алдаа гарлаа.",
  OAuthCallback: "OAuth callback-д алдаа гарлаа.",
  OAuthCreateAccount: "OAuth бүртгэл үүсгэхэд алдаа гарлаа.",
  EmailCreateAccount: "И-мэйлээр бүртгэл үүсгэхэд алдаа гарлаа.",
  Callback: "Callback функцэд алдаа гарлаа.",
  OAuthAccountNotLinked: "Энэ и-мэйл хаяг өөр нэвтрэх аргаар холбогдсон байна.",
  SessionRequired: "Энэ хуудсыг үзэхийн тулд нэвтэрнэ үү.",
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessage = error
    ? errorMessages[error] || errorMessages.Default
    : errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Нэвтрэхэд алдаа гарлаа
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Алдаа гарлаа
            </CardTitle>
            <CardDescription className="text-center">
              Дараах алдаа гарсан байна
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">
                {errorMessage}
              </p>
              {error && (
                <p className="text-xs text-gray-400">Алдааны код: {error}</p>
              )}
            </div>

            <div className="space-y-3">
              <Link href="/auth/login">
                <Button className="w-full">Нэвтрэх хуудас руу буцах</Button>
              </Link>

              <Link href="/">
                <Button variant="outline" className="w-full">
                  Үндсэн хуудас руу буцах
                </Button>
              </Link>
            </div>

            <div className="text-center text-xs text-gray-500">
              Хэрэв энэ алдаа үргэлжилж байвал{" "}
              <Link
                href="/contact"
                className="text-blue-600 hover:text-blue-500"
              >
                бидэнтэй холбогдоно уу
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
