"use server";

import { and, eq, Standups } from "@ssb/orm";
import { UPDATE_STANDUP_SLACK_URI } from "@ssb/utils/src/constants";

import getUser from "@/lib/getUser";
import { db } from "@/lib/orm";

export async function deleteAction({ id }: { id: string }) {
  const user = await getUser();
  if (!user) return null;

  const deleted = await db
    .delete(Standups)
    .where(
      and(
        eq(Standups.id, id),
        eq(Standups.slackWorkspaceId, user.slackWorkspaceId),
      ),
    )
    .returning()
    .execute();

  await fetch(UPDATE_STANDUP_SLACK_URI, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": process.env.COMMUNICATION_TOKEN!,
    },
    credentials: "include",
    body: JSON.stringify({
      standupId: deleted[0]!.id,
    }),
  });

  return {
    id,
    deleted,
  };

  // redirect in here is broken
}
