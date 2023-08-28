import { StandupBot } from "@/StandupBot";

import { getHistory } from "./getHistory";
import { openConversation } from "./openConversation";
import { postMessage } from "./postMessage";
import { updateMessage } from "./updateMessage";
import { typeSafeUserState } from "./utils";

export const postStandup = async (BOT: StandupBot) => {
  BOT.botStateMachine.send("POST");

  if (!BOT.conversationState.report.ts) {
    const result = await postMessage({
      app: BOT.app!,
      token: BOT.token,
      channel: BOT.channel,
      text: "Hello team, submitted responses for Standup:",
    });
    if (result) BOT.conversationState.report.ts = result.ts;
  }

  for (const member of BOT.members) {
    const userState = typeSafeUserState(BOT, member);
    if (!userState || userState?.botMessages.REPORT.length) continue;
    const { blocks } = await getUserMessage(BOT, member);
    await handlePrivateMessages(BOT, member);
    await postMessage({
      app: BOT.app,
      token: BOT.token,
      channel: BOT.channel,
      username: userState.meta.username,
      icon_url: userState.meta.iconUrl,
      thread_ts: BOT.conversationState.report.ts!,
      text: "Standup Report",
      blocks,
    });
    userState.botMessages.REPORT = blocks;
  }

  BOT.botStateMachine.send("POST_DONE");
};

const handlePrivateMessages = async (BOT: StandupBot, member: string) => {
  const userState = typeSafeUserState(BOT, member);
  if (!userState) return;

  const channel = await openConversation({
    BOT,
    member,
  });
  // user reported not working
  if (!channel || userState.answers === null) return;

  // user did not finish in time
  if (userState.answers.length < BOT.questions.length)
    await postMessage({
      app: BOT.app!,
      token: BOT.token,
      channel,
      text: "Standup Concluded.",
    });

  // normal behavior
  await updateMessage({
    BOT,
    channel,
    ts: userState.botMessages.INIT[0]!.ts,
    text: "Marked: standup concluded",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `~~ Standup Concluded ${new Date().toDateString()} ~~`,
        },
      },
    ],
  });
};

const getUserMessage = async (BOT: StandupBot, member: string) => {
  let blocks: any = [];
  const userState = typeSafeUserState(BOT, member);
  if (!userState) return { blocks };
  const answers = userState.answers;

  const emoji = `${
    userState.meta.statusEmoji
      ? `(${userState.meta.statusEmoji} ${userState.meta.statusText})`
      : ""
  }`;

  if (answers === null) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `<@${member}> is not working today ${emoji}`,
      },
    });
  } else {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `<@${member}> posted an update:`,
      },
    });

    for (const answer of answers) {
      const conversation = await getHistory({
        BOT,
        channel: answer.channel,
        oldest: answer.questionMessageTs,
      });

      const answerMessage = conversation?.messages?.find(
        (message) => message.client_msg_id === answer.client_msg_id,
      );

      const noAnswer =
        !answerMessage ||
        !answerMessage.text ||
        answerMessage.text === "" ||
        !answer.question ||
        answer.question === "" ||
        BOT.questions.includes(answerMessage.text);
      if (noAnswer) continue;

      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${answer.question}*\n${answerMessage.text}`,
        },
      });
    }

    if (blocks.length === 1) {
      blocks = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `<@${member}> did not participate ${emoji}`,
          },
        },
      ];
    }
  }

  return { blocks };
};
