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
    await db
      .insert(Standups)
      .values({
        authorId: user[0].id,
        workspaceId: user[0].workspaceId,
        ...data,
      })
      .execute();
    return NextResponse.redirect(`/p/standups`);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
