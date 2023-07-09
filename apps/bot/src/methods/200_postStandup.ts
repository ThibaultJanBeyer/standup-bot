import { StandupBot } from "@/StandupBot";

export const postStandup = async (BOT: StandupBot) => {
  await BOT.connect();

  if (!BOT.conversationState.report.ts) {
    const result = await BOT.app!.client.chat.postMessage({
      token: BOT.token,
      channel: BOT.channel,
      text: "Hello team, submitted responses for Standup:",
    });

    BOT.conversationState.report.ts = result.ts;
  }

  for (const member of BOT.members) {
    if (BOT.conversationState.users[member]!.botMessages.REPORT.length)
      continue;
    const { blocks, icon_url, username } = await getUserMessage(BOT, member);
    await handlePrivateMessages(BOT, member);
    await BOT.app!.client.chat.postMessage({
      token: BOT.token,
      channel: BOT.channel,
      username,
      icon_url,
      thread_ts: BOT.conversationState.report.ts!,
      text: "Standup Report",
      blocks,
    });
    BOT.conversationState.users[member]!.botMessages.REPORT = blocks;
  }

  BOT.botStateMachine.send("POST_DONE");
};

const handlePrivateMessages = async (BOT: StandupBot, member: string) => {
  const answers = BOT.conversationState.users[member]!.answers;
  const conversation = await BOT.app!.client.conversations.open({
    token: BOT.token,
    users: member,
  });
  const userChannel = conversation?.channel?.id;

  // user reported not working
  if (!userChannel || answers === null) return;

  // user did not finish in time
  if (answers.length < BOT.questions.length)
    await BOT.app!.client.chat.postMessage({
      token: BOT.token,
      channel: userChannel,
      text: "Standup Concluded.",
    });

  // normal behavior
  await BOT.app!.client.chat.update({
    token: BOT.token,
    channel: userChannel,
    ts: BOT.conversationState.users[member]!.botMessages.INIT[0]!.ts,
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

  // get user to impersonate
  const result = await BOT.app!.client.users.info({
    token: BOT.token,
    user: member,
  });
  const icon_url = result?.user?.profile?.image_512;
  const username = result?.user?.profile?.display_name_normalized;
  const answers = BOT.conversationState.users[member]!.answers;

  if (answers === null) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `<@${member}> is not working today`,
      },
    });
  } else {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `<@${member}> posted an update for Standup report:`,
      },
    });

    for (const answer of answers) {
      const conversation = await BOT.app!.client.conversations.history({
        token: BOT.token,
        channel: answer.channel,
        oldest: answer.questionMessageTs,
        inclusive: true,
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
            text: `<@${member}> did not participate in Standup today`,
          },
        },
      ];
    }
  }

  return { blocks, icon_url, username };
};
