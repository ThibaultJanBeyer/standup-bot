import NextAuth, { AuthOptions } from "next-auth";
import SlackProvider from "next-auth/providers/slack";

import { insertUsersFromWorkspace } from "@ssb/utils";
import { AUTH_BOT_URI } from "@ssb/utils/src/constants";

import { isTokenValid } from "@/lib/helpers";
import { db, eq, Users, Workspaces } from "@/lib/orm";

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET!,
  providers: [
    SlackProvider({
      clientId: process.env.SLACK_CLIENT_ID!,
      clientSecret: process.env.SLACK_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.info("login", user.id);

      const item = await db
        .insert(Users)
        .values({
          slackId: user.id,
          slackName: user.name,
          email: user.email,
        })
        .onConflictDoUpdate({
          target: Users.slackId,
          set: {
            slackName: user.name,
            email: user.email,
          },
        })
        .returning()
        .execute();

      const slackWorkspaceId = item[0]?.slackWorkspaceId;
      if (!slackWorkspaceId) return AUTH_BOT_URI;

      insertUsersFromWorkspace(slackWorkspaceId);

      const workspace = await db.query.Workspaces.findFirst({
        where: eq(Workspaces.slackWorkspaceId, slackWorkspaceId),
      });

      if (!(await isTokenValid(workspace?.botToken))) return AUTH_BOT_URI;

      return true;
    },
    async session({ session, token }) {
      const user = await db.query.Users.findFirst({
        where: eq(Users.slackId, token.sub || ""),
      });
      if (!user) throw new Error("User not found");

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          slackWorkspaceId: user.slackWorkspaceId,
        },
      };
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
