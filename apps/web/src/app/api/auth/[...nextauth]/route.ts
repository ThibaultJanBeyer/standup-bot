import NextAuth, { AuthOptions } from "next-auth";
import SlackProvider from "next-auth/providers/slack";

import { insertUsersFromWorkspace } from "@ssb/utils";
import { AUTH_BOT_URI } from "@ssb/utils/src/constants";

import { db, eq, Users } from "@/lib/orm";

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
      console.info(`${new Date().toISOString()} login`, user);

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

      return true;
    },
    async session({ session, token }) {
      console.info(`${new Date().toISOString()} session`, session);

      const user = await db.query.Users.findFirst({
        where: eq(Users.slackId, token.sub || ""),
      });
      if (!user) throw new Error("User not found");
      // (session as any).blob = "blob";
      return { ...session, user: { ...session.user, id: user.id } };
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
