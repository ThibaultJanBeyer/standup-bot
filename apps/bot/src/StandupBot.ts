import { randomUUID } from "crypto";
import { App } from "@slack/bolt";
import { CronJob } from "cron";

import {
  notWorkingClickHandler,
  startStandupClickHandler,
} from "./methods/100_initStandup";
import { handleUserMessage } from "./methods/120_startStandup";
import { ConversationState } from "./methods/conversationState";
import {
  BotStateMachine,
  createBotStateMachine,
} from "./methods/createStateMachines";
import { db, eq, Standups } from "./orm";

let validator = {
  set: (target: any, key: any, value: any) => {
    console.log(
      `The property ${key} has been updated with ${value} in ${target}`,
    );
    return true;
  },
};

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
  app?: App;
  startJob?: CronJob;
  postJob?: CronJob;
  isConnected: boolean = false;
  botStateMachine: BotStateMachine;

  constructor({ standupId }: { standupId: string }) {
    this.id = standupId;
    this.botStateMachine = createBotStateMachine(this);
  }

  async softUpdate() {
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
  }

  async init() {
    await this.teardown();

    this.conversationState = new Proxy(this.conversationState, validator);

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

    this.botStateMachine.start();
    this.app = new App({
      token: this.token,
      socketMode: true,
      appToken: process.env.SLACK_APP_TOKEN,
    });
    this.app.client.conversations.join({
      token: this.token,
      channel: this.channel,
    });

    this.notButtonId = `no_${randomUUID()}`;
    this.startButtonId = `start_${randomUUID()}`;
    this.app!.action(this.notButtonId, notWorkingClickHandler(this));
    this.app!.action(this.startButtonId, startStandupClickHandler(this));
    this.app!.event("message", handleUserMessage(this));

    this.startJob = new CronJob(
      standup.scheduleCron,
      () => this.botStateMachine.send("INIT"),
      null,
      true,
      // "America/Los_Angeles", can be supplied in future versions
    );
    this.postJob = new CronJob(
      standup.summaryCron,
      () => this.botStateMachine.send("POST"),
      null,
      true,
      // "America/Los_Angeles", can be supplied in future versions
    );
  }

  async teardown() {
    await this.disconnect();
    if (this.botStateMachine) this.botStateMachine.stop();
    if (this.startJob) this.startJob.stop();
    if (this.postJob) this.postJob.stop();
  }

  connect = async () => {
    try {
      if (this.isConnected) await this.disconnect();
      this.isConnected = true;
      if (this.app) await this.app.start(0);
    } catch (e) {
      console.log(e);
    }
  };
  disconnect = async () => {
    try {
      if (!this.isConnected) return;
      this.isConnected = false;
      if (this.app) await this.app!.stop();
    } catch (e) {
      console.log(e);
    }
  };

  stateChangeHandler = () => {
    console.log("Object changed:", this.conversationState);
  };
}
