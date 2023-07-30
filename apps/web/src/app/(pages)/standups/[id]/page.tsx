import { redirect } from "next/navigation";

import { Skeleton } from "@ssb/ui/skeleton";
import { AUTH_PATH } from "@ssb/utils/src/constants";

import getUser from "@/lib/getUser";
import { and, db, eq, Standups } from "@/lib/orm";

import { StandupUpdateForm } from "./StandupUpdateForm";

const getData = async (id: string) => {
  if (!id) return null;
  const user = await getUser();
  if (!user) return redirect(AUTH_PATH);
  const standup = await db.query.Standups.findFirst({
    with: {
      author: true,
    },
    // make sure user can only retrieve standups from their workspace
    where: and(
      eq(Standups.id, id),
      eq(Standups.slackWorkspaceId, user.slackWorkspaceId),
    ),
  });
  if (!standup) return null;

  return {
    ...standup,
    author: {
      id: standup.author?.id || standup.authorId,
    },
  };
};

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const data = await getData(id);
  if (!data) return "Standup Not Found";

  const formData = {
    ...data,
    questions: data.questions.map((q: string) => ({ value: q })),
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-10">
      <div>
        <h1 className="mb-10 text-center text-lg">
          Update {data?.name || "loading…"}
        </h1>
        {data?.name ? (
          <StandupUpdateForm id={id} data={formData} />
        ) : (
          <>
            <Skeleton className="w-full" />
            <Skeleton className="w-full" />
            <Skeleton className="w-full" />
          </>
        )}
      </div>
    </main>
  );
};
