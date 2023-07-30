import { WebClient } from "@slack/web-api";

import { db, Users } from "@/lib/orm";

export default async function getUsersByChannel(client: WebClient, channelId: string) {
  const userList = await db.select().from(Users).execute();
  const channelIds = await client.conversations.members({
    channel: channelId, // Replace with the ID of the channel you want to list members for
  });
  if (!channelIds.ok) return [];
  const channelMembers = userList.filter(
    (user) => user.slackId && channelIds.members?.includes(user.slackId),
  );
  const users = channelMembers?.map((member) => ({
    slackId: member.slackId,
    name: member.slackName,
  }));
  if (!users) return [];

  return users;
};
