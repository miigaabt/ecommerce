import jwt from "jsonwebtoken";

interface JWTPayload {
  exp?: number;
  iat?: number;
  [key: string]: any;
}

export function getTokenExpirationTime(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;

    if (decoded && decoded.exp) {
      return decoded.exp;
    }

    return null;
  } catch (error) {
    console.error("Failed to decode JWT token:", error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const expirationTime = getTokenExpirationTime(token);

  if (!expirationTime) {
    // If we can't determine expiration, consider it expired for safety
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime >= expirationTime;
}

export function getTokenTimeRemaining(token: string): number {
  const expirationTime = getTokenExpirationTime(token);

  if (!expirationTime) {
    return 0;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const timeRemaining = expirationTime - currentTime;

  return Math.max(0, timeRemaining);
}
