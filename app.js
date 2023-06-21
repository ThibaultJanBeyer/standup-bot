const { App } = require("@slack/bolt");
const schedule = require("node-schedule");
require("dotenv").config();

const token = process.env.SLACK_BOT_TOKEN;

const app = new App({
  token,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

const questions = [
  ":arrow_left: What did you do since last standup?",
  ":sunny: What do you plan to work on today?",
  ":speech_balloon: Any questions, blockers or other thoughts?",
  ":raised_hands: How are you feeling today?",
];

let conversationState = {};

async function startStandup({ channel }) {
  conversationState = {};

  const botUserId = (await app.client.auth.test({ token })).user_id;
  // const members = await app.client.conversations.members({
  //   token,
  //   channel
  // });
  const members = {
    members: ["U056W8Q5V71", "U04MGH8KAE7", "U04MVQV9M17", "U0563UJ72LC"],
  }; // hardcoded to us for now
  for (const member of members.members) {
    if (member === botUserId) continue;
    const conversation = await app.client.conversations.open({
      token,
      users: member,
    });

    const initMessage = await app.client.chat.postMessage({
      token,
      channel: conversation.channel.id,
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
            action_id: "not_working_today_click",
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
            action_id: "start_standup_click",
          },
        },
      ],
    });

    conversationState[member] = {
      initMessageTs: initMessage.ts,
      answers: [],
    };
  }
}

app.action("not_working_today_click", async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  const channel = body.channel.id;
  const ts = body.message.ts;
  await app.client.chat.update({
    token,
    channel,
    ts,
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
  conversationState[body.user.id].answers = null;
  await say("Ok, see you tomorrow :wave:");
});

app.action("start_standup_click", async ({ body, ack }) => {
  // Acknowledge the action
  await ack();
  const channel = body.channel.id;
  const ts = body.message.ts;
  await app.client.chat.update({
    token,
    channel,
    ts,
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
  const conversation = await app.client.conversations.open({
    token,
    users: body.user.id,
  });
  await askQuestion(conversation.channel.id, body.user.id, 0);
});

async function askQuestion(channel, member, index) {
  if (index >= questions.length) {
    await app.client.chat.postMessage({
      token,
      channel,
      text: "Thanks! Got it :muscle:",
    });
    return;
  }
  const questionMessage = await app.client.chat.postMessage({
    token,
    channel,
    text: questions[index],
  });
  if (index === questions.length) return;
  await app.message(async (props) => {
    const { event, message } = props;
    if (
      event.channel !== channel || // not in the same channel
      event.thread_ts || // we don't want to track thread messages
      !message.client_msg_id || // already tracked answer
      conversationState[member].answers.some(
        (answer) => answer.client_msg_id === message.client_msg_id
      )
    )
      return false;
    conversationState[member].answers.push({
      question: questions[index],
      client_msg_id: message.client_msg_id,
      channel,
      questionMessageTs: questionMessage.ts,
    });
    await askQuestion(channel, member, ++index);
    return true;
  });
}

async function postStandup({ channel }) {
  const result = await app.client.chat.postMessage({
    token,
    channel,
    text: "Hello team, submitted responses for Standup:",
  });

  for (const member in conversationState) {
    const answers = conversationState[member].answers;
    await writeUserMessage(channel, result.ts, member, answers);

    const conversation = await app.client.conversations.open({
      token,
      users: member,
    });
    if (answers.length < questions.length)
      await app.client.chat.postMessage({
        token,
        channel: conversation.channel.id,
        text: "Standup Concluded.",
      });
    if (answers === null) continue;
    await app.client.chat.update({
      token,
      channel: conversation.channel.id,
      ts: conversationState[member].initMessageTs,
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
  }
}

async function writeUserMessage(channel, thread, member, answers) {
  let blocks = [];

  // get user to impersonate
  const result = await app.client.users.info({
    token,
    user: member,
  });
  const icon_url = result.user.profile.image_512;
  const username = result.user.profile.display_name_normalized;

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
      const conversation = await app.client.conversations.history({
        token,
        channel: answer.channel,
        oldest: answer.questionMessageTs,
        inclusive: true,
      });
      const answerMessage = conversation.messages.find(
        (message) => message.client_msg_id === answer.client_msg_id
      );
      const noAnswer =
        !answerMessage ||
        !answerMessage.text ||
        answerMessage.text === "" ||
        questions.includes(answerMessage.text);
      if (noAnswer) continue;
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${answer.question}\n${answerMessage.text}`,
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

  await app.client.chat.postMessage({
    token,
    channel,
    username,
    icon_url,
    thread_ts: thread,
    text: "Standup Report",
    blocks,
  });
}

(async () => {
  await app.start(process.env.PORT || 3000);

  console.info("The current time on this server is:", new Date());

  // Schedule a function to run at 7 AM every working day
  schedule.scheduleJob("02 09 * * 1-5", function () {
    startStandup({ channel: process.env.CHANNEL_ID });
  });

  // Schedule post-standup message to be sent at 11 AM every working day
  schedule.scheduleJob("10 09 * * 1-5", function () {
    postStandup({ channel: process.env.CHANNEL_ID });
  });
})();
