import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

import { db, eq, Standups, Users } from "@/lib/orm";

const schema = z.object({
  id: z.string().optional(),
  name: z.string(),
  channelId: z.string(),
  scheduleCron: z.string(),
  summaryCron: z.string(),
  members: z.array(z.string()),
  authorId: z.string(),
});

export const POST = async (req: NextRequest) => {
  try {
    const { authorId, id, ...data } = schema.parse(await req.json());

    let standup;
    if (!id) {
      const user = await db
        .select()
        .from(Users)
        .where(eq(Users.slackId, authorId))
        .execute();
      standup = await db
        .insert(Standups)
        .values({
          authorId,
          workspaceId: user[0].workspaceId,
          ...data,
        })
        .returning()
        .execute();
    } else {
      standup = await db
        .update(Standups)
        .set({
          authorId,
          ...data,
        })
        .where(eq(Standups.id, id))
        .returning()
        .execute();
    }

    return NextResponse.json({ id: standup[0].id });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
