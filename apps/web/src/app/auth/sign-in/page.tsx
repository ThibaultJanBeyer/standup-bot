"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

import { AFTER_SIGN_IN_PATH } from "@ssb/utils/src/constants";

export default function Signin() {
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      void signIn("slack");
    } else if (status === "authenticated") {
      void redirect(AFTER_SIGN_IN_PATH);
    }
  }, [status]);

  return null;
}
