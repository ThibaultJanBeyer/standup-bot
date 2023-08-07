import { withAuth } from "next-auth/middleware";

import { AUTH_PATH } from "@ssb/utils/src/constants";

export default withAuth({
  pages: {
    signIn: AUTH_PATH,
  },
  callbacks: {
    authorized: async ({ req, token }) => {
      return true;
    },
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next|api|auth|trcp).*)"],
};
