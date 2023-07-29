import { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";

import { AUTH_PATH } from "@ssb/utils/src/constants";

export default function middleware(request: NextRequest) {
  console.log("DADADA");
}

// @TODO get this working
// export default withAuth({
//   pages: {
//     signIn: AUTH_PATH,
//   },
// });

export const config = {
  matcher: ["/((?!.*\\..*|_next|api|auth|trcp).*)"],
};
