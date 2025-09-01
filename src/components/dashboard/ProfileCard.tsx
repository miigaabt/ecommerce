"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UserProfile {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  role: {
    name: string;
  };
  status: {
    name: string;
  };
}

export default function ProfileCard() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock profile data based on session
    if (session?.user) {
      setProfile({
        id: parseInt(session.user.id || "1"),
        firstname: session.user.firstName || "Админ",
        lastname: session.user.lastName || "Хэрэглэгч",
        email: session.user.email || "",
        phone: "88999157",
        role: {
          name: session.user.role || "user",
        },
        status: {
          name: "Идэвхтэй",
        },
      });
    }
    setIsLoading(false);
  }, [session]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Миний профайл</CardTitle>
        <CardDescription>Таны бүртгэлийн мэдээлэл</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Нэр</label>
            <p className="text-sm">{profile.firstname}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Овог</label>
            <p className="text-sm">{profile.lastname}</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">И-мэйл</label>
          <p className="text-sm">{profile.email}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Утас</label>
          <p className="text-sm">{profile.phone}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Эрх</label>
            <p className="text-sm">
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  profile.role.name === "Админ"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {profile.role.name}
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Төлөв</label>
            <p className="text-sm">
              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                {profile.status.name}
              </span>
            </p>
          </div>
        </div>

        <div className="pt-4">
          <Button variant="outline" className="w-full">
            Профайл засах
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
