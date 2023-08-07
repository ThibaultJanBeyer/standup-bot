import { type StandupBot } from "@/StandupBot";

import { postMessage } from "./postMessage";
import { updateMessage } from "./updateMessage";

type Props = {
  BOT: StandupBot;
  channel: string;
  ts: string;
};

export const notWorking = async ({ BOT, channel, ts }: Props) => {
  await updateMessage({
    BOT,
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
      app: BOT.app,
      token: BOT.token,
      channel,
      text: "Ok, see you tomorrow :wave:",
    });
  } catch (error) {
    console.error("Error in notWorking", error);
  }
};
