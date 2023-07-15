export type ConversationState = {
  users: {
    [userId: string]: UserState;
  };
  report: {
    ts?: string;
  };
};

export type UserState = {
  botMessages: {
    INIT: {
      ts: string;
    }[];
    NOT_WORKING: {
      ts: string;
    }[];
    START_STANDUP: {
      ts: string;
      message?: string;
    }[];
    REPORT: {
      ts: string;
    }[];
    REMINDER: {
      ts: string;
    }[];
  };
  answers: Answer[] | null;
  meta: {
    username: string;
    iconUrl: string;
    statusEmoji: string;
    statusText: string;
  };
};

export type Answer = {
  client_msg_id: string;
  question: string;
  channel: string;
  questionMessageTs: string;
};

export const createConversationStateMember = () =>
  ({
    botMessages: {
      INIT: [],
      NOT_WORKING: [],
      START_STANDUP: [],
      REPORT: [],
      REMINDER: [],
    },
    answers: [],
    meta: {
      username: "",
      iconUrl: "",
      statusEmoji: "",
      statusText: "",
    },
  } as UserState);
