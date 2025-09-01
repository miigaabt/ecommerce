"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">E-Commerce</h1>
            </div>
            <nav className="flex items-center space-x-4">
              {status === "loading" ? (
                <div className="animate-pulse">
                  <div className="h-9 w-20 bg-gray-200 rounded"></div>
                </div>
              ) : session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">
                    Сайн байна уу,{" "}
                    {session.user?.firstName ||
                      session.user?.name?.split(" ")[0] ||
                      "Хэрэглэгч"}
                    !
                  </span>
                  <Link href="/dashboard">
                    <Button>Dashboard</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline">Нэвтрэх</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button>Бүртгүүлэх</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Монголын шилдэг <br />
            <span className="text-blue-600">онлайн дэлгүүр</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Хамгийн сайн бараа бүтээгдэхүүн, хурдан хүргэлт, найдвартай
            үйлчилгээ. Таны амьдралыг илүү хялбар болгоцгооё.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Эхлэх
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Бүтээгдэхүүн үзэх
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Хурдан хүргэлт</h3>
            <p className="text-gray-600">24 цагийн дотор хүргэж өгнө</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Чанартай бараа</h3>
            <p className="text-gray-600">100% баталгаатай чанар</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Аюулгүй төлбөр</h3>
            <p className="text-gray-600">Бүх төлбөр аюулгүй байдалтай</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">E-Commerce</h3>
              <p className="text-gray-400">
                Монголын хамгийн сайн онлайн дэлгүүр
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Компани</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    Бидний тухай
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Холбоо барих
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-white">
                    Ажлын байр
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Үйлчилгээ</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Тусламж
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-white">
                    Хүргэлт
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-white">
                    Буцаалт
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Холбоо барих</h4>
              <ul className="space-y-2 text-gray-400">
                <li>И-мэйл: info@ecommerce.mn</li>
                <li>Утас: +976 7777-7777</li>
                <li>Хаяг: Улаанбаатар хот</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 E-Commerce. Бүх эрх хуулиар хамгаалагдсан.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
