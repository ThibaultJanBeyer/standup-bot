import { randomUUID } from "crypto";
import { CronJob } from "cron";

import { parseCustomCronString } from "@ssb/utils";

import { SlackApp } from "./app";
import { initStandup } from "./methods/100_initStandup";
import { notWorkingClickHandler } from "./methods/110_notWorking";
import {
  handleUserMessage,
  startStandupClickHandler,
} from "./methods/120_startStandup";
import { postStandup } from "./methods/200_postStandup";
import { checkToken } from "./methods/checkToken";
import { ConversationState } from "./methods/conversationState";
import {
  BotStateMachine,
  createBotStateMachine,
} from "./methods/createStateMachines";
import { subtractMinutes } from "./methods/modifyCron";
import { remindUsers } from "./methods/remindUsers";
import { logInfo } from "./methods/utils";
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
    logInfo("constructor", this.id);
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

      this.slackWorkspaceId = standup.slackWorkspaceId;
      this.token = standup.workspace.botToken;
      this.channel = standup.channelId;
      this.members = standup.members;
      this.questions = standup.questions;
      logInfo("init job", this.slackWorkspaceId);

      if (
        !(await checkToken({
          slackWorkspaceId: this.slackWorkspaceId,
          token: this.token,
          APP: this.app,
        }))
      )
        return;

      this.botStateMachine.start();
      this.app.client.conversations.join({
        token: this.token,
        channel: this.channel,
      });

      this.notButtonId = `no_${randomUUID()}`;
      this.startButtonId = `start_${randomUUID()}`;
      this.app.action(this.notButtonId, notWorkingClickHandler(this));
      this.app.action(this.startButtonId, startStandupClickHandler(this));

      const scheduleCron = parseCustomCronString(standup.scheduleCron);
      const summaryCron = parseCustomCronString(standup.summaryCron);
      this.startJob = new CronJob(
        scheduleCron.cron,
        () => {
          try {
            logInfo("start job", this.slackWorkspaceId);
            initStandup(this);
          } catch (error) {
            console.error("error in start job", error);
          }
        },
        null,
        true,
        scheduleCron.timeZone,
      );

      this.remindJob = new CronJob(
        subtractMinutes(summaryCron.cron, 40),
        () => {
          try {
            logInfo("remind job", this.slackWorkspaceId);
            remindUsers(this);
          } catch (error) {
            console.error("error in post reminder", error);
          }
        },
        null,
        true,
        summaryCron.timeZone,
      );

      this.postJob = new CronJob(
        summaryCron.cron,
        () => {
          try {
            logInfo("post job", this.slackWorkspaceId);
            postStandup(this);
          } catch (error) {
            console.error("error in post job", error);
          }
        },
        null,
        true,
        summaryCron.timeZone,
      );

      this.app.registerStandup(this);
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
