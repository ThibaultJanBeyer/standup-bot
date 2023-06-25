import { randomUUID } from "crypto";
import {
  AllMiddlewareArgs,
  App,
  SlackAction,
  SlackActionMiddlewareArgs,
} from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import schedule from "node-schedule";

import { db, eq, Standups } from "./orm";

type Answer = {
  question: string;
  client_msg_id: string;
  channel: string;
  questionMessageTs: string;
};

type SlackActionObject = SlackActionMiddlewareArgs<SlackAction> &
  AllMiddlewareArgs<StringIndexed>;

export class StandupBot {
  id: string;
  channel: string = "";
  members?: string[];
  questions: string[] = [
    ":arrow_left: What did you do since last standup?",
    ":sunny: What do you plan to work on today?",
    ":speech_balloon: Any questions, blockers or other thoughts?",
    ":raised_hands: How are you feeling today?",
  ];

  conversationState = {} as {
    [userId: string]: {
      initMessageTs: string;
      answers: Answer[] | null;
    };
  };
  token: string = "";
  app?: App;
  startJob?: schedule.Job;
  postJob?: schedule.Job;
  isConnected: boolean = false;
  notButtonId = `no_${randomUUID()}`;
  startButtonId = `start_${randomUUID()}`;

  constructor({ standupId }: { standupId: string }) {
    this.id = standupId;
  }

  async init() {
    const standup = await db.query.Standups.findFirst({
      with: {
        workspace: true,
      },
      where: eq(Standups.id, this.id),
    });

    if (!standup?.workspace) throw new Error("No standup found");
    this.token = standup.workspace.botToken;
    this.channel = standup.channelId;
    this.members = standup.members;

    this.app = new App({
      token: this.token,
      socketMode: true,
      appToken: process.env.SLACK_APP_TOKEN,
    });
    this.app.client.conversations.join({
      token: this.token,
      channel: this.channel,
    });
    this.app.action(this.notButtonId, this.notWorkingClickHandler);
    this.app.action(this.startButtonId, this.startStandupClickHandler);

    // Schedule a function to run at 7 AM every working day
    this.startJob = schedule.scheduleJob(
      standup.scheduleCron,
      this.startStandup,
    );
    this.postJob = schedule.scheduleJob(standup.summaryCron, this.postStandup);
  }

  async teardown() {
    await this.app!.stop();
    this.startJob!.cancel();
    this.postJob!.cancel();
  }

  connect = async () => {
    this.isConnected = true;
    if (this.app) await this.app.start(0);
  };
  disconnect = async () => {
    this.isConnected = false;
    if (this.app) await this.app!.stop();
  };

  startStandup = async () => {
    const app = this.app!;
    this.conversationState = {};
    const token = this.token!;
    const members = this.members!;

    if (this.isConnected) await this.disconnect();
    await this.connect();

    const botUserId = (await app.client.auth.test({ token })).user_id;

    for (const member of members) {
      if (member === botUserId) continue;
      console.log("Starting standup for", member);
      const conversation = await app.client.conversations.open({
        token,
        users: member,
      });

      if (!conversation?.channel?.id) continue;

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
              action_id: this.notButtonId,
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
              action_id: this.startButtonId,
            },
          },
        ],
      });

      this.conversationState[member] = {
        initMessageTs: initMessage.ts!,
        answers: [],
      };
    }
  };

  notWorkingClickHandler = async ({ body, ack }: SlackActionObject) => {
    await ack();
    const channel = body?.channel?.id;
    const ts = (body as any).message.ts;
    if (!channel || !ts) return;
    await this.app!.client.chat.update({
      token: this.token,
      channel,
      ts,
      text: "Marked: not working today",
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

    this.conversationState[body.user.id].answers = null;
    await this.app!.client.chat.postMessage({
      token: this.token,
      channel,
      text: "Ok, see you tomorrow :wave:",
    });
  };

  startStandupClickHandler = async ({ body, ack }: SlackActionObject) => {
    await ack();
    const channel = body?.channel?.id;
    const ts = (body as any).message.ts;
    if (!channel || !ts) return;
    await this.app!.client.chat.update({
      token: this.token,
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
    const conversation = await this.app!.client.conversations.open({
      token: this.token,
      users: body.user.id,
    });

    if (!conversation?.channel?.id) return;
    await this.askQuestion(conversation.channel.id, body.user.id, 0);
  };

  askQuestion = async (channel: string, member: string, index: number) => {
    const token = this.token;
    const app = this.app!;
    const questions = this.questions;
    const conversationState = this.conversationState;

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
    await app.event("message", async (props) => {
      const { event, message } = props as any;

      if (
        event.channel !== channel || // not in the same channel
        event.thread_ts || // we don't want to track thread messages
        !message.client_msg_id || // already tracked answer
        conversationState[member].answers!.some(
          (answer) => answer.client_msg_id === message.client_msg_id,
        )
      )
        return;
      conversationState[member].answers!.push({
        question: questions[index],
        client_msg_id: message.client_msg_id,
        channel,
        questionMessageTs: questionMessage.ts!,
      });
      await this.askQuestion(channel, member, ++index);
      return;
    });
  };

  postStandup = async () => {
    const app = this.app!;
    const token = this.token;
    const channel = this.channel!;
    const questions = this.questions;
    const conversationState = this.conversationState;

    if (this.isConnected) await this.disconnect();
    await this.connect();

    const result = await app.client.chat.postMessage({
      token,
      channel,
      text: "Hello team, submitted responses for Standup:",
    });

    for (const member in conversationState) {
      const answers = conversationState[member].answers;
      await this.writeUserMessage(channel, result.ts!, member, answers);

      const conversation = await app.client.conversations.open({
        token,
        users: member,
      });
      if (!conversation?.channel?.id || answers === null) continue;
      if (answers.length < questions.length)
        await app.client.chat.postMessage({
          token,
          channel: conversation.channel.id,
          text: "Standup Concluded.",
        });
      await app.client.chat.update({
        token,
        channel: conversation.channel.id,
        ts: conversationState[member].initMessageTs,
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
    }
  };

  writeUserMessage = async (
    channel: string,
    thread_ts: string,
    member: string,
    answers: Answer[] | null,
  ) => {
    const token = this.token;
    const app = this.app!;
    const questions = this.questions;
    let blocks: any = [];

    // get user to impersonate
    const result = await app.client.users.info({
      token,
      user: member,
    });
    const icon_url = result?.user?.profile?.image_512;
    const username = result?.user?.profile?.display_name_normalized;

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
        const answerMessage = conversation?.messages?.find(
          (message) => message.client_msg_id === answer.client_msg_id,
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
      thread_ts,
      text: "Standup Report",
      blocks,
    });
  };
}
