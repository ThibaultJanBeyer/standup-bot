import { NextResponse } from "next/server";
import { authMiddleware } from "@clerk/nextjs";

const privateRoutesRegexp = /^\/[^/]+\/(account|private)/g;

export default authMiddleware({
  publicRoutes: (req) => {
    const isPrivate = privateRoutesRegexp.test(req.nextUrl.pathname);
    return !isPrivate;
  },
  afterAuth(auth, req, res) {
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL(`/auth/sign-in`, req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
  },
});

export const config = {
  matcher: ["/((?!api|.*\\..*|_next).*)"],
};
