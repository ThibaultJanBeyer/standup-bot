import { NextRequest, NextResponse } from "next/server";
import { clerkClient, getAuth } from "@clerk/nextjs/server";

import { db, Users } from "@/lib/orm";

export const GET = async (req: NextRequest) => {
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await clerkClient.users.getUser(userId!);
  const item = await db
    .insert(Users)
    .values({
      clerkId: user.id,
      slackId: user.externalAccounts[0].externalId,
    })
    .onConflictDoUpdate({
      target: Users.slackId,
      set: { clerkId: user.id },
    })
    .returning()
    .execute();
  return NextResponse.json({ hello: item }, { status: 200 });
};
