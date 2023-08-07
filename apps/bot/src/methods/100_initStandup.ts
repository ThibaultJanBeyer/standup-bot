import { type StandupBot } from "../StandupBot";
import { notWorking } from "./110_notWorking";
import { startStandup } from "./120_startStandup";
import { addUserMeta } from "./addUserMeta";
import { createConversationStateMember } from "./conversationState";
import { openConversation } from "./openConversation";
import { postMessage } from "./postMessage";
import { logInfo } from "./utils";

export const initStandup = async (BOT: StandupBot) => {
  BOT.botStateMachine.send("INIT");

  // reset conversation state
  BOT.conversationState = {
    users: {},
    report: {},
  };

  for (const member of BOT.members) {
    BOT.conversationState.users[member] = createConversationStateMember();
    await addUserMeta(BOT, member);
    const channel = await openConversation({
      BOT,
      member,
    });
    if (!channel) continue;

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
    logInfo("click: not working", BOT.slackWorkspaceId);
    await ack();
    if (!channel || !ts) return;
    await notWorking({
      BOT,
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
    logInfo("click: start", BOT.slackWorkspaceId);
    await ack();
    if (!channel || !ts) return;
    await startStandup(BOT, { channel, ts, member: body.user.id });
  };
