import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

import { db, eq, Standups, Users } from "@/lib/orm";

import getUser from "../../getUser";

const schema = z.object({
  id: z.string().optional(),
  name: z.string(),
  channelId: z.string(),
  scheduleCron: z.string(),
  summaryCron: z.string(),
  members: z.array(z.string()),
});

export const POST = async (req: NextRequest) => {
  try {
    const user = await getUser(req);
    const { id, ...data } = schema.parse(await req.json());

    let standup;
    if (!id) {
      standup = await db
        .insert(Standups)
        .values({
          authorId: user.id,
          workspaceId: user.workspace.id,
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

    return NextResponse.json({ id: standup[0].id });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
