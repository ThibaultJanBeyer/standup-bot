import { randomUUID } from "crypto";
import {
  AllMiddlewareArgs,
  App,
  SlackAction,
  SlackActionMiddlewareArgs,
} from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import { CronJob } from "cron";
import {
  BaseActionObject,
  createMachine,
  interpret,
  Interpreter,
  ResolveTypegenMeta,
  ServiceMap,
  TypegenDisabled,
} from "xstate";

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
  id: string = "";
  channel: string = "";
  members: string[] = [];
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
  startJob?: CronJob;
  postJob?: CronJob;
  isConnected: boolean = false;
  notButtonId = `no_${randomUUID()}`;
  startButtonId = `start_${randomUUID()}`;
  stateMachine: StateMachineType;

  constructor({ standupId }: { standupId: string }) {
    this.id = standupId;

    const machine = createMachine({
      /** @xstate-layout N4IgpgJg5mDOIC5QCED2AXAdASQgGzAGIBlAFQEEAlUgbQAYBdRUAB1VgEt0PUA7ZkAA9EAVgBsmAOwAWEQGYRAJhFKl0xQE4ANCACeiMXMzyNADjka6pyXTnTJpkQF8nOtFgDqAQy4deUQgBFAFUAUTJsAHkAOWJ6JiQQNk5uPgFhBABGaSN7HI0HOkVTRUkFHX0suVNMOmlpM0yzDUtZMRc3DExvX38gsIiYuMyE1nZfNMSM6TpM2uVMzIdTMTE6OkkKxEzbTBXDUyWlNZzTDpB3bp9uPujI0gB9D0jKAGlsaIBxeIFkif4pogWlJiitpCU5JJNJJMlsEABaJZSBpyHaaESSMQaeztVwXLo9G4BO6PZ5vD7fEa-capAGgDJyMSSTBYgqYkSmcxMkRw+EzEEckrSMSOBQaOTnS64AiEAAKkTIP0Sf1p6UQiMwxREGkUYmkTQxBToGh5ekQiismGxkmamMUqJkkq68oiXzlCseABEYqElWMUjw6UJ1Ts5pk9SKRHVVhoDnDisyoyJ6jr1uHsdIXHjeKgIHABO5qQHJvSQw1MOHhY5o1i42aEZliprlNZwxzLCbJE6sNKwEX-mqEZCrQ5FtjY7qNOG4YZjBYSqYZlORE1Vt2rr0oP3VYCEIpG5rVjDUaUoYpdXCMVIoZyZCo1mZdeuXaQKdvA4PVrUzFjw1iLNI8bWMYdDJg0FqzFi9RZk4QA */
      id: "Bot",
      initial: "Idle",
      context: {
        submitted: 0,
      },
      states: {
        Idle: {
          on: {
            START: {
              target: "Waiting",
            },
            POST: "POSTING",
          },
        },
        Waiting: {
          on: {
            QUESTIONS_ANSWERED: [
              {
                target: "Idle",
                cond: (context) => context.submitted >= this.members.length - 1,
                internal: false,
              },
              {
                target: "Waiting",
                actions: [(context) => context.submitted++],
              },
            ],
            NOT_WORKING: [
              {
                target: "Idle",
                cond: (context) => context.submitted >= this.members.length - 1,
                internal: false,
              },
              {
                target: "Waiting",
                actions: [(context) => context.submitted++],
              },
            ],
          },
        },
        POSTING: {
          on: {
            POST_DONE: "Idle",
          },
        },
      },
      schema: {
        events: {} as
          | { type: "START" }
          | { type: "QUESTIONS_ANSWERED" }
          | { type: "NOT_WORKING" }
          | { type: "POST" }
          | { type: "POST_DONE" },
      },
      predictableActionArguments: true,
      preserveActionOrder: true,
    });

    this.stateMachine = interpret(machine);
  }

  async softUpdate() {
    const checkStatus = async (check: number): Promise<Boolean> => {
      const status = this.stateMachine.getSnapshot().value;
      if (status === "Idle" || check >= 4320) {
        // 12 hours
        await this.teardown();
        await this.init();
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, 10000));
      return await checkStatus(++check);
    };

    return checkStatus(0);
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
    this.questions = standup.questions;

    this.stateMachine.start();
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

    this.startJob = new CronJob(
      standup.scheduleCron,
      this.startStandup,
      null,
      true,
      // "America/Los_Angeles", can be supplied in future versions
    );
    this.postJob = new CronJob(
      standup.summaryCron,
      this.postStandup,
      null,
      true,
      // "America/Los_Angeles", can be supplied in future versions
    );
  }

  async teardown() {
    this.stateMachine.stop();
    await this.disconnect();
    this.startJob!.stop();
    this.postJob!.stop();
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
    this.stateMachine.send("START");

    const app = this.app!;
    this.conversationState = {};
    const token = this.token!;
    const members = this.members!;

    if (this.isConnected) await this.disconnect();
    await this.connect();

    const botUserId = (await app.client.auth.test({ token })).user_id;

    for (const member of members) {
      if (member === botUserId) continue;
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

    this.conversationState[body.user.id]!.answers = null;
    await this.app!.client.chat.postMessage({
      token: this.token,
      channel,
      text: "Ok, see you tomorrow :wave:",
    });

    this.stateMachine.send("NOT_WORKING");
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
      this.stateMachine.send("QUESTIONS_ANSWERED");
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
        conversationState[member]!.answers!.some(
          (answer) => answer.client_msg_id === message.client_msg_id,
        )
      )
        return;
      conversationState[member]!.answers!.push({
        question: questions[index]!,
        client_msg_id: message.client_msg_id,
        channel,
        questionMessageTs: questionMessage.ts!,
      });
      await this.askQuestion(channel, member, ++index);
      return;
    });
  };

  postStandup = async () => {
    this.stateMachine.send("POST");

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
      const answers = conversationState[member]!.answers;
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
        ts: conversationState[member]!.initMessageTs,
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

    this.stateMachine.send("POST_DONE");
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

type StateMachineType = Interpreter<
  {
    submitted: number;
  },
  any,
  | {
      type: "START";
    }
  | {
      type: "QUESTIONS_ANSWERED";
    }
  | {
      type: "NOT_WORKING";
    }
  | {
      type: "POST";
    }
  | {
      type: "POST_DONE";
    },
  {
    value: any;
    context: {
      submitted: number;
    };
  },
  ResolveTypegenMeta<
    TypegenDisabled,
    | {
        type: "START";
      }
    | {
        type: "QUESTIONS_ANSWERED";
      }
    | {
        type: "NOT_WORKING";
      }
    | {
        type: "POST";
      }
    | {
        type: "POST_DONE";
      },
    BaseActionObject,
    ServiceMap
  >
>;
