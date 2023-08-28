import { type StandupBot } from "@/StandupBot";

import { postMessage } from "./postMessage";
import { updateMessage } from "./updateMessage";
import { logInfo } from "./utils";

export const notWorkingClickHandler =
  (BOT: StandupBot) =>
  async ({ body, ack }: any) => {
    const channel = body?.channel?.id;
    const ts = (body as any).message.ts;
    logInfo("click: not working", BOT.slackWorkspaceId);
    await ack();
    if (!channel || !ts) return;
    const notWorkingMessage = await notWorking({
      BOT,
      channel,
      ts,
    });
    BOT.conversationState.users[body.user.id]!.answers = null;
    BOT.conversationState.users[body.user.id]!.botMessages.NOT_WORKING.push({
      ts: notWorkingMessage?.ts || "",
    });
    BOT.botStateMachine.send("NOT_WORKING");
  };

export const checkNotWorkingEmoji = async (BOT: StandupBot, userId: string) => {
  const emoji = BOT.conversationState.users[userId]?.meta.statusEmoji;
  if (emoji !== ":face_with_thermometer:" && emoji !== ":palm_tree:")
    return false;

  logInfo(
    "user not working based on their emoji",
    BOT.slackWorkspaceId,
    userId,
  );
  BOT.conversationState.users[userId]!.answers = null;
  BOT.conversationState.users[userId]!.botMessages.NOT_WORKING.push({ ts: "" });
  BOT.botStateMachine.send("NOT_WORKING");
  return true;
};

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

  return await postMessage({
    app: BOT.app,
    token: BOT.token,
    channel,
    text: `Ok, see you tomorrow :wave: 
(PS: did you know that if you set your status to :face_with_thermometer: or :palm_tree: you will be marked as not working automatically?)`,
  });
};
