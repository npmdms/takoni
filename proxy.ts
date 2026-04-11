import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/sign-in") ||
      req.nextUrl.pathname.startsWith("/sign-up");

    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage =
          req.nextUrl.pathname.startsWith("/sign-in") ||
          req.nextUrl.pathname.startsWith("/sign-up");

        if (isAuthPage) return true;
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
