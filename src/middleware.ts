import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STORAGE } from "./constant";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get(STORAGE.accessToken)?.value;
  const pathname = request.nextUrl.pathname;

  // Skip middleware for public assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/auth")) {
    if (accessToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!accessToken) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files
     * /:path* matches all routes after the root /
     */
    "/:path*",
  ],
};
