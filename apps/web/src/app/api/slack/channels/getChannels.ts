import { WebClient } from "@slack/web-api";

export default async (client: WebClient) => {
  const channelList = await client.conversations.list();
  if (!channelList.ok) throw channelList;
  const channels = channelList?.channels?.flatMap((channel) => [
    {
      slackId: channel.id,
      name: channel.name,
    },
  ]);

  return {
    channels,
  };
};
