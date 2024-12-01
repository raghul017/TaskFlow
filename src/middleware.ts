import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/features",
  "/solutions",
  "/resources",
  "/pricing",
  "/sign-in",
  "/sign-up",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // For dashboard and other protected routes
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("token") || localStorage.getItem("token");

    if (!token) {
      return NextResponse.redirect(new URL("/sign-in", request.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
