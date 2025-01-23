import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STORAGE } from "./constant";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get(STORAGE.accessToken)?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected routes that require authentication
    "/dashboard/:path*",
    "/customers/:path*",
    "/orders/:path*",
    "/vehicles/:path*",
    "/business/:path*",
    "/finances/:path*",
    "/couriers/:path*",
    "/admin/:path*",
  ],
};
