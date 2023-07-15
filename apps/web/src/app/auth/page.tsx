import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

import { insertUsersFromWorkspace } from "@/lib/insertUsersFromWorkspace";
import { db, Users } from "@/lib/orm";

const getData = async () => {
  const user = await currentUser();

  if (!user) return "no_user";

  const item = await db
    .insert(Users)
    .values({
      clerkId: user.id,
      slackId: user.externalAccounts[0]!.externalId,
    })
    .onConflictDoUpdate({
      target: Users.slackId,
      set: {
        clerkId: user.id,
        slackName: user.externalAccounts[0]!.firstName,
      },
    })
    .returning()
    .execute();

  const workspaceId = item[0]?.workspaceId;
  if (!workspaceId) return "no_workspace";

  insertUsersFromWorkspace(workspaceId);

  return "success";
};

export default async () => {
  const data = await getData();
  if (data === "no_user") redirect("/auth/sign-in");
  if (data === "no_workspace")
    redirect(
      `https://slack.com/oauth/v2/authorize?scope=channels%3Ahistory%2Cchannels%3Ajoin%2Cchannels%3Aread%2Cchat%3Awrite%2Cchat%3Awrite.customize%2Cim%3Ahistory%2Cim%3Aread%2Cim%3Awrite%2Cusers%3Aread&user_scope=&redirect_uri=${encodeURIComponent(
        process.env.SLACK_REDIRECT_URI!,
      )}&client_id=${process.env.SLACK_CLIENT_ID!}&state=${process.env
        .SLACK_CODE!}`,
    );
  if (data === "success")
    redirect(process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || "/");
  return (
    <div>
      <h1>
        {data === "no_user"
          ? "Sign In…"
          : data === "no_workspace"
          ? "Installing the Bot…"
          : data === "success"
          ? "Redirecting…"
          : "Loading…"}
      </h1>
    </div>
  );
};
