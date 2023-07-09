import { randomUUID } from "crypto";

import { StandupBot } from "@/StandupBot";

export const startStandup = async (
  BOT: StandupBot,
  { channel, ts, member }: { channel: string; ts: string; member: string },
) => {
  await BOT.app!.client.chat.update({
    token: BOT.token,
    channel,
    ts,
    text: "Marked: standup started",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `~~ Standup Started ${new Date().toDateString()} ~~`,
        },
      },
    ],
  });

  await askQuestion(BOT, { channel, member });
};

export const handleUserMessage = (BOT: StandupBot) => async (props: any) => {
  const { event, message } = props;
  const memberState = BOT.conversationState.users[message.user];
  if (!memberState) return;
  const botMessages = memberState.botMessages.START_STANDUP;
  const question = botMessages[botMessages.length - 1];
  const anwers = memberState.answers;

  if (
    !anwers ||
    event.channel_type !== "im" || // we don't want to track group messages
    event.thread_ts || // we don't want to track thread messages
    !message.client_msg_id || // already tracked answer
    anwers.some((answer) => answer.client_msg_id === message.client_msg_id) // not the same answer message
  )
    return;

  anwers.push({
    client_msg_id: message.client_msg_id,
    question: question?.message || "",
    channel: event.channel,
    questionMessageTs: question?.ts || "",
  });

  return await askQuestion(BOT, {
    channel: event.channel,
    member: message.user,
  });
};

const askQuestion = async (
  BOT: StandupBot,
  { channel, member }: { channel: string; member: string },
) => {
  const answerIndex = BOT.conversationState.users[member]?.answers?.length || 0;

  if (answerIndex >= BOT.questions.length)
    return await postFinal(BOT, { channel, member });

  return await postNextQuestion(BOT, { channel, member });
};

const postNextQuestion = async (
  BOT: StandupBot,
  { channel, member }: { channel: string; member: string },
) => {
  const nextMessage =
    BOT.conversationState.users[member]!.botMessages.START_STANDUP.length;

  const message = await BOT.app!.client.chat.postMessage({
    token: BOT.token,
    channel,
    text: BOT.questions[nextMessage],
  });
  BOT.conversationState.users[member]!.botMessages.START_STANDUP.push({
    ts: message.ts!,
    message: BOT.questions[nextMessage] || "",
  });
};

const postFinal = async (
  BOT: StandupBot,
  { channel, member }: { channel: string; member: string },
) => {
  const message = await BOT.app!.client.chat.postMessage({
    token: BOT.token,
    channel,
    text: "Thanks! Got it :muscle:",
  });
  BOT.conversationState.users[member]!.botMessages.START_STANDUP.push({
    ts: message.ts!,
  });
  BOT.botStateMachine.send("QUESTIONS_ANSWERED");
};
