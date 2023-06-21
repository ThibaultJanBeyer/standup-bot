import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

import { db, eq, Standups, Users } from "@/lib/orm";

const schema = z.object({
  name: z.string(),
  channelId: z.string(),
  scheduleCron: z.string(),
  summaryCron: z.string(),
  members: z.array(z.string()),
  authorId: z.string(),
});

export const POST = async (req: NextRequest) => {
  try {
    const { authorId, ...data } = schema.parse(await req.json());
    const user = await db
      .select()
      .from(Users)
      .where(eq(Users.slackId, authorId))
      .execute();
    const standup = await db
      .insert(Standups)
      .values({
        authorId,
        workspaceId: user[0].workspaceId,
        ...data,
      })
      .returning()
      .execute();
    return NextResponse.json({ id: standup[0].id });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
