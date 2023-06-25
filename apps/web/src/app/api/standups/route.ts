import { NextRequest, NextResponse } from "next/server";

import getUser from "@/lib/getUser";
import { db, eq, Standups } from "@/lib/orm";

export const GET = async (req: NextRequest) => {
  const user = await getUser(req);
  const standups = await db.query.Standups.findMany({
    with: {
      author: true,
    },
    where: eq(Standups.workspaceId, user.workspaceId!),
  }).execute();

  return NextResponse.json(
    {
      standups,
    },
    { status: 200 },
  );
};
