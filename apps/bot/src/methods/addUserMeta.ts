import { StandupBot } from "@/StandupBot";

import { typeSafeUserState } from "./utils";

export const addUserMeta = async (BOT: StandupBot) => {
  for (const member of BOT.members) {
    const userState = typeSafeUserState(BOT, member);
    if (!userState) continue;

    const result = await BOT.app!.client.users.info({
      token: BOT.token,
      user: member,
    });
    userState.meta.iconUrl = result?.user?.profile?.image_512 || "";
    userState.meta.username =
      result?.user?.profile?.display_name_normalized || "";
    userState.meta.statusEmoji = result?.user?.profile?.status_emoji || "";
    userState.meta.statusText = result?.user?.profile?.status_text || "";
  }
};
