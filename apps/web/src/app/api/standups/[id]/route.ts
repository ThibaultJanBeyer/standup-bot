import { NextRequest, NextResponse } from "next/server";

import getUser from "@/lib/getUser";
import { and, db, eq, Standups } from "@/lib/orm";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  const id = params.id;
  if (!id) throw new Error("id is required");
  const user = await getUser(req);
  const standup = await db.query.Standups.findFirst({
    with: {
      author: true,
    },
    // make sure user can only retrieve standups from their workspace
    where: and(
      eq(Standups.id, id),
      eq(Standups.workspaceId, user.workspaceId!),
    ),
  });
  if (!standup) throw new Error("No standup found");

  return NextResponse.json(
    {
      name: standup.name,
      channelId: standup.channelId,
      scheduleCron: standup.scheduleCron,
      summaryCron: standup.summaryCron,
      id: standup.id,
      author: {
        id: standup.author?.id || standup.authorId,
      },
      createdAt: standup.createdAt,
      updatedAt: standup.updatedAt,
      members: standup.members,
    },
    { status: 200 },
  );
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  const id = params.id;
  if (!id) throw new Error("id is required");
  const user = await getUser(req);
  const deleted = await db
    .delete(Standups)
    .where(
      and(eq(Standups.id, id), eq(Standups.workspaceId, user.workspaceId!)),
    )
    .returning()
    .execute();

  return NextResponse.json(
    {
      id,
      deleted,
    },
    { status: 200 },
  );
};
