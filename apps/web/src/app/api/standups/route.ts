import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

import { db, eq, Standups, Users } from "@/lib/orm";

export const GET = async (req: NextRequest) => {
  try {
    const slackId = req.nextUrl.searchParams.get("slackId");
    if (!slackId) throw new Error("slackId is required");

    const user = await db.query.Users.findFirst({
      with: {
        workspace: true,
      },
      where: eq(Users.slackId, slackId),
    });
    if (!user) throw new Error("User not found");
    const standups = await db.query.Standups.findMany({
      where: eq(Standups.workspaceId, user.workspaceId),
    });

    const client = new WebClient(user.workspace.botToken);
    const userList = await client.users.list();
    if (!userList.ok) throw new Error("No users found");

    return NextResponse.json(
      {
        slackId,
        standups: standups.map((standup) => {
          const author = userList.members?.find(
            (member) => member.id === standup.authorId,
          );
          return {
            ...standup,
            author: { name: author?.name || standup.authorId },
          };
        }),
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.error();
  }
};
