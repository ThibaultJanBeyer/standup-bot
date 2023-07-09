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
  };
  answers: Answer[] | null;
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
    },
    answers: [],
  } as UserState);
