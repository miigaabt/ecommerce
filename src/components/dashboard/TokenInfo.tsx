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
import { getTokenExpirationTime, getTokenTimeRemaining } from "@/lib/jwt-utils";

export default function TokenInfo() {
  const { data: session } = useSession();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    if (!session?.accessToken) return;

    const updateTokenInfo = () => {
      if (!session?.accessToken) return;

      const remaining = getTokenTimeRemaining(session.accessToken);
      setTimeRemaining(remaining);
      setIsExpired(remaining <= 0);
    };

    // Update immediately
    updateTokenInfo();

    // Update every second
    const interval = setInterval(updateTokenInfo, 1000);

    return () => clearInterval(interval);
  }, [session?.accessToken]);

  if (!session?.accessToken) {
    return null;
  }

  const expirationTime = session?.accessToken
    ? getTokenExpirationTime(session.accessToken)
    : null;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Token мэдээлэл</CardTitle>
        <CardDescription>Таны нэвтрэх token-ы төлөв</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Дуусах хугацаа:</span>{" "}
            {expirationTime
              ? new Date(expirationTime * 1000).toLocaleString("mn-MN")
              : "Тодорхойгүй"}
          </div>
          <div className="text-sm">
            <span className="font-medium">Үлдсэн хугацаа:</span>{" "}
            <span
              className={
                isExpired ? "text-red-600 font-bold" : "text-green-600"
              }
            >
              {isExpired
                ? "Дууссан"
                : `${minutes}:${seconds.toString().padStart(2, "0")}`}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Backend дээрээ token-ы хугацааг өөрчилж тест хийх боломжтой
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
