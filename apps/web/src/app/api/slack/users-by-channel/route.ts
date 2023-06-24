import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

import getUser from "@/lib/getUser";
import {
  cacheItem,
  getCachedItem,
  hasCachedItem,
} from "@/lib/simpleMemoryCache";

import getUsersByChannel from "./getUsersByChannel";

export const GET = async (req: NextRequest) => {
  try {
    const channelId = req.nextUrl.searchParams.get("channelId");
    if (!channelId) throw new Error("channelId is required");
    const key = `users_${channelId}`;

    let users: { slackId?: string; name?: string }[] = [];
    if (hasCachedItem(key)) users = getCachedItem(key);
    else {
      const user = await getUser(req);
      const client = new WebClient(user.workspace.botToken);
      users = await getUsersByChannel(client, channelId);
      cacheItem(key, users, 60 * 60);
    }

    return NextResponse.json(
      {
        key,
        users,
      },
      {
        status: 200,
      },
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.error();
  }
};
