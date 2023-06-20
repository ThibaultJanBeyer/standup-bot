import { NextResponse, NextRequest } from "next/server";
import { parse } from "url";
import * as z from "zod";

import { db, eq, Standups, Users, Workspaces } from "@/lib/orm";

const schema = z.object({
  name: z.string(),
  workspaceId: z.string(),
  channelId: z.string(),
  scheduleCron: z.string(),
  summaryCron: z.string(),
  members: z.array(z.string()),
  authorId: z.string(),
});

export const POST = async (req: NextRequest) => {
  try {
    const { authorId, ...data } = schema.parse(req.body);
    const user = await db.select().from(Users).where(eq(Users.clerkId, authorId)).execute();
    await db.insert(Standups).values({
      authorId: user[0].id,
      ...data,
    }).execute();
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
};
