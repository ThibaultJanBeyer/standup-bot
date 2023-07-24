import { StandupBot } from "@/StandupBot";

import { UserState } from "./conversationState";

export const typeSafeUserState = (
  BOT: StandupBot,
  member?: string,
): UserState | undefined => BOT.conversationState.users[member || ""];

export type SlackMessage = {
  body: {
    token: "uhEjFdJGB2q2uGgr6ARGb61k";
    team_id: "T05CUKL4RP0";
    context_team_id: "T05CUKL4RP0";
    context_enterprise_id: null;
    api_app_id: "A05D19MGCTC";
    event: {
      type: "message";
      subtype: "message_changed";
      message: [Object];
      previous_message: [Object];
      channel: "D05CLP7PYJ3";
      hidden: true;
      ts: "1689885976.000300";
      event_ts: "1689885976.000300";
      channel_type: "im";
    };
    type: "event_callback";
    event_id: "Ev05HVGECH62";
    event_time: 1689885976;
    authorizations: [[Object]];
    is_ext_shared_channel: false;
    event_context: "4-eyJldCI6Im1lc3NhZ2UiLCJ0aWQiOiJUMDVDVUtMNFJQMCIsImFpZCI6IkEwNUQxOU1HQ1RDIiwiY2lkIjoiRDA1Q0xQN1BZSjMifQ";
  };
  payload: {
    type: "message";
    subtype: "message_changed";
    message: {
      bot_id: "B05D19MM4KU";
      type: "message";
      text: "Marked: standup started";
      user: "U05CYBEV96Z";
      app_id: "A05D19MGCTC";
      blocks: [Array<any>];
      team: "T05CUKL4RP0";
      bot_profile: [Object];
      edited: [Object];
      ts: "1689885960.525989";
      source_team: "T05CUKL4RP0";
      user_team: "T05CUKL4RP0";
    };
    previous_message: {
      bot_id: "B05D19MM4KU";
      type: "message";
      text: "Hello mate :wave:, it’s standup time!";
      user: "U05CYBEV96Z";
      ts: "1689885960.525989";
      app_id: "A05D19MGCTC";
      blocks: [Array<any>];
      team: "T05CUKL4RP0";
      bot_profile: [Object];
    };
    channel: "D05CLP7PYJ3";
    hidden: true;
    ts: "1689885976.000300";
    event_ts: "1689885976.000300";
    channel_type: "im";
  };
  event: {
    thread_ts?: string;
    user?: string;
    type: "message";
    subtype: "message_changed";
    message: {
      bot_id: "B05D19MM4KU";
      type: "message";
      text: "Marked: standup started";
      user: "U05CYBEV96Z";
      app_id: "A05D19MGCTC";
      blocks: [Array<any>];
      team: "T05CUKL4RP0";
      bot_profile: [Object];
      edited: [Object];
      ts: "1689885960.525989";
      source_team: "T05CUKL4RP0";
      user_team: "T05CUKL4RP0";
    };
    previous_message: {
      bot_id: "B05D19MM4KU";
      type: "message";
      text: "Hello mate :wave:, it’s standup time!";
      user: "U05CYBEV96Z";
      ts: "1689885960.525989";
      app_id: "A05D19MGCTC";
      blocks: [Array<any>];
      team: "T05CUKL4RP0";
      bot_profile: [Object];
    };
    channel: "D05CLP7PYJ3";
    hidden: true;
    ts: "1689885976.000300";
    event_ts: "1689885976.000300";
    channel_type: "im";
  };
  message: {
    client_msg_id?: string;
    type: "message";
    subtype: "message_changed";
    message: {
      bot_id: "B05D19MM4KU";
      type: "message";
      text: "Marked: standup started";
      user: "U05CYBEV96Z";
      app_id: "A05D19MGCTC";
      blocks: [Array<any>];
      team: "T05CUKL4RP0";
      bot_profile: [Object];
      edited: [Object];
      ts: "1689885960.525989";
      source_team: "T05CUKL4RP0";
      user_team: "T05CUKL4RP0";
    };
    previous_message: {
      bot_id: "B05D19MM4KU";
      type: "message";
      text: "Hello mate :wave:, it’s standup time!";
      user: "U05CYBEV96Z";
      ts: "1689885960.525989";
      app_id: "A05D19MGCTC";
      blocks: [Array<any>];
      team: "T05CUKL4RP0";
      bot_profile: [Object];
    };
    channel: "D05CLP7PYJ3";
    hidden: true;
    ts: "1689885976.000300";
    event_ts: "1689885976.000300";
    channel_type: "im";
  };
  say: [() => void];
  context: {
    userToken: undefined;
    teamId: "T05CUKL4RP0";
    botToken: "xoxb-5436666161782-5440388995237-nt88HaHOMARqAgE7RvYhmlHM";
    botId: "B05D19MM4KU";
    botUserId: "U05CYBEV96Z";
    isEnterpriseInstall: false;
    retryNum: 0;
    retryReason: "";
    updateConversation: [() => void];
  };
  client: any; // WebClient
};
