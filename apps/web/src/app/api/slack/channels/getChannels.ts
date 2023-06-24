import { WebClient } from "@slack/web-api";

export default async (client: WebClient) => {
  console.log("channels7");
  const channelList = await client.conversations.list();
  console.log("channels8");
  if (!channelList.ok) return [];
  console.log("channels9");
  const channels = channelList?.channels?.flatMap((channel) => [
    {
      slackId: channel.id,
      name: channel.name,
    },
  ]);
  console.log("channels10");
  if (!channels) return [];

  console.log("channels11");
  return channels;
};
