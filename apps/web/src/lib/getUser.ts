import { getServerSession } from "next-auth";

import { db, eq, Users } from "@/lib/orm";

import { authOptions } from "../app/api/auth/[...nextauth]/route";

export default async function getUser() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;
  const user = await db.query.Users.findFirst({
    with: {
      workspace: true,
    },
    where: eq(Users.id, userId),
  }).execute();
  if (!user?.workspace || !user.slackWorkspaceId) return null;
  return {
    ...user,
    slackWorkspaceId: user.slackWorkspaceId,
    workspace: {
      ...user.workspace!,
    },
  };
};
