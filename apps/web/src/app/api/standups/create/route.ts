import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

import getUser from "@/lib/getUser";
import { db, eq, Standups } from "@/lib/orm";

const schema = z.object({
  id: z.string().optional(),
  name: z.string(),
  channelId: z.string(),
  scheduleCron: z.string(),
  summaryCron: z.string(),
  members: z.array(z.string()),
});

export const POST = async (req: NextRequest) => {
  const user = await getUser(req);
  const { id, ...data } = schema.parse(await req.json());

  let standup;
  if (!id) {
    standup = await db
      .insert(Standups)
      .values({
        authorId: user.slackId!,
        workspaceId: user.workspaceId!,
        ...data,
      })
      .returning()
      .execute();
  } else {
    standup = await db
      .update(Standups)
      .set({
        authorId: user.id,
        ...data,
      })
      .where(eq(Standups.id, id))
      .returning()
      .execute();
  }

  const internal = await fetch("http://localhost:3001/bot/slack/init", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": process.env.COMMUNICATION_TOKEN!,
    },
    credentials: "include",
    body: JSON.stringify({
      standupId: standup[0].id,
    }),
  });

  console.info(await internal.json());

  return NextResponse.json({ id: standup[0].id });
};
