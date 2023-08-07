import { type StandupBot } from "@/StandupBot";

import { checkToken } from "./checkToken";

type Props = {
  BOT: StandupBot;
  member: string;
};

export const openConversation = async ({ member, BOT }: Props) => {
  try {
    if (
      !(await checkToken({
        slackWorkspaceId: BOT.slackWorkspaceId,
        token: BOT.token,
        APP: BOT.app,
      }))
    )
      return;
    const conversation = await BOT.app.client.conversations.open({
      token: BOT.token,
      users: member,
    });
    return conversation?.channel?.id;
  } catch (error) {
    console.error("Error Opening Conversation", error);
  }
};
