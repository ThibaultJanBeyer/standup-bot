import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

import { db, eq, Standups, Users } from "@/lib/orm";

import getUser from "../getUser";

export const GET = async (req: NextRequest) => {
  try {
    const user = await getUser(req);
    const standups = await db.query.Standups.findMany({
      with: {
        author: true,
      },
      where: eq(Standups.workspaceId, user.workspace.id),
    });

    return NextResponse.json(
      {
        standups,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.error();
  }
};
