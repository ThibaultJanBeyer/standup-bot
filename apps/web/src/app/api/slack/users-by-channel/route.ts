import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

import { simpleMemoryCache } from "@ssb/utils";

import getUser from "@/lib/getUser";

import getUsersByChannel from "./getUsersByChannel";

export const GET = async (req: NextRequest) => {
  const channelId = req.nextUrl.searchParams.get("channelId");
  if (!channelId) throw new Error("channelId is required");
  const key = `users_${channelId}`;

  let users: { slackId: string | null; name: string | null }[] = [];
  if (simpleMemoryCache.hasCachedItem(key))
    users = simpleMemoryCache.getCachedItem(key);
  else {
    const user = await getUser();
    if (!user) return null;

    const client = new WebClient(user.workspace.botToken);
    users = await getUsersByChannel(client, channelId);
    simpleMemoryCache.cacheItem(key, users, 60 * 60);
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
};
