import { randomUUID } from "crypto";
import { App } from "@slack/bolt";
import { CronJob } from "cron";

import { SlackApp } from "./app";
import {
  initStandup,
  notWorkingClickHandler,
  startStandupClickHandler,
} from "./methods/100_initStandup";
import { handleUserMessage } from "./methods/120_startStandup";
import { postStandup } from "./methods/200_postStandup";
import { ConversationState } from "./methods/conversationState";
import {
  BotStateMachine,
  createBotStateMachine,
} from "./methods/createStateMachines";
import { subtractMinutes } from "./methods/modifyCron";
import { remindUsers } from "./methods/remindUsers";
import { db, eq, Standups } from "./orm";

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
  notButtonId = "_notWorking";
  startButtonId = "_startStandup";
  conversationState: ConversationState = {
    users: {},
    report: {},
  };
  token: string = "";
  app: SlackApp;
  startJob?: CronJob;
  postJob?: CronJob;
  remindJob?: CronJob;
  isConnected: boolean = false;
  botStateMachine: BotStateMachine;
  slackWorkspaceId: string = "";

  constructor({ standupId, APP }: { standupId: string; APP: SlackApp }) {
    console.info(`${new Date().toISOString()} constructor`, this.id);
    this.id = standupId;
    this.app = APP;
    this.botStateMachine = createBotStateMachine(this);
  }

  async softUpdate() {
    try {
      const checkStatus = async (check: number): Promise<Boolean> => {
        const status = this.botStateMachine.getSnapshot().value;
        // 12 hours
        if (status === "Idle" || check >= 4320) {
          await this.init();
          return true;
        }

        await new Promise((resolve) => setTimeout(resolve, 10000));
        return await checkStatus(++check);
      };

      return checkStatus(0);
    } catch (error) {
      console.error("error in soft update", error);
    }
  }

  async init() {
    try {
      await this.teardown();
      const standup = await db.query.Standups.findFirst({
        with: {
          workspace: true,
        },
        where: eq(Standups.id, this.id),
      });
      if (!standup?.workspace) throw new Error("No standup found");
      console.info(`${new Date().toISOString()} init`, standup.id);

      this.app.registerStandup(this);
      this.slackWorkspaceId = standup.slackWorkspaceId;
      this.token = standup.workspace.botToken;
      this.channel = standup.channelId;
      this.members = standup.members;
      this.questions = standup.questions;

      this.botStateMachine.start();
      this.app.client.conversations.join({
        token: this.token,
        channel: this.channel,
      });

      this.notButtonId = `no_${randomUUID()}`;
      this.startButtonId = `start_${randomUUID()}`;
      this.app.action(this.notButtonId, notWorkingClickHandler(this));
      this.app.action(this.startButtonId, startStandupClickHandler(this));
      this.app.event("message", async (message) => {
        if (message.ack) await (message as any).ack();
      });

      this.startJob = new CronJob(
        standup.scheduleCron,
        () => {
          try {
            console.info(
              `${new Date().toISOString()} start job`,
              this.conversationState,
              this.id,
            );
            initStandup(this);
          } catch (error) {
            console.error("error in start job", error);
          }
        },
        null,
        true,
        // "America/Los_Angeles", can be supplied in future versions
      );

      this.remindJob = new CronJob(
        subtractMinutes(standup.summaryCron, 45),
        () => {
          try {
            console.info(
              `${new Date().toISOString()} remind job`,
              this.conversationState,
              this.id,
            );
            remindUsers(this);
          } catch (error) {
            console.error("error in post reminder", error);
          }
        },
        null,
        true,
        // "America/Los_Angeles", can be supplied in future versions
      );

      this.postJob = new CronJob(
        standup.summaryCron,
        () => {
          try {
            console.info(
              `${new Date().toISOString()} post job`,
              this.conversationState,
              this.id,
            );
            postStandup(this);
          } catch (error) {
            console.error("error in post job", error);
          }
        },
        null,
        true,
        // "America/Los_Angeles", can be supplied in future versions
      );
    } catch (e) {
      console.error("unhandled error", e);
    }
  }

  async teardown() {
    try {
      if (this.botStateMachine) this.botStateMachine.stop();
      if (this.startJob) this.startJob.stop();
      if (this.postJob) this.postJob.stop();
      if (this.remindJob) this.remindJob.stop();
    } catch (error) {
      console.error("error in teardown", error);
    }
  }

  message = handleUserMessage(this);
}
