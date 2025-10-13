import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth/jwt"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")
  const { pathname } = request.nextUrl

  // Public routes
  const publicRoutes = ["/login", "/register"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // If no token and trying to access protected route
  if (!token && !isPublicRoute && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If has token and trying to access auth pages
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Verify token for protected routes
  if (token && !isPublicRoute) {
    const payload = await verifyToken(token.value)
    if (!payload) {
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("auth-token")
      return response
    }

    // Check admin routes
    if (pathname.startsWith("/admin") && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/profile/:path*", "/login", "/register"],
}
