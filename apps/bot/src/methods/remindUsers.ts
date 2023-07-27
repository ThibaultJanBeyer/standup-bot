// @TODO check why the bot stopped after the reminder:
// ssb:start: 2023-07-26T05:00:03.359Z waiting
// ssb:start: 2023-07-26T08:15:00.022Z remind job {
// ssb:start:   users: {
// ssb:start:     U04MGH8KAE7: { botMessages: [Object], answers: [], meta: [Object] },
// ssb:start:     U04MVQV9M17: { botMessages: [Object], answers: [], meta: [Object] },
// ssb:start:     U0563UJ72LC: { botMessages: [Object], answers: [], meta: [Object] },
// ssb:start:     U056W8Q5V71: { botMessages: [Object], answers: [], meta: [Object] },
// ssb:start:     U05AVSSLJ3X: { botMessages: [Object], answers: [], meta: [Object] },
// ssb:start:     U05F9KK77FC: { botMessages: [Object], answers: [], meta: [Object] }
// ssb:start:   },
// ssb:start:   report: { ts: '1690275600.307689' }
// ssb:start: } 162564e6-2233-4263-83b2-c4f6b893238c
// ssb:start: 2023-07-26T08:28:09.024Z questions answered 5/5}
// ssb:start: [INFO]  socket-mode:SocketModeClient:0 Disconnecting ...
// ssb:start: [INFO]  socket-mode:SocketModeClient:0 Disconnected from Slack

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
      app: BOT.app,
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
