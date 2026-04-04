import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isOwnerRoute = nextUrl.pathname.startsWith("/owner");
  const isInstructorRoute = nextUrl.pathname.startsWith("/instructor");
  const isPortalRoute = nextUrl.pathname.startsWith("/portal");
  const isStaffLoginRoute = nextUrl.pathname === "/login/staff" || nextUrl.pathname === "/login/owner";
  const isMemberLoginRoute = nextUrl.pathname === "/login/member";

  // Redirect /login/owner to /login/staff
  if (nextUrl.pathname === "/login/owner") {
    return NextResponse.redirect(new URL("/login/staff", nextUrl));
  }

  // 1. Protection for Owner Routes
  if (isOwnerRoute) {
    if (!isLoggedIn || userRole !== "owner") {
      return NextResponse.redirect(new URL("/login/staff", nextUrl));
    }
  }

  // 2. Protection for Instructor Routes
  if (isInstructorRoute) {
    if (!isLoggedIn || userRole !== "instructor") {
      return NextResponse.redirect(new URL("/login/staff", nextUrl));
    }
  }

  // 3. Protection for Member Portal
  if (isPortalRoute) {
    if (!isLoggedIn || userRole !== "member") {
      return NextResponse.redirect(new URL("/login/member", nextUrl));
    }
  }

  // 4. Redirect if already logged in (Unified Staff Login)
  if (isStaffLoginRoute && isLoggedIn) {
    if (userRole === "owner") return NextResponse.redirect(new URL("/owner/dashboard", nextUrl));
    if (userRole === "instructor") return NextResponse.redirect(new URL("/instructor/dashboard", nextUrl));
  }

  // 5. Redirect if already logged in (Member)
  if (isMemberLoginRoute && isLoggedIn && userRole === "member") {
    return NextResponse.redirect(new URL("/portal", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/owner/:path*", "/portal/:path*", "/instructor/:path*", "/login/:path*"],
};

