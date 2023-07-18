import { type App } from "@slack/bolt";

type Props = {
  app: App;
  token: string;
  channel: string;
  oldest: string;
};

export const getHistory = async ({ app, token, channel, oldest }: Props) => {
  try {
    return await app.client.conversations.history({
      token,
      channel,
      oldest,
      inclusive: true,
    });
  } catch (error) {
    console.error("Error Getting History", error);
  }
};
