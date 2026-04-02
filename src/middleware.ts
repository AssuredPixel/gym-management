import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isDashboardRoute = nextUrl.pathname.startsWith("/owner/dashboard") || nextUrl.pathname === "/owner";
  const isPortalRoute = nextUrl.pathname.startsWith("/portal");

  if (isDashboardRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login/owner", nextUrl));
    }
    if (userRole !== "owner") {
      return NextResponse.redirect(new URL("/login/owner", nextUrl));
    }
    
    // Redirect /owner to dashboard if logged in
    if (nextUrl.pathname === "/owner") {
      return NextResponse.redirect(new URL("/owner/dashboard", nextUrl));
    }
  }

  if (isPortalRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login/member", nextUrl));
    }
    if (userRole !== "member") {
      return NextResponse.redirect(new URL("/login/member", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/owner/:path*", "/portal/:path*", "/owner"],
};

