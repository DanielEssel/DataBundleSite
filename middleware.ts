

import { NextRequest, NextResponse } from "next/server";

function getJwtExpMs(token: string): number | null {
  try {
    const payloadPart = token.split(".")[1];
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf8");
    const payload = JSON.parse(json);
    if (!payload?.exp) return null;
    return payload.exp * 1000; // exp is seconds
  } catch {
    return null;
  }
}

function isExpired(token: string): boolean {
  const expMs = getJwtExpMs(token);
  if (!expMs) return true; // treat missing exp as invalid
  return Date.now() >= expMs;
}
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("authToken")?.value;
  const userCookie = request.cookies.get("user")?.value;

  // 🔒 Admin routes
  if (pathname.startsWith("/dashboard/admin")) {
    if (!token || !userCookie || isExpired(token)) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      // optional: clear cookies so browser is clean
      res.cookies.set("authToken", "", { path: "/", maxAge: 0 });
      res.cookies.set("user", "", { path: "/", maxAge: 0 });
      return res;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userCookie));
      if (user.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard/user", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 🔒 User routes
  if (pathname.startsWith("/dashboard/user")) {
    if (!token || isExpired(token)) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.set("authToken", "", { path: "/", maxAge: 0 });
      res.cookies.set("user", "", { path: "/", maxAge: 0 });
      return res;
    }
  }

  // 🔁 Prevent logged-in users from visiting login
  if (pathname === "/login" || pathname === "/login") {
    if (token && userCookie && !isExpired(token)) {
      try {
        const user = JSON.parse(decodeURIComponent(userCookie));
        const redirectTo = user.role === "admin" ? "/dashboard/admin" : "/dashboard/user";
        return NextResponse.redirect(new URL(redirectTo, request.url));
      } catch {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/login"],
};
