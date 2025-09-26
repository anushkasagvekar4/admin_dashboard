import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value || "";
  const role = request.cookies.get("role")?.value || "";

  // Public pages that anyone can visit
  const publicPaths = ["/auth/signin", "/auth/signup"];

  // If user is logged in and tries to visit signin/signup, redirect based on role
  if (publicPaths.includes(path) && token) {
    // if (role === "super_admin")
    //   return NextResponse.redirect(new URL("/super_admin/home", request.url));
    if (role === "customer")
      return NextResponse.redirect(new URL("/customer/home", request.url));
    return NextResponse.redirect(new URL("/admin/home", request.url));
  }

  // Protected paths that require login
  const protectedPaths = [
    "/admin/customers",
    "/admin/add_user",
    // "/super_admin/home",
    "/customer/home",
    "/admin/home",
  ];

  // If user tries to access a protected page without a token, redirect to login
  if (protectedPaths.includes(path) && !token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/signin",
    "/auth/signup",
    "/admin/customers",
    "/admin/add_user",
    "/super_admin/home",
    "/customer/home",
    "/admin/home",
  ],
};
