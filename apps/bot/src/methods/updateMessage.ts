import { type StandupBot } from "@/StandupBot";

import { checkToken } from "./checkToken";

type Props = {
  BOT: StandupBot;
  channel: string;
  ts: string;
  text: string;
  blocks: any[];
};

export const updateMessage = async ({
  BOT,
  channel,
  ts,
  text,
  blocks,
}: Props) => {
  try {
    if (
      !(await checkToken({
        slackWorkspaceId: BOT.slackWorkspaceId,
        token: BOT.token,
        APP: BOT.app,
      }))
    )
      return;
    return await BOT.app.client.chat.update({
      token: BOT.token,
      channel,
      ts,
      text,
      blocks,
    });
  } catch (error) {
    console.error("Error Updating Message", error);
  }
};
