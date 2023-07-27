"use server";

import { NewStandup, Standups } from "@ssb/orm";
import { UPDATE_STANDUP_SLACK_URI } from "@ssb/utils/src/constants";

import getUser from "@/lib/getUser";
import { db } from "@/lib/orm";

import { type FormData } from "../StandupsFormFields";

export async function createAction(data: FormData) {
  const user = await getUser();
  if (!user) return null;

  const newStandup: Omit<NewStandup, "slackWorkspaceId" | "authorId"> = {
    name: data.name,
    channelId: data.channelId,
    scheduleCron: data.scheduleCron,
    summaryCron: data.summaryCron,
    members: data.members,
    questions: data.questions.map((q) => q.value),
  };

  const standup = await db
    .insert(Standups)
    .values({
      authorId: user.id,
      slackWorkspaceId: user.slackWorkspaceId,
      ...newStandup,
    })
    .returning()
    .execute();

  await fetch(UPDATE_STANDUP_SLACK_URI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": process.env.COMMUNICATION_TOKEN!,
    },
    credentials: "include",
    body: JSON.stringify({
      standupId: standup[0]!.id,
    }),
  });

  // redirect in here is broken
}
