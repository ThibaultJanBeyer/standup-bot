import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

import getUser from "../../getUser";
import getUsersByChannel from "./getUsersByChannel";

export const GET = async (req: NextRequest) => {
  try {
    const channelId = req.nextUrl.searchParams.get("channelId");
    if (!channelId) throw new Error("channelId is required");
    const user = await getUser(req);
    const client = new WebClient(user.workspace.botToken);
    return NextResponse.json(await getUsersByChannel(client, channelId), {
      status: 200,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.error();
  }
};
