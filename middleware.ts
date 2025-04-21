import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = ["/", "/products", "/auth/login", "/auth/register", "/api/auth"]
  const isPublicPath = publicPaths.some(
    (publicPath) => path === publicPath || path.startsWith("/api/auth/") || path.startsWith("/products/"),
  )

  // Check if the path is for static assets
  const isStaticAsset = path.startsWith("/_next") || path.startsWith("/images") || path.startsWith("/favicon.ico")

  if (isPublicPath || isStaticAsset) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request })

  // If the user is not logged in and trying to access a protected route
  if (!token) {
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // Check for admin routes
  if (path.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
