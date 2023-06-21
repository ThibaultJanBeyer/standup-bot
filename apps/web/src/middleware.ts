import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { clerkClient } from "@clerk/nextjs/server";

export default authMiddleware({
  publicRoutes: ["/api", "/api/install", "/api/i", "/auth/(.*)", "/"],
  afterAuth(auth, req, evt) {
    // handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)", "/api/i"],
};
