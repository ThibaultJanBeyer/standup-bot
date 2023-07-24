import { App } from "@slack/bolt";

import { insertUsersFromWorkspace } from "@ssb/utils";

import { db, eq, Standups, Workspace, Workspaces } from "./orm";
import { postStandupHandler } from "./routes/postStandupHandler";
import { StandupBot } from "./StandupBot";

const port = Number(process.env.BOT_PORT || 3001);

export class SlackApp extends App {
  standups: Map<string, StandupBot> = new Map(); // standups self-register
  standupIdsByWorkspaceId: Map<string, string[]> = new Map();

  registerStandup(standup: StandupBot) {
    if (this.standups.has(standup.id)) return;
    this.standups.set(standup.id, standup);

    if (this.standupIdsByWorkspaceId.has(standup.workspaceId)) {
      const standups = this.standupIdsByWorkspaceId.get(standup.workspaceId);
      this.standupIdsByWorkspaceId.set(standup.workspaceId, [
        ...standups!,
        standup.id,
      ]);
    } else {
      this.standupIdsByWorkspaceId.set(standup.workspaceId, [standup.id]);
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
      if (message.ack) (message as any).ack();
      const workspaceId = message.body.team_id;
      this.standupIdsByWorkspaceId.get(workspaceId)?.forEach((standupId) => {
        const standup = APP.standups.get(standupId);
        if (standup?.token !== message.context.botToken) return;
        standup?.message(message);
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
      socketMode: true,
      customRoutes: [
        {
          path: "/bot/slack/init",
          method: ["POST"],
          handler: async (req, res) => postStandupHandler(this, req, res),
        },
      ],
      redirectUri: `${process.env.SLACK_REDIRECT_URI}/slack`,
      installerOptions: {
        port,
        redirectUriPath: "/slack",
        directInstall: true,
        callbackOptions: {
          success: (installation, installOptions, req, res) => {
            console.info("Successful install", installation, installOptions);

            // @todo: send user a thank you message on slack
            res.writeHead(302, {
              Location: `${process.env.WEB_URI}${process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL}`,
            });
            res.end();
          },
        },
      },
      installationStore: {
        storeInstallation: async (installation) => {
          try {
            console.info(
              `${new Date().toISOString()} installing`,
              installation,
            );

            // Bolt will pass your handler an installation object
            // Change the lines below so they save to your database
            const workspaceId =
              installation.isEnterpriseInstall &&
              installation.enterprise !== undefined
                ? installation.enterprise.id
                : installation.team?.id;

            if (!workspaceId) {
              throw new Error("Workspace ID not found", {
                cause: installation,
              });
            }

            const botToken = installation.bot?.token || "";
            await db
              .insert(Workspaces)
              .values({
                workspaceId,
                botToken,
                installation,
              })
              .onConflictDoUpdate({
                target: Workspaces.workspaceId,
                set: { botToken, installation },
              })
              .execute();

            await insertUsersFromWorkspace(workspaceId, undefined, true);
            return;
          } catch (error: any) {
            console.error(
              `${new Date().toISOString()} Failed saving installation data to installationStore`,
              error?.message,
              error?.cause,
              error,
            );
            throw error;
          }
        },
        fetchInstallation: async (installQuery) => {
          try {
            console.info(
              `${new Date().toISOString()} fetchInstallation`,
              installQuery,
            );
            // Bolt will pass your handler an installQuery object
            const workspaceId =
              installQuery.isEnterpriseInstall &&
              installQuery.enterpriseId !== undefined
                ? installQuery.enterpriseId
                : installQuery.teamId;

            if (!workspaceId) {
              throw new Error("Workspace ID not found", {
                cause: installQuery,
              });
            }

            const workspaces = await db
              .select()
              .from(Workspaces)
              .where(eq(Workspaces.workspaceId, workspaceId))
              .execute();
            const workspace = workspaces[0] as Workspace | undefined;
            if (!workspace) {
              throw new Error("Workspace not found", {
                cause: installQuery,
              });
            }

            return workspace.installation;
          } catch (error: any) {
            console.error(
              `${new Date().toISOString()} Failed saving installation data to installationStore`,
              error?.message,
              error?.cause,
              error,
            );
            return null as any;
          }
        },
        deleteInstallation: async (installQuery) => {
          try {
            console.info(
              `${new Date().toISOString()} deleteInstallation`,
              installQuery,
            );
            // Bolt will pass your handler an installQuery object
            const workspaceId =
              installQuery.isEnterpriseInstall &&
              installQuery.enterpriseId !== undefined
                ? installQuery.enterpriseId
                : installQuery.teamId;

            if (!workspaceId) {
              throw new Error("Workspace ID not found", {
                cause: installQuery,
              });
            }

            const workspaces = await db
              .delete(Workspaces)
              .where(eq(Workspaces.workspaceId, workspaceId))
              .returning()
              .execute();
            return workspaces[0];
          } catch (error: any) {
            console.error(
              `${new Date().toISOString()} Failed deleting workspace`,
              error?.message,
              error?.cause,
              error,
            );
            return null as any;
          }
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
