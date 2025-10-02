import { auth } from "@/auth/auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  //const { pathname } = request.nextUrl;
  //console.log("current path ", pathname);

  // check session existence & session expiry
  const session = await auth();
  if (!session || !session.expires || new Date(session.expires).getTime() < Date.now()) {
    request.nextUrl.pathname = `/signin`;
    return NextResponse.redirect(request.nextUrl);
  }

  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    //"/dashboard/:path*",
    //"/api/:path*",
    "/((?!api|_next|assets|favicon.ico).*)",
  ],
};
