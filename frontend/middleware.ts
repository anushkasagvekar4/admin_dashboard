// middleware.ts
import { isPageStatic } from "next/dist/build/utils";
import { NextRequest, NextResponse } from "next/server";
// import debug from "next-debug/package.json";

// const log = debug("middleware");
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value || "";
  //   console.log(token);
  // console.log("Middleware triggered, token:", token);
  const isPublicPath = path === "/auth/signin";

  //    || path === "/auth/signup"
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  const protectedPaths = ["/admin/customers", "/admin/add_user"];
  if (protectedPaths.includes(path) && !token) {
    return NextResponse.redirect(new URL("/auth/signin", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/signin", "/admin/customers", "/admin/add_user"],
};
