"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProfileCard from "@/components/dashboard/ProfileCard";
import TokenInfo from "@/components/dashboard/TokenInfo";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function DashboardPage() {
  const router = useRouter();
  const { session, status, isAuthenticated, isLoading } = useAuthGuard();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ачаалж байна...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !session) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                E-Commerce Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {session.user?.firstName?.charAt(0) ||
                    session.user?.name?.charAt(0) ||
                    "U"}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {session.user?.firstName && session.user?.lastName
                      ? `${session.user.firstName} ${session.user.lastName}`
                      : session.user?.name || session.user?.email}
                  </div>
                  <div className="text-gray-500">{session.user?.email}</div>
                </div>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                Гарах
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Тавтай морил,{" "}
              {session.user?.firstName ||
                session.user?.name?.split(" ")[0] ||
                "Хэрэглэгч"}
              !
            </h2>
            <p className="mt-2 text-gray-600">
              Танай бүртгэлийн мэдээлэл болон захиалгуудыг энд харах боломжтой.
            </p>
          </div>

          {/* Token Information */}
          <TokenInfo />

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Нийт захиалга
                </CardTitle>
                <svg
                  className="h-4 w-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Танай нийт захиалгын тоо
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Хүлээгдэж буй
                </CardTitle>
                <svg
                  className="h-4 w-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Хүлээгдэж буй захиалга
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Дуусгасан</CardTitle>
                <svg
                  className="h-4 w-4 text-muted-foreground"
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
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Амжилттай дуусгасан
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Дараагийн захиалга
                </CardTitle>
                <svg
                  className="h-4 w-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">
                  Дараагийн захиалгын дугаар
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Profile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Хурдан үйлдлүүд</CardTitle>
                  <CardDescription>
                    Түгээмэл хэрэглэгддэг функцууд
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <Button className="h-16" variant="outline">
                    <div className="text-center">
                      <div className="text-lg mb-1">🛍️</div>
                      <div className="text-sm">Бүтээгдэхүүн үзэх</div>
                    </div>
                  </Button>
                  <Button className="h-16" variant="outline">
                    <div className="text-center">
                      <div className="text-lg mb-1">📋</div>
                      <div className="text-sm">Захиалгын түүх</div>
                    </div>
                  </Button>
                  <Button className="h-16" variant="outline">
                    <div className="text-center">
                      <div className="text-lg mb-1">👤</div>
                      <div className="text-sm">Профайл засах</div>
                    </div>
                  </Button>
                  <Button className="h-16" variant="outline">
                    <div className="text-center">
                      <div className="text-lg mb-1">⚙️</div>
                      <div className="text-sm">Тохиргоо</div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div>
              <ProfileCard />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Сүүлийн үйл ажиллагаа</CardTitle>
                <CardDescription>
                  Танай сүүлийн захиалга болон үйл ажиллагаанууд
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-lg font-medium">
                    Одоогоор үйл ажиллагаа байхгүй байна.
                  </p>
                  <p className="text-sm mt-2">Эхний захиалгаа хийж эхлээрэй!</p>
                  <Button className="mt-4">Бүтээгдэхүүн харах</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
