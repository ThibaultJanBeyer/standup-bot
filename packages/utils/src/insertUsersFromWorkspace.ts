import { WebClient } from "@slack/web-api";

import { eq, sql, Workspaces } from "@ssb/orm";

import { db, Users } from "./lib/orm";
import { cacheItem, hasCachedItem } from "./simpleMemoryCache";

export const insertUsersFromWorkspace = async (
  slackWorkspaceId: string,
  webClient?: WebClient,
  force?: boolean,
) => {
  if (!force && hasCachedItem(`insertUsersFromWorkspace:${slackWorkspaceId}`))
    return;

  let client = webClient;
  if (!client) {
    const workspaces = await db
      .select()
      .from(Workspaces)
      .where(eq(Workspaces.slackWorkspaceId, slackWorkspaceId))
      .execute();
    const token = workspaces[0]?.botToken;
    if (!token) return;
    client = new WebClient(token);
  }

  // Users from Workspace
  const userList = await client.users.list();
  if (!userList.ok) {
    console.error(userList);
    throw new Error("Error getting users from Slack");
  }

  if (userList?.members?.length) {
    const members = userList.members.flatMap((member) => {
      if (member.is_bot || member.name === "slackbot" || !member.id) return [];
      return [
        {
          slackId: member.id,
          slackName: member.name || "",
          email: member.profile?.email || "",
          slackWorkspaceId,
        },
      ];
    });

    console.info("insertUsersFromWorkspace", members);

    await db
      .insert(Users)
      .values(members)
      .onConflictDoUpdate({
        target: Users.slackId,
        set: {
          slackName: sql`EXCLUDED.slack_name`,
          slackWorkspaceId,
        },
      })
      .execute();
  }

  cacheItem(
    `insertUsersFromWorkspace:${slackWorkspaceId}`,
    true,
    5 * 60 * 1000,
  );
};
