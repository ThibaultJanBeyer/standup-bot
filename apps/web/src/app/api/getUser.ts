import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

import { db, eq, User, Users } from "@/lib/orm";

export default async (req: NextRequest) => {
  const { userId } = getAuth(req);
  if (!userId) throw new Error("Unauthorized");
  const user = await db.query.Users.findFirst({
    with: {
      workspace: true,
    },
    where: eq(Users.clerkId, userId),
  });
  if (!user) throw new Error("User not found");
  if (!user.workspace) throw new Error("User has no workspace");
  return {
    ...user,
    workspace: {
      ...user.workspace!,
    },
  };
};
