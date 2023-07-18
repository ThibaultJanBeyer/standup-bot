import { type App } from "@slack/bolt";

type Props = {
  app: App;
  token: string;
  channel: string;
  text: string;
  blocks?: any[];
  username?: string;
  icon_url?: string;
  thread_ts?: string;
};

export const postMessage = async ({
  app,
  token,
  channel,
  text,
  blocks,
  username,
  icon_url,
  thread_ts,
}: Props) => {
  try {
    return await app.client.chat.postMessage({
      token,
      channel,
      text,
      ...(blocks ? { blocks } : {}),
      ...(username ? { username } : {}),
      ...(icon_url ? { icon_url } : {}),
      ...(thread_ts ? { thread_ts } : {}),
    });
  } catch (error) {
    console.error("Error Posting Message", error);
  }
};
