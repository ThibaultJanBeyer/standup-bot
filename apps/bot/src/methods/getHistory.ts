import { type StandupBot } from "@/StandupBot";

import { checkToken } from "./checkToken";

type Props = {
  BOT: StandupBot;
  channel: string;
  oldest: string;
};

export const getHistory = async ({ BOT, channel, oldest }: Props) => {
  try {
    if (
      !(await checkToken({
        slackWorkspaceId: BOT.slackWorkspaceId,
        token: BOT.token,
        APP: BOT.app,
      }))
    )
      return;
    return await BOT.app.client.conversations.history({
      token: BOT.token,
      channel,
      oldest,
      inclusive: true,
    });
  } catch (error) {
    console.error("Error Getting History", error);
  }
};
