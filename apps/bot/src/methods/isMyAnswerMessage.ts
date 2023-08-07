import { StandupBot } from "@/StandupBot";

import { checkToken } from "./checkToken";
import { SlackMessage, typeSafeUserState } from "./utils";

export const isMyAnswerMessage =
  (BOT: StandupBot) => async (props: SlackMessage) => {
    if (
      !(await checkToken({
        slackWorkspaceId: BOT.slackWorkspaceId,
        token: BOT.token,
        APP: BOT.app,
      }))
    )
      return false;

    const { event, message, context } = props;
    if (BOT.token !== context.botToken) return false;

    const status = BOT.botStateMachine.getSnapshot().value;
    if (status !== "Waiting") return false;

    const userState = typeSafeUserState(BOT, event.user);
    if (!userState) return false;

    const botMessages = userState.botMessages.START_STANDUP;
    // questions asked matches answers recorded
    if (userState.answers?.length !== botMessages.length - 1) return false;
    // all questions answered
    if (userState.answers?.length === BOT.questions.length) return false;

    const answers = userState.answers;
    if (
      !answers ||
      event.channel_type !== "im" || // we don't want to track group messages
      event.thread_ts || // we don't want to track thread messages
      !message.client_msg_id || // already tracked answer
      answers.some((answer) => answer.client_msg_id === message.client_msg_id) // not the same answer message
    )
      return false;

    return true;
  };
