import { NextRequest, NextResponse } from "next/server";

export default function middleware(request: NextRequest) {
  // console.log("DADADA", request);
}

// export default authMiddleware({
//   publicRoutes: ["/api", "/api/i", "/auth/(.*)", "/"],
//   beforeAuth: async (req, evt) => {},
//   afterAuth: async (auth, req, evt) => {
//     // handle users who aren't authenticated
//     if (!auth.userId && !auth.isPublicRoute) {
//       return redirectToSignIn({ returnBackUrl: req.url });
//     }
//   },
// });

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
