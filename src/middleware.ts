import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/";
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // Redirect to login page if trying to access dashboard without token
  if (!accessToken && isDashboardRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect to dashboard if accessing login page with valid token
  if (accessToken && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
