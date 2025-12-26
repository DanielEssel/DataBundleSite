import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("authToken")?.value;
  const userCookie = request.cookies.get("user")?.value;

  // 🔒 Admin routes
  if (pathname.startsWith("/dashboard/admin")) {
    if (!token || !userCookie) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    try {
      const user = JSON.parse(decodeURIComponent(userCookie));
      if (user.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard/user", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // 🔒 User routes
  if (pathname.startsWith("/dashboard/user")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // 🔁 Prevent logged-in users from visiting login
  if (pathname === "/auth/login" || pathname === "/login") {
    if (token && userCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(userCookie));
        const redirectTo =
          user.role === "admin" ? "/dashboard/admin" : "/dashboard/user";
        return NextResponse.redirect(new URL(redirectTo, request.url));
      } catch {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/login", "/login"],
};
