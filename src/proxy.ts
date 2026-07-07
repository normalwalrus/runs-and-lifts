import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, sessionCookie } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(sessionCookie.name)?.value;
  const authed = await verifySessionToken(token);

  const isLogin = request.nextUrl.pathname === "/login";
  if (!authed && !isLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (authed && isLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
