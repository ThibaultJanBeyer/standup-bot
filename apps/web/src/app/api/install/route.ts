import { NextResponse, NextRequest } from "next/server";
import { parse } from "url";

import { db, eq, Workspaces } from "@/lib/orm";

// ASK
export const GET = async (req: NextRequest) => {
  const { query } = parse(req.url || '', true);
  const code = query.code as string;
  const state = query.state as string;

  const response = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      redirect_uri: process.env.SLACK_REDIRECT_URI!,
    }),
  });

  const data = await response.json();

  if (!data.ok) {
    console.error(data);
    return NextResponse.error();
  }

  const { access_token, team } = data;

  // Update if exists
  const workspace = await db.update(Workspaces).set({
    botToken: access_token,
  }).where(eq(Workspaces.workspaceId, team.id)).returning().execute();
  if(!workspace?.length) {
    await db.insert(Workspaces).values({
      workspaceId: team.id,
      botToken: access_token,
    }).execute();
  }

  const url = req.nextUrl.clone()   
  
  return NextResponse.redirect(url.origin);
};
