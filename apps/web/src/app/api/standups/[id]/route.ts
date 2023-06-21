import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

import { and, db, eq, Standups, Users } from "@/lib/orm";

export const GET = async (req: NextRequest) => {
  try {
    const id = req.query.id as string;
    if (!id) throw new Error("id is required");
    const slackId = req.nextUrl.searchParams.get("slackId");
    if (!slackId) throw new Error("slackId is required");
    const user = await db.query.Users.findFirst({
      with: {
        workspace: true,
      },
      where: eq(Users.slackId, slackId),
    });
    if (!user) throw new Error("User not found");
    const standup = await db.query.Standups.findFirst({
      with: {
        workspace: true,
      },
      // make sure user can only retrieve standups from their workspace
      where: and(
        eq(Standups.id, id),
        eq(Standups.workspaceId, user.workspaceId),
      ),
    });
    if (!standup) throw new Error("No standup found");

    const { workspace, ...rest } = standup;
    const client = new WebClient(workspace.botToken);
    const author = await client.users.info({ user: standup.authorId });

    return NextResponse.json(
      {
        ...rest,
        authorName: author.user?.name,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 },
    );
  }
};
