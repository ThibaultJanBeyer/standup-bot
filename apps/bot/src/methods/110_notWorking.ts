import { App } from "@slack/bolt";

import { postMessage } from "./postMessage";
import { updateMessage } from "./updateMessage";

type Props = {
  app: App;
  token: string;
  channel: string;
  ts: string;
};

export const notWorking = async ({ app, token, channel, ts }: Props) => {
  await updateMessage({
    app,
    token,
    channel,
    ts,
    text: "Marked: not working today",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `~~ not working today ${new Date().toDateString()} ~~`,
        },
      },
    ],
  });

  try {
    await postMessage({
      app,
      token,
      channel,
      text: "Ok, see you tomorrow :wave:",
    });
  } catch (error) {
    console.error("Error in notWorking", error);
  }
};
