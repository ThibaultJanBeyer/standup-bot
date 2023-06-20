import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

import { db, eq, Users } from "@/lib/orm";

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

    // Users from Workspace
    const client = new WebClient(user.workspace.botToken);
    const userList = await client.users.list();
    if (!userList.ok) throw userList;
    const channelIds = await client.conversations.members({
      channel: channelId, // Replace with the ID of the channel you want to list members for
    });
    if (!channelIds.ok) throw channelIds;
    const channelMembers = userList.members?.filter(
      (member) =>
        !member.is_bot &&
        member.name !== "slackbot" &&
        channelIds.members?.includes(member.id!),
    );
    const users = channelMembers?.map((member) => ({
      slackId: member.id,
      name: member.name,
    }));

    console.log(users, channelIds.members);

    return NextResponse.json(
      {
        slackId,
        channelId,
        users,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.error();
  }
};
