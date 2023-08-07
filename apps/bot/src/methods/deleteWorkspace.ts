import { type SlackApp } from "@/app";

import { db, eq, Standups, Users, Workspaces } from "../orm";
import { logInfo } from "./utils";

export const deleteWorkspace = async ({
  slackWorkspaceId,
  APP,
}: {
  slackWorkspaceId?: string;
  APP: SlackApp;
}) => {
  try {
    if (!slackWorkspaceId) throw new Error("No slackWorkspaceId provided");
    logInfo("handleDeletion", slackWorkspaceId);

    // Delete from DB
    const workspaces = await db
      .delete(Workspaces)
      .where(eq(Workspaces.slackWorkspaceId, slackWorkspaceId))
      .returning()
      .execute();

    const standups = await db
      .delete(Standups)
      .where(eq(Standups.slackWorkspaceId, slackWorkspaceId))
      .returning()
      .execute();

    const users = await db
      .delete(Users)
      .where(eq(Users.slackWorkspaceId, slackWorkspaceId))
      .returning()
      .execute();

    // DELETE Standups from memory
    const standupBots = APP.standupIdsByWorkspaceId.get(slackWorkspaceId);
    standupBots?.forEach((standupId) => {
      APP.standups.get(standupId)?.teardown();
      APP.standups.delete(standupId);
    });
    APP.standupIdsByWorkspaceId.delete(slackWorkspaceId);

    logInfo("deleted", slackWorkspaceId, {
      workspaces,
      standups,
      users,
    });
    return {
      workspaces,
      standups,
      users,
    };
  } catch (error: any) {
    logInfo("Failed deleting workspace", error?.message, error);
    return null as any;
  }
};
