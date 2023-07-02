import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

import { db, eq, Users } from "@/lib/orm";

export default async (req: NextRequest) => {
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await db.query.Users.findFirst({
    with: {
      workspace: true,
    },
    where: eq(Users.clerkId, userId),
  }).execute();
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!user.workspace)
    return NextResponse.json(
      { error: "User Workspace not found" },
      { status: 404 },
    );
  return {
    ...user,
    workspace: {
      ...user.workspace!,
    },
  };
};
