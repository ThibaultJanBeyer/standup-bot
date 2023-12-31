import { StandupBot } from "@/StandupBot";

import { isMyAnswerMessage } from "./isMyAnswerMessage";
import { postMessage } from "./postMessage";
import { updateMessage } from "./updateMessage";
import { logInfo, typeSafeUserState } from "./utils";

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

export const startStandup = async (
  BOT: StandupBot,
  { channel, ts, member }: { channel: string; ts: string; member: string },
) => {
  console.info("startStandup", { channel, member });
  await updateMessage({
    BOT,
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
  if (!(await isMyAnswerMessage(BOT)(props))) return;
  // we know that the message is for us as it was vetted using isMyAnswer
  const { event, message } = props;

  logInfo("handleUserMessage", BOT.slackWorkspaceId, event.user);

  const userState = typeSafeUserState(BOT, event.user)!;
  const botMessages = userState.botMessages.START_STANDUP;
  const question = botMessages[botMessages.length - 1];
  const answers = userState.answers;

  answers?.push({
    client_msg_id: message.client_msg_id,
    ts: message.ts,
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
  const userState = typeSafeUserState(BOT, member);
  if (!userState) return;

  const answerIndex = userState.answers?.length || 0;

  if (answerIndex >= BOT.questions.length)
    return await postFinal(BOT, { channel, member });

  return await postNextQuestion(BOT, { channel, member });
};

const postNextQuestion = async (
  BOT: StandupBot,
  { channel, member }: { channel: string; member: string },
) => {
  const userState = typeSafeUserState(BOT, member);
  if (!userState) return;

  const nextMessage = userState.botMessages.START_STANDUP.length;
  if (!BOT.questions[nextMessage]) return;

  const message = await postMessage({
    app: BOT.app,
    token: BOT.token,
    channel,
    text: BOT.questions[nextMessage] || "",
  });
  if (message)
    userState.botMessages.START_STANDUP.push({
      ts: message.ts!,
      message: BOT.questions[nextMessage] || "",
    });
};

const postFinal = async (
  BOT: StandupBot,
  { channel, member }: { channel: string; member: string },
) => {
  const userState = typeSafeUserState(BOT, member);
  if (!userState) return;

  const message = await postMessage({
    app: BOT.app,
    token: BOT.token,
    channel,
    text: "Thanks! Got it :muscle:",
  });
  if (message)
    userState.botMessages.START_STANDUP.push({
      ts: message.ts!,
    });
  BOT.botStateMachine.send("QUESTIONS_ANSWERED");
};
