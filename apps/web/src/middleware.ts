import { NextResponse } from "next/server";
import { authMiddleware } from "@clerk/nextjs";

const privateRoutesRegexp = /\/p\//g;

export default authMiddleware({
  publicRoutes: (req) => {
    const isPrivate = privateRoutesRegexp.test(req.nextUrl.pathname);
    console.log("publicRoutes", !isPrivate);
    return !isPrivate;
  },
  afterAuth(auth, req, res) {
    console.log("afterAuth");

    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL(`/auth/sign-in`, req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)"],
};
