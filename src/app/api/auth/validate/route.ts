import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    // Check if token has expired
    const now = Math.floor(Date.now() / 1000);

    if (
      token.accessTokenExpires &&
      now > (token.accessTokenExpires as number)
    ) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: token.sub,
        email: token.email,
        name: token.name,
        firstName: token.firstName,
        lastName: token.lastName,
      },
    });
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { error: "Token validation failed" },
      { status: 401 }
    );
  }
}
