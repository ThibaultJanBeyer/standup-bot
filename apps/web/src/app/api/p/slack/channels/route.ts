import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

import { db, eq, Users } from "@/lib/orm";

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

    // Users from Workspace
    const client = new WebClient(user.workspace.botToken);
    const channelList = await client.conversations.list();
    if (!channelList.ok) throw channelList;
    const channels = channelList?.channels?.flatMap((channel) => [
      {
        slackId: channel.id,
        name: channel.name,
      },
    ]);

    return NextResponse.json(
      {
        slackId,
        channels,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.error();
  }
};
