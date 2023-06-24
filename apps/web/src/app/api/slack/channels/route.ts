import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

import getUser from "@/lib/getUser";
import {
  cacheItem,
  getCachedItem,
  hasCachedItem,
} from "@/lib/simpleMemoryCache";

import getChannels from "./getChannels";

export const GET = async (req: NextRequest) => {
  try {
    const user = await getUser(req);
    const key = `channels_${user.id}`;
    console.log("channels1", key, user);

    let channels: { slackId?: string; name?: string }[] = [];
    if (hasCachedItem(key)) channels = getCachedItem(key);
    else {
      console.log("channels3");
      const client = new WebClient(user.workspace.botToken);
      console.log("channels4");
      channels = await getChannels(client);
      console.log("channels5");
      cacheItem(key, channels, 60 * 60);
      console.log("channels6");
    }

    console.log("channels2", channels);

    return NextResponse.json(
      {
        key,
        channels,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.error();
  }
};
