import { WebClient } from "@slack/web-api";

export default async (client: WebClient, channelId: string) => {
  // Users from Workspace
  const userList = await client.users.list();
  if (!userList.ok) throw userList;
  const channelIds = await client.conversations.members({
    channel: channelId, // Replace with the ID of the channel you want to list members for
  });
  if (!channelIds.ok) throw channelIds;
  const channelMembers = userList.members?.filter(
    (member) =>
      !member.is_bot &&
      member.name !== "slackbot" &&
      channelIds.members?.includes(member.id!),
  );
  const users = channelMembers?.map((member) => ({
    slackId: member.id,
    name: member.name,
  }));

  return {
    channelId,
    users,
  };
};
