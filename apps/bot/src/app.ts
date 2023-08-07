import { IncomingMessage, ServerResponse } from "http";
import { App } from "@slack/bolt";
import { ParamsIncomingMessage } from "@slack/bolt/dist/receivers/ParamsIncomingMessage";

import { insertUsersFromWorkspace } from "@ssb/utils";
import {
  AFTER_SIGN_IN_URI,
  INSTALL_SLACK_PATH,
  REDIRECT_SLACK_PATH,
  REDIRECT_SLACK_URI,
} from "@ssb/utils/src/constants";

import { deleteWorkspace } from "./methods/deleteWorkspace";
import { postWelcomeMessage } from "./methods/postMessage";
import { logInfo } from "./methods/utils";
import { db, eq, Standups, Workspace, Workspaces } from "./orm";
import { handlers } from "./routes";
import { StandupBot } from "./StandupBot";

const port = Number(process.env.BOT_PORT || 3001);

export class SlackApp extends App {
  standups: Map<string, StandupBot> = new Map(); // standups self-register
  standupIdsByWorkspaceId: Map<string, string[]> = new Map();

  registerStandup(standup: StandupBot) {
    if (this.standups.has(standup.id)) return;
    this.standups.set(standup.id, standup);

    if (this.standupIdsByWorkspaceId.has(standup.slackWorkspaceId)) {
      const standups =
        this.standupIdsByWorkspaceId.get(standup.slackWorkspaceId) || [];
      this.standupIdsByWorkspaceId.set(standup.slackWorkspaceId, [
        ...standups,
        standup.id,
      ]);
    } else {
      this.standupIdsByWorkspaceId.set(standup.slackWorkspaceId, [standup.id]);
    }
  }

  async start() {
    const standups = await db.select().from(Standups).execute();
    for (const standup of standups) {
      if (this.standups.has(standup.id)) continue;
      await new StandupBot({
        standupId: standup.id,
        APP: this,
      }).init();
    }

    this.event("message", async (message) => {
      if (message.ack) await (message as any).ack();
      logInfo("message", message.body.team_id, message.context.userId);
      const slackWorkspaceId = message.body.team_id;
      this.standupIdsByWorkspaceId
        .get(slackWorkspaceId)
        ?.forEach((standupId) => {
          const standup = this.standups.get(standupId);
          if (standup?.token !== message.context.botToken) return;
          standup?.message(message);
        });
    });

    this.event("app_home_opened", async (message) => {
      if (message.ack) await (message as any).ack();
      logInfo("app_home_opened", message.body.team_id, message.context.userId);
      postWelcomeMessage({
        app: this,
        token: message.body.token,
        channel: message.context.userId,
      });
    });

    return super.start();
  }

  constructor(options: any) {
    super({
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      clientId: process.env.SLACK_CLIENT_ID,
      clientSecret: process.env.SLACK_CLIENT_SECRET,
      appToken: process.env.SLACK_APP_TOKEN,
      stateSecret: process.env.SLACK_CODE,
      scopes: [
        "channels:history",
        "channels:join",
        "channels:read",
        "chat:write",
        "chat:write.customize",
        "im:history",
        "im:read",
        "im:write",
        "users:read",
      ],
      customRoutes: handlers.map(({ path, method, handler }) => ({
        path,
        method,
        handler: async (
          req: ParamsIncomingMessage,
          res: ServerResponse<IncomingMessage>,
        ) => handler(this, req, res),
      })),
      redirectUri: REDIRECT_SLACK_URI,
      installerOptions: {
        port,
        redirectUriPath: REDIRECT_SLACK_PATH,
        installPath: INSTALL_SLACK_PATH,
        directInstall: true,
        callbackOptions: {
          success: (installation, installOptions, req, res) => {
            const teamId = installation.team?.id || installation.enterprise?.id;
            logInfo("Successful install", teamId);

            postWelcomeMessage({
              app: this,
              token: installation.bot?.token,
              channel: installation.user.id,
            });

            res.writeHead(302, {
              Location: AFTER_SIGN_IN_URI,
            });
            res.end();
          },
        },
      },
      installationStore: {
        storeInstallation: async (installation) => {
          try {
            // Bolt will pass your handler an installation object
            // Change the lines below so they save to your database
            const slackWorkspaceId =
              installation.isEnterpriseInstall &&
              installation.enterprise !== undefined
                ? installation.enterprise.id
                : installation.team?.id;
            logInfo("Installing", slackWorkspaceId);

            if (!slackWorkspaceId) {
              throw new Error("Workspace ID not found", {
                cause: installation,
              });
            }

            const botToken = installation.bot?.token || "";
            await db
              .insert(Workspaces)
              .values({
                slackWorkspaceId,
                botToken,
                installation,
              })
              .onConflictDoUpdate({
                target: Workspaces.slackWorkspaceId,
                set: { botToken, installation },
              })
              .execute();

            await insertUsersFromWorkspace(slackWorkspaceId, undefined, true);
            return;
          } catch (error: any) {
            logInfo(
              "Failed saving installation data to installationStore",
              error?.message,
            );
            throw error;
          }
        },
        fetchInstallation: async (installQuery) => {
          try {
            // Bolt will pass your handler an installQuery object
            const slackWorkspaceId =
              installQuery.isEnterpriseInstall &&
              installQuery.enterpriseId !== undefined
                ? installQuery.enterpriseId
                : installQuery.teamId;
            logInfo("FetchInstallation", slackWorkspaceId);

            if (!slackWorkspaceId) {
              throw new Error("Workspace ID not found", {
                cause: installQuery,
              });
            }

            const workspaces = await db
              .select()
              .from(Workspaces)
              .where(eq(Workspaces.slackWorkspaceId, slackWorkspaceId))
              .execute();
            const workspace = workspaces[0] as Workspace | undefined;
            if (!workspace) {
              throw new Error("Workspace not found", {
                cause: installQuery,
              });
            }

            return workspace.installation;
          } catch (error: any) {
            logInfo(
              "Failed saving installation data to installationStore",
              error?.message,
            );
            return null as any;
          }
        },
        deleteInstallation: async (installQuery) => {
          // Bolt will pass your handler an installQuery object
          const slackWorkspaceId =
            installQuery.isEnterpriseInstall &&
            installQuery.enterpriseId !== undefined
              ? installQuery.enterpriseId
              : installQuery.teamId;
          deleteWorkspace({ slackWorkspaceId, APP: this });
        },
      },
      ...options,
    });
  }
}

const APP = new SlackApp({});

(async () => {
  await APP.start();
  console.log(`⚡️ Bolt app started on port ${port}`);
})();
