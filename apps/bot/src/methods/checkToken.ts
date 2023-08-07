import { type SlackApp } from "@/app";

import { deleteWorkspace } from "./deleteWorkspace";
import { logInfo } from "./utils";

export const checkToken = async ({
  slackWorkspaceId,
  token,
  APP,
}: {
  slackWorkspaceId: string;
  token: string;
  APP: SlackApp;
}) => {
  try {
    const authResult = await APP.client.auth.test({
      token,
    });
    if (authResult.team_id !== slackWorkspaceId)
      throw new Error("Token does not match workspace");
    return true;
  } catch (error: any) {
    if (error?.data?.error === "invalid_auth"
      || error?.data?.error === "account_inactive")
      await deleteWorkspace({ slackWorkspaceId, APP });
    logInfo("TOKEN ERROR", slackWorkspaceId, error);
    return false;
  }
};
