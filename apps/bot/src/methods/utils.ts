import { StandupBot } from "@/StandupBot";

import { UserState } from "./conversationState";

export const typeSafeUserState = (
  BOT: StandupBot,
  member: string,
): UserState | undefined => BOT.conversationState.users[member];
