import { StandupBot } from "../StandupBot";
import { notWorking } from "./110_notWorking";
import { startStandup } from "./120_startStandup";
import { addUserMeta } from "./addUserMeta";
import { createConversationStateMember } from "./conversationState";
import { openConversation } from "./openConversation";
import { postMessage } from "./postMessage";
import { updateMessage } from "./updateMessage";

export const initStandup = async (BOT: StandupBot) => {
  BOT.botStateMachine.send("INIT");
  const prevConversationState = BOT.conversationState;

  for (const member of BOT.members) {
    BOT.conversationState.users[member] = createConversationStateMember();
    await addUserMeta(BOT, member);
    const channel = await openConversation({
      app: BOT.app,
      token: BOT.token,
      member,
    });
    if (!channel) continue;

    // check previously posted message (if interrupted abruptly)
    if (prevConversationState.users[member]?.botMessages.INIT?.[0]?.ts)
      await updateMessage({
        app: BOT.app,
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
    const initMessage = await postMessage({
      app: BOT.app,
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
    if (!initMessage?.ts) continue;

    BOT.conversationState.users[member]?.botMessages.INIT.push({
      ts: initMessage.ts,
    });
  }

  BOT.botStateMachine.send("INIT_DONE");
};

export const notWorkingClickHandler =
  (BOT: StandupBot) =>
  async ({ body, ack }: any) => {
    const channel = body?.channel?.id;
    const ts = (body as any).message.ts;
    console.info(
      `${new Date().toISOString()} click not working`,
      channel,
      ts,
      BOT.id,
    );
    await ack();
    if (!channel || !ts) return;
    await notWorking({
      app: BOT.app!,
      token: BOT.token,
      channel,
      ts,
    });
    BOT.conversationState.users[body.user.id]!.answers = null;
    BOT.botStateMachine.send("NOT_WORKING");
  };

export const startStandupClickHandler =
  (BOT: StandupBot) =>
  async ({ body, ack }: any) => {
    const channel = body?.channel?.id;
    const ts = (body as any).message.ts;
    console.info(
      `${new Date().toISOString()} click start`,
      channel,
      ts,
      BOT.id,
    );
    await ack();
    if (!channel || !ts) return;
    await startStandup(BOT, { channel, ts, member: body.user.id });
  };
