import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

import { db, eq, Users } from "@/lib/orm";

import getUsersByChannel from "./getUsersByChannel";

export const GET = async (req: NextRequest) => {
  try {
    const slackId = req.nextUrl.searchParams.get("slackId");
    const channelId = req.nextUrl.searchParams.get("channelId");
    if (!slackId) throw new Error("slackId is required");
    if (!channelId) throw new Error("channelId is required");
    const user = await db.query.Users.findFirst({
      with: {
        workspace: true,
      },
      where: eq(Users.slackId, slackId),
    });
    if (!user) throw new Error("User not found");

    const client = new WebClient(user.workspace.botToken);

    return NextResponse.json(await getUsersByChannel(client, channelId), {
      status: 200,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.error();
  }
};
