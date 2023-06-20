import { App } from '@slack/bolt';
import schedule from 'node-schedule';

type Answer = {
  question: string,
  client_msg_id: string,
  channel: string,
  questionMessageTs: string
}

const token = process.env.SLACK_BOT_TOKEN;

const app = new App({
  token,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

async function getWorkspaceId() {
  const result = await app.client.auth.test({ token });
  return result.team_id;
}

const questions = [
  ':arrow_left: What did you do since last standup?',
  ':sunny: What do you plan to work on today?',
  ':speech_balloon: Any questions, blockers or other thoughts?',
  ':raised_hands: How are you feeling today?',
];

let conversationState = {} as {
  [userId: string]: {
    initMessageTs: string;
    answers: Answer[] | null;
  }
};

async function startStandup({ channel }: { channel: string }) {
  conversationState = {};
  
  const botUserId = (await app.client.auth.test({ token })).user_id;
  const members = await app.client.conversations.members({
    token,
    channel
  });

  if(!members?.members) return

  for (const member of members.members) {
    if (member === botUserId) continue;
    const conversation = await app.client.conversations.open({
      token,
      users: member
    });

    if(!conversation?.channel?.id) continue

    const initMessage = await app.client.chat.postMessage({
      token,
      channel: conversation.channel.id,
      text: 'Hello mate :wave:, it’s standup time!',
      blocks: [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `Hello mate :wave:, it’s standup time!`
          },
          "accessory": {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Not Working Today",
            },
            "action_id": "not_working_today_click"
          }
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `Shall we? :point_right:`
          },
          "accessory": {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Start Standup!",
            },
            "action_id": "start_standup_click"
          }
        }
      ],
    });

    conversationState[member] = {
      initMessageTs: initMessage.ts!,
      answers: []
    };
  }
}

app.action('not_working_today_click', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  const channel = body?.channel?.id;
  const ts = (body as any).message.ts;
  if(!channel || !ts) return
  await app.client.chat.update({
    token,
    channel,
    ts,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `~~ not working today ${new Date().toDateString()} ~~`
        }
      },
    ]
  });
  conversationState[body.user.id].answers = null;
  await say('Ok, see you tomorrow :wave:');
});

app.action('start_standup_click', async ({ body, ack }) => {
  // Acknowledge the action
  await ack();
  const channel = body?.channel?.id;
  const ts = (body as any).message.ts;
  if(!channel || !ts) return
  await app.client.chat.update({
    token,
    channel,
    ts,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `~~ Standup Started ${new Date().toDateString()} ~~`
        }
      },
    ]
  });
  const conversation = await app.client.conversations.open({
    token,
    users: body.user.id
  });
  if(!conversation?.channel?.id) return
  await askQuestion(conversation.channel.id, body.user.id, 0);
});

async function askQuestion(channel: string, member: string, index: number) {
  if (index >= questions.length) {
    await app.client.chat.postMessage({
      token,
      channel,
      text: 'Thanks! Got it :muscle:',
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
    const { event, message } = props as any;
    if(event.channel !== channel // not in the same channel
      || event.thread_ts // we don't want to track thread messages
      || !message.client_msg_id // already tracked answer
      || conversationState[member].answers!.some(answer => answer.client_msg_id === message.client_msg_id))
      return
    conversationState[member].answers!.push({ 
      question: questions[index],
      client_msg_id: message.client_msg_id,
      channel,
      questionMessageTs: questionMessage.ts!
    });
    await askQuestion(channel, member, ++index);
    return
  });
}

async function postStandup({ channel }: { channel: string }) {
  const result = await app.client.chat.postMessage({
    token,
    channel,
    text: 'Hello team, submitted responses for Standup:',
  });

  for (const member in conversationState) {
    const answers = conversationState[member].answers;
    await writeUserMessage(channel, result.ts!, member, answers);

    const conversation = await app.client.conversations.open({
      token,
      users: member
    });
    if(!conversation?.channel?.id || answers === null) continue
    if(answers.length < questions.length)
      await app.client.chat.postMessage({
        token,
        channel: conversation.channel.id,
        text: 'Standup Concluded.',
      });
    await app.client.chat.update({
      token,
      channel: conversation.channel.id,
      ts: conversationState[member].initMessageTs,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `~~ Standup Concluded ${new Date().toDateString()} ~~`
          }
        },
      ]
    });
  }
}

async function writeUserMessage(channel: string, thread_ts: string, member: string, answers: Answer[] | null) {
  let blocks: any = [];

  // get user to impersonate
  const result = await app.client.users.info({
    token,
    user: member
  });
  const icon_url = result?.user?.profile?.image_512;
  const username = result?.user?.profile?.display_name_normalized;

  if(answers === null) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<@${member}> is not working today`
      },
    })
  } else {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<@${member}> posted an update for Standup report:`
      },
    });

    for (const answer of answers) {
      const conversation = await app.client.conversations.history({
        token,
        channel: answer.channel,
        oldest: answer.questionMessageTs,
        inclusive: true,
      });
      const answerMessage = conversation?.messages?.find(message => message.client_msg_id === answer.client_msg_id);
      const noAnswer = !answerMessage || !answerMessage.text || answerMessage.text === '' || questions.includes(answerMessage.text);
      if(noAnswer) continue;
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${answer.question}\n${answerMessage.text}`
        }
      });
    }

    if(blocks.length === 1) {
      blocks = [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<@${member}> did not participate in Standup today`
        },
      }]
    }
  }

  await app.client.chat.postMessage({
    token,
    channel,
    username,
    icon_url,
    thread_ts,
    text: 'Standup Report',
    blocks
  });
}

(async () => {
  await app.start(process.env.PORT || 3000);
  const workspaceId = await getWorkspaceId();
  console.log(`The workspace ID is ${workspaceId}`);

  // Schedule a function to run at 7 AM every working day
  schedule.scheduleJob('0 7 * * 1-5', function() {
    startStandup({ channel: process.env.CHANNEL_ID! })
  });

  // Schedule post-standup message to be sent at 11 AM every working day
  schedule.scheduleJob('0 11 * * 1-5', function() {
    postStandup({ channel: process.env.CHANNEL_ID! })
  });
})();
