import { type StandupBot } from "../StandupBot";
import { checkNotWorkingEmoji } from "./110_notWorking";
import { addUserMeta } from "./addUserMeta";
import { createConversationStateMember } from "./conversationState";
import { openConversation } from "./openConversation";
import { postMessage } from "./postMessage";

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

    // removing for now because the status might expire after the message
    // if (await checkNotWorkingEmoji(BOT, member)) continue;

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
      text: "Hello :wave:, it’s standup time!",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Hello :wave:, it’s standup time!`,
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
