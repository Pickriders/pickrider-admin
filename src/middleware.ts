import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STORAGE } from "./constant";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get(STORAGE.accessToken)?.value;
  const pathname = request.nextUrl.pathname;

  // Skip middleware for public assets and API routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.startsWith("/assets/") || pathname === "/") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/auth")) {
    if (accessToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!accessToken && !pathname.startsWith("/auth")) {
    const requestedUrl = request.nextUrl.pathname + request.nextUrl.search;
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", requestedUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (public files)
     */
    // Static files (public/assets, fonts, icons, manifests) are never auth-gated: a font
    // redirected to /auth/login silently falls back to Arial.
    "/((?!api|_next/static|_next/image|assets/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|txt|xml|json|webmanifest)$).*)",
  ],
};
