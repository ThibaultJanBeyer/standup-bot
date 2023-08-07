import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { eq, Standups } from "@ssb/orm";
import { Button } from "@ssb/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ssb/ui/table";
import { SIGN_OUT_PATH } from "@ssb/utils/src/constants";

import getUser from "@/lib/getUser";
import { db } from "@/lib/orm";

export default async function StandupList() {
  const user = await getUser();
  if (!user) return redirect(SIGN_OUT_PATH);
  const standups = await db.query.Standups.findMany({
    with: {
      author: true,
    },
    where: eq(Standups.slackWorkspaceId, user.slackWorkspaceId),
  }).execute();

  return (
    <main className="mx-auto w-full max-w-5xl">
      <div className="text-center">
        <Button asChild className="mx-auto my-10" variant="outlinePrimary">
          <Link href={`/standups/create`}>Create New Standup</Link>
        </Button>
      </div>
      <Table>
        <TableCaption>A list of your workspaces standups.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standups.map((standup) => {
            const createdAt = new Date(standup.createdAt as any as string);
            return (
              <TableRow key={standup.id}>
                <TableCell className="font-medium">
                  <Link href={`/standups/${standup.id}`} className="block">
                    {standup.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {standup.author?.slackName ||
                    standup.author?.id ||
                    standup.authorId}
                </TableCell>
                <TableCell>{createdAt.toLocaleString()}</TableCell>
                <TableCell>
                  <Button asChild>
                    <Link href={`/standups/${standup.id}`} className="block">
                      Open
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </main>
  );
}
