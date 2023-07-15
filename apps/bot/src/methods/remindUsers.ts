import { StandupBot } from "@/StandupBot";

import { typeSafeUserState } from "./utils";

export const remindUsers = async (BOT: StandupBot) => {
  const status = BOT.botStateMachine.getSnapshot().value;
  if (status !== "Waiting") return;
  for (const member of BOT.members) {
    const userState = typeSafeUserState(BOT, member);
    const conversation = await BOT.app!.client.conversations.open({
      token: BOT.token,
      users: member,
    });
    const channel = conversation?.channel?.id;
    if (
      !channel ||
      !userState ||
      userState?.answers?.length ||
      !BOT.app ||
      userState?.meta.statusEmoji === ":face_with_thermometer:" ||
      userState?.meta.statusEmoji === ":palm_tree:"
    )
      continue;

    const remindMessage = await BOT.app.client.chat.postMessage({
      token: BOT.token,
      channel,
      text: "Please don’t forget to fill in your updates :hugging_face:",
    });

    if (!remindMessage.ts) continue;
    BOT.conversationState.users[member]?.botMessages.REMINDER.push({
      ts: remindMessage.ts,
    });
  }
};

export const removeRemindUsers = (BOT: StandupBot) => {
  for (const member of BOT.members) {
    const userState = typeSafeUserState(BOT, member);
    if (!userState) continue;
    for (const message of userState.botMessages.REMINDER) {
      BOT.app?.client.chat.delete({
        token: BOT.token,
        channel: BOT.channel,
        ts: message.ts,
      });
    }
    userState.botMessages.REMINDER = [];
  }
};
