"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function SignOut() {
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      void redirect("/");
    } else {
      void signOut({ callbackUrl: "/" });
    }
  }, [status]);

  return null;
}
