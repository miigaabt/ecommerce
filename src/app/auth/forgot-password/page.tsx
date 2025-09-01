"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Энд нууц үг сэргээх логик нэмнэ
      console.log("Password reset request for:", email);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSubmitted(true);
    } catch (error) {
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              И-мэйл илгээлээ
            </h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>И-мэйл шалгана уу</CardTitle>
              <CardDescription>Нууц үг сэргээх заавар илгээлээ</CardDescription>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <p className="text-sm text-gray-600">
                <strong>{email}</strong> хаягт нууц үг сэргээх холбоос илгээлээ.
                И-мэйлээ шалгаад заавраар дагана уу.
              </p>

              <p className="text-xs text-gray-500">
                И-мэйл ирээгүй бол spam хавтсыг шалгана уу.
              </p>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
                variant="outline"
                className="w-full"
              >
                Дахин илгээх
              </Button>

              <div className="text-center text-sm">
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  ← Нэвтрэх хуудас руу буцах
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Нууц үг мартсан уу?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            И-мэйл хаягаа оруулбал нууц үг сэргээх холбоос илгээх болно
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Нууц үг сэргээх</CardTitle>
            <CardDescription>
              Бүртгэлтэй и-мэйл хаягаа оруулна уу
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">И-мэйл хаяг</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email}
              >
                {isLoading ? "Илгээж байна..." : "Сэргээх холбоос илгээх"}
              </Button>

              <div className="text-center text-sm">
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  ← Нэвтрэх хуудас руу буцах
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
