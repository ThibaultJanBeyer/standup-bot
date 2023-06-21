import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

import { and, db, eq, Standups } from "@/lib/orm";

import getUser from "../../getUser";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    const id = params.id;
    if (!id) throw new Error("id is required");
    const user = await getUser(req);
    const standup = await db.query.Standups.findFirst({
      with: {
        workspace: true,
      },
      // make sure user can only retrieve standups from their workspace
      where: and(
        eq(Standups.id, id),
        eq(Standups.workspaceId, user.workspace.id),
      ),
    });
    if (!standup) throw new Error("No standup found");

    const { workspace, ...rest } = standup;
    const client = new WebClient(workspace.botToken);
    const author = await client.users.info({ user: standup.authorId });

    return NextResponse.json(
      {
        ...rest,
        authorName: author.user?.name,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 },
    );
  }
};
