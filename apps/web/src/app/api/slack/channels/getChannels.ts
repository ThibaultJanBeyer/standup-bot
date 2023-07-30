import { WebClient } from "@slack/web-api";

export default async function getChannels(client: WebClient) {
  const channelList = await client.conversations.list();
  if (!channelList.ok) return [];
  const channels = channelList?.channels?.flatMap((channel) => [
    {
      slackId: channel.id,
      name: channel.name,
    },
  ]);
  if (!channels) return [];
  return channels;
};
