"use client";

import React from "react";
import Link from "next/link";

import { Standup, User } from "@ssb/orm";
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

type Data = Standup & { author?: User };

async function getStandups(): Promise<Data[]> {
  const res = await fetch(`/api/standups`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch data");
  const data: { standups: Data[] } = await res.json();
  return data.standups;
}

export default function StandupList() {
  const [standups, setStandups] = React.useState<Data[]>([]);

  // @TODO refactor to server action for SSR
  React.useEffect(() => {
    (async () => {
      const data = await getStandups();
      setStandups(data);
    })();
  }, []);

  return (
    <main className="mx-auto w-full max-w-5xl">
      <div className="text-center">
        <Button asChild className="mx-auto my-10">
          <Link href={`/standups/create`}>Create New Standup</Link>
        </Button>
      </div>
      <StandupTable data={standups} />
    </main>
  );
}

function StandupTable({ data }: { data: Data[] }) {
  return (
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
        {data.map((standup) => {
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
  );
}
