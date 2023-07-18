import { type App } from "@slack/bolt";

type Props = {
  app: App;
  token: string;
  channel: string;
  ts: string;
  text: string;
  blocks: any[];
};

export const updateMessage = async ({
  app,
  token,
  channel,
  ts,
  text,
  blocks,
}: Props) => {
  try {
    return await app.client.chat.update({
      token,
      channel,
      ts,
      text,
      blocks,
    });
  } catch (error) {
    console.error("Error Updating Message", error);
  }
};
