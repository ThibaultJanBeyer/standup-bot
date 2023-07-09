import { randomUUID } from "crypto";

import { StandupBot } from "../StandupBot";
import { notWorking } from "./110_notWorking";
import { startStandup } from "./120_startStandup";
import { createConversationStateMember } from "./conversationState";

export const initStandup = async (BOT: StandupBot) => {
  await BOT.connect();

  const prevConversationState = BOT.conversationState;

  for (const member of BOT.members) {
    BOT.conversationState.users[member] = createConversationStateMember();
    // open private message
    const conversation = await BOT.app!.client.conversations.open({
      token: BOT.token,
      users: member,
    });
    const channel = conversation?.channel?.id;
    if (!channel) continue;

    // check previously posted message (if interrupted abruptly)
    if (prevConversationState.users[member]?.botMessages.INIT?.[0]?.ts)
      await BOT.app!.client.chat.update({
        token: BOT.token,
        channel,
        ts: prevConversationState.users[member]!.botMessages.INIT[0]!.ts,
        text: "---",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `---`,
            },
          },
        ],
      });

    // post question
    const initMessage = await BOT.app!.client.chat.postMessage({
      token: BOT.token,
      channel,
      text: "Hello mate :wave:, it’s standup time!",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Hello mate :wave:, it’s standup time!`,
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "Not Working Today",
            },
            action_id: BOT.notButtonId,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Shall we? :point_right:`,
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "Start Standup!",
            },
            action_id: BOT.startButtonId,
          },
        },
      ],
    });
    if (!initMessage.ts) continue;

    BOT.conversationState.users[member]?.botMessages.INIT.push({
      ts: initMessage.ts,
    });
  }

  BOT.botStateMachine.send("INIT_DONE");
};

export const notWorkingClickHandler =
  (BOT: StandupBot) =>
  async ({ body, ack }: any) => {
    await ack();
    const channel = body?.channel?.id;
    const ts = (body as any).message.ts;
    if (!channel || !ts) return;
    await notWorking({
      app: BOT.app!,
      channel: BOT.channel!,
      step: BOT.conversationState.users[body.user.id]!.botMessages.NOT_WORKING
        .length,
      token: BOT.token,
      ts: ts,
    });
    BOT.conversationState.users[body.user.id]!.answers = null;
    BOT.botStateMachine.send("NOT_WORKING");
  };

export const startStandupClickHandler =
  (BOT: StandupBot) =>
  async ({ body, ack }: any) => {
    await ack();
    const channel = body?.channel?.id;
    const ts = (body as any).message.ts;
    if (!channel || !ts) return;
    await startStandup(BOT, { channel, ts, member: body.user.id });
  };