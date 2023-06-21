import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

import { db, eq, Standups, Users } from "@/lib/orm";

import getUser from "../getUser";

export const GET = async (req: NextRequest) => {
  try {
    const user = await getUser(req);
    const standups = await db.query.Standups.findMany({
      where: eq(Standups.workspaceId, user.workspace.id),
    });

    const client = new WebClient(user.workspace.botToken);
    const userList = await client.users.list();
    if (!userList.ok) throw new Error("No users found");

    return NextResponse.json(
      {
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
