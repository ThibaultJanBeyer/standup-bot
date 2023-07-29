import { StandupBot } from "@/StandupBot";

import { UserState } from "./conversationState";

export const typeSafeUserState = (
  BOT: StandupBot,
  member?: string,
): UserState | undefined => BOT.conversationState.users[member || ""];

export type SlackMessage = {
  body: {
    token: string;
    team_id: string;
    context_team_id: string;
    context_enterprise_id: null;
    api_app_id: string;
    event: {
      type: string;
      subtype: string;
      message: [Object];
      previous_message: [Object];
      channel: string;
      hidden: true;
      ts: string;
      event_ts: string;
      channel_type: string;
    };
    type: string;
    event_id: string;
    event_time: 1689885976;
    authorizations: [[Object]];
    is_ext_shared_channel: false;
    event_context: string;
  };
  payload: {
    type: string;
    subtype: string;
    message: {
      bot_id: string;
      type: string;
      text: string;
      user: string;
      app_id: string;
      blocks: [Array<any>];
      team: string;
      bot_profile: [Object];
      edited: [Object];
      ts: string;
      source_team: string;
      user_team: string;
    };
    previous_message: {
      bot_id: string;
      type: string;
      text: string;
      user: string;
      ts: string;
      app_id: string;
      blocks: [Array<any>];
      team: string;
      bot_profile: [Object];
    };
    channel: string;
    hidden: true;
    ts: string;
    event_ts: string;
    channel_type: string;
  };
  event: {
    thread_ts?: string;
    user?: string;
    type: string;
    subtype: string;
    message: {
      bot_id: string;
      type: string;
      text: string;
      user: string;
      app_id: string;
      blocks: [Array<any>];
      team: string;
      bot_profile: [Object];
      edited: [Object];
      ts: string;
      source_team: string;
      user_team: string;
    };
    previous_message: {
      bot_id: string;
      type: string;
      text: string;
      user: string;
      ts: string;
      app_id: string;
      blocks: [Array<any>];
      team: string;
      bot_profile: [Object];
    };
    channel: string;
    hidden: true;
    ts: string;
    event_ts: string;
    channel_type: string;
  };
  message: {
    client_msg_id?: string;
    type: string;
    subtype: string;
    message: {
      bot_id: string;
      type: string;
      text: string;
      user: string;
      app_id: string;
      blocks: [Array<any>];
      team: string;
      bot_profile: [Object];
      edited: [Object];
      ts: string;
      source_team: string;
      user_team: string;
    };
    previous_message: {
      bot_id: string;
      type: string;
      text: string;
      user: string;
      ts: string;
      app_id: string;
      blocks: [Array<any>];
      team: string;
      bot_profile: [Object];
    };
    channel: string;
    hidden: true;
    ts: string;
    event_ts: string;
    channel_type: string;
  };
  say: [() => void];
  context: {
    userToken: undefined;
    teamId: string;
    botToken: string;
    botId: string;
    botUserId: string;
    isEnterpriseInstall: false;
    retryNum: 0;
    retryReason: string;
  };
  client: any; // WebClient
};
