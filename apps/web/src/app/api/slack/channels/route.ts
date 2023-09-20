import { NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

import { simpleMemoryCache } from "@ssb/utils";
import { AUTH_URI } from "@ssb/utils/src/constants";

import getUser from "@/lib/getUser";

import getChannels from "./getChannels";

export const GET = async () => {
  const user = await getUser();
  if (!user) return NextResponse.redirect(AUTH_URI);

  const key = `channels_${user.id}`;
  let channels: { slackId?: string; name?: string }[] = [];
  if (simpleMemoryCache.hasCachedItem(key))
    channels = simpleMemoryCache.getCachedItem(key);
  else {
    const client = new WebClient(user.workspace.botToken);
    channels = await getChannels(client);
    simpleMemoryCache.cacheItem(key, channels, 60 * 5 * 1000);
  }

  return NextResponse.json(
    {
      key,
      channels,
    },
    { status: 200 },
  );
};
