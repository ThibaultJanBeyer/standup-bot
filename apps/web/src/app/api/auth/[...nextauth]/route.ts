import NextAuth, { AuthOptions } from "next-auth";
import SlackProvider from "next-auth/providers/slack";

import { insertUsersFromWorkspace } from "@ssb/utils";

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
      if (!slackWorkspaceId) return `${process.env.BOT_URI}/install/slack`;

      insertUsersFromWorkspace(slackWorkspaceId);

      return true;
    },
    async session({ session, token }) {
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

// {
//   web:dev:   user: {
//   web:dev:     id: 'U05D15UFAGK',
//   web:dev:     name: 'thibault.​beyer',
//   web:dev:     email: 'thibault.beyer@gmail.com',
//   web:dev:     image: 'https://secure.gravatar.com/avatar/43e426f6e1002599a5554abb87b8dc01.jpg?s=512&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0003-512.png'
//   web:dev:   },
//   web:dev:   account: {
//   web:dev:     provider: 'slack',
//   web:dev:     type: 'oauth',
//   web:dev:     providerAccountId: 'U05D15UFAGK',
//   web:dev:     ok: true,
//   web:dev:     access_token: 'xoxp-5436666161782-5443198520563-5428795706775-6194c250f3d818d3e3a4c7b586e5eb5e',
//   web:dev:     token_type: 'Bearer',
//   web:dev:     id_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im1CMk1BeUtTbjU1NWlzZDBFYmRoS3g2bmt5QWk5eExxOHJ2Q0ViX25PeVkifQ.eyJpc3MiOiJodHRwczpcL1wvc2xhY2suY29tIiwic3ViIjoiVTA1RDE1VUZBR0siLCJhdWQiOiI1NDM2NjY2MTYxNzgyLjU0NDMzMjc1NTY5MzAiLCJleHAiOjE2OTAyMjI4NTgsImlhdCI6MTY5MDIyMjU1OCwiYXV0aF90aW1lIjoxNjkwMjIyNTU4LCJub25jZSI6IiIsImF0X2hhc2giOiJnS051SjhERUZ2NmJ3TGF6UUV2S0V3IiwiaHR0cHM6XC9cL3NsYWNrLmNvbVwvdGVhbV9pZCI6IlQwNUNVS0w0UlAwIiwiaHR0cHM6XC9cL3NsYWNrLmNvbVwvdXNlcl9pZCI6IlUwNUQxNVVGQUdLIiwiZW1haWwiOiJ0aGliYXVsdC5iZXllckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZGF0ZV9lbWFpbF92ZXJpZmllZCI6MTY4NzAzMDUwMiwibG9jYWxlIjoiZW4tVVMiLCJuYW1lIjoidGhpYmF1bHQuXHUyMDBiYmV5ZXIiLCJwaWN0dXJlIjoiaHR0cHM6XC9cL3NlY3VyZS5ncmF2YXRhci5jb21cL2F2YXRhclwvNDNlNDI2ZjZlMTAwMjU5OWE1NTU0YWJiODdiOGRjMDEuanBnP3M9NTEyJmQ9aHR0cHMlM0ElMkYlMkZhLnNsYWNrLWVkZ2UuY29tJTJGZGYxMGQlMkZpbWclMkZhdmF0YXJzJTJGYXZhXzAwMDMtNTEyLnBuZyIsImdpdmVuX25hbWUiOiJ0aGliYXVsdC5cdTIwMGJiZXllciIsImZhbWlseV9uYW1lIjoiIiwiaHR0cHM6XC9cL3NsYWNrLmNvbVwvdGVhbV9uYW1lIjoibmVvdGVjaCIsImh0dHBzOlwvXC9zbGFjay5jb21cL3RlYW1fZG9tYWluIjoibmVvdGVjaC10YWxrIiwiaHR0cHM6XC9cL3NsYWNrLmNvbVwvdGVhbV9pbWFnZV8yMzAiOiJodHRwczpcL1wvYS5zbGFjay1lZGdlLmNvbVwvODA1ODhcL2ltZ1wvYXZhdGFycy10ZWFtc1wvYXZhXzAwMjUtMjMwLnBuZyIsImh0dHBzOlwvXC9zbGFjay5jb21cL3RlYW1faW1hZ2VfZGVmYXVsdCI6dHJ1ZX0.omX6HVEuFiD106U8xZNR2BToY_0U3D4g0q0NZPjkhyicdre37EaKv0rUgTrCYeFjK-6PSGzWFp9KFrZLlPEnUXnKIMmZxBLhv6ZokS9b51zMeYikDBc8G5jklQDquQ36fCbVCfrwaPv5o7B9MPoqWkGb1fb70hhHOG2BsmU_5zvUvp2eja4JpYIOzqL8QiAr_vXd-DR_25lP47yPXJi4ewosV6ChGTqCK8NTPI7NAyFgHSOhHWdF3MaCwWo-_-x8Ywzhq4_9wj29qR_gE-HxcjfV1cU5XE8v6OYrJDO7YDJVW2TdngcNcNBOHLTxz2rgISGbao2_zgaqsTRizNwrXQ',
//   web:dev:     state: 'J--eVDVr3-sxCHuDvVWfkSCkMdhwiHjidfJhNH10XJw'
//   web:dev:   },
//   web:dev:   profile: {
//   web:dev:     iss: 'https://slack.com',
//   web:dev:     sub: 'U05D15UFAGK',
//   web:dev:     aud: '5436666161782.5443327556930',
//   web:dev:     exp: 1690222858,
//   web:dev:     iat: 1690222558,
//   web:dev:     auth_time: 1690222558,
//   web:dev:     nonce: '',
//   web:dev:     at_hash: 'gKNuJ8DEFv6bwLazQEvKEw',
//   web:dev:     'https://slack.com/team_id': 'T05CUKL4RP0',
//   web:dev:     'https://slack.com/user_id': 'U05D15UFAGK',
//   web:dev:     email: 'thibault.beyer@gmail.com',
//   web:dev:     email_verified: true,
//   web:dev:     date_email_verified: 1687030502,
//   web:dev:     locale: 'en-US',
//   web:dev:     name: 'thibault.​beyer',
//   web:dev:     picture: 'https://secure.gravatar.com/avatar/43e426f6e1002599a5554abb87b8dc01.jpg?s=512&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0003-512.png',
//   web:dev:     given_name: 'thibault.​beyer',
//   web:dev:     family_name: '',
//   web:dev:     'https://slack.com/team_name': 'neotech',
//   web:dev:     'https://slack.com/team_domain': 'neotech-talk',
//   web:dev:     'https://slack.com/team_image_230': 'https://a.slack-edge.com/80588/img/avatars-teams/ava_0025-230.png',
//   web:dev:     'https://slack.com/team_image_default': true
//   web:dev:   },
//   web:dev:   email: undefined,
//   web:dev:   credentials: undefined
//   web:dev: }
