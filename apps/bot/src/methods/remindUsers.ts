import { StandupBot } from "@/StandupBot";

import { openConversation } from "./openConversation";
import { postMessage } from "./postMessage";
import { typeSafeUserState } from "./utils";

export const remindUsers = async (BOT: StandupBot) => {
  const status = BOT.botStateMachine.getSnapshot().value;
  if (status !== "Waiting") return;
  for (const member of BOT.members) {
    const userState = typeSafeUserState(BOT, member);
    const channel = await openConversation({
      app: BOT.app!,
      token: BOT.token,
      member,
    });
    if (
      !channel ||
      !userState ||
      userState?.answers?.length ||
      !BOT.app ||
      userState?.meta.statusEmoji === ":face_with_thermometer:" ||
      userState?.meta.statusEmoji === ":palm_tree:"
    )
      continue;

    const remindMessage = await postMessage({
      app: BOT.app!,
      token: BOT.token,
      channel,
      text: "Please don’t forget to fill in your updates :hugging_face:",
    });

    if (remindMessage?.ts)
      BOT.conversationState.users[member]?.botMessages.REMINDER.push({
        ts: remindMessage.ts,
      });
  }
};
