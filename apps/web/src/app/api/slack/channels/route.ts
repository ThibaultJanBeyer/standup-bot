import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

import getUser from "../../getUser";
import getChannels from "./getChannels";

export const GET = async (req: NextRequest) => {
  try {
    const user = await getUser(req);
    const client = new WebClient(user.workspace.botToken);
    return NextResponse.json(await getChannels(client), { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.error();
  }
};
