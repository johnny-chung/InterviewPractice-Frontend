export { auth as middleware } from "@/auth/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    //"/api/:path*",
    "/((?!api|_next|assets|favicon.ico).*)",
  ],
};
