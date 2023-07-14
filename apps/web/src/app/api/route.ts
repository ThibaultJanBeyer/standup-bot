import { parse } from "url";
import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

import { db, Workspaces } from "@/lib/orm";

import { insertUsersFromWorkspace } from "../../lib/insertUsersFromWorkspace";

export const GET = async (req: NextRequest) => {
  try {
    const { query } = parse(req.url || "", true);
    const code = query.code as string;
    const state = query.state as string; // for XSRF

    // Slack OAuth
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
      throw new Error("Error connecting to Slack");
    }

    const { access_token, team } = data;

    // Workspace
    await db
      .insert(Workspaces)
      .values({
        workspaceId: team.id,
        botToken: access_token,
      })
      .onConflictDoUpdate({
        target: Workspaces.workspaceId,
        set: { botToken: access_token },
      })
      .execute();

    await insertUsersFromWorkspace(team.id, new WebClient(access_token), true);

    const url = req.nextUrl.clone();
    return NextResponse.redirect(url.origin);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
