import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

import { db, eq, Users } from "@/lib/orm";

import getChannels from "./getChannels";

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
    const client = new WebClient(user.workspace.botToken);

    return NextResponse.json(
      {
        slackId,
        channels: (await getChannels(client)).channels,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.error();
  }
};
