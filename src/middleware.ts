import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  const rawRole = (req.auth?.user as any)?.role || "USER";
  const userRole = String(rawRole).toUpperCase();
  const userStatus = ((req.auth?.user as any)?.status || "ACTIVE").toUpperCase();

  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAuthRoute =
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/signup" ||
    nextUrl.pathname === "/forgot-password" ||
    nextUrl.pathname === "/reset-password";

  // 1. If user is logged in but status is not ACTIVE, force logout/login
  if (isLoggedIn && userStatus !== "ACTIVE") {
    return NextResponse.redirect(new URL("/login?error=AccountSuspended", nextUrl));
  }

  // 2. Admin Route Protection
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL("/login?callbackUrl=" + encodeURIComponent(nextUrl.pathname), nextUrl)
      );
    }
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  // 3. Dashboard Route Protection
  if (isDashboardRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL("/login?callbackUrl=" + encodeURIComponent(nextUrl.pathname), nextUrl)
      );
    }
  }

  // 4. Auth Pages (Login / Signup): Redirect already authenticated users away
  if (isAuthRoute && isLoggedIn) {
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};
