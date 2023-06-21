"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

import { Standup } from "@ssb/orm";
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

type Data = Standup & { author: { name: string } };

async function getStandups(id?: string): Promise<Data[]> {
  const res = await fetch(`/api/standups?slackId=${id}`, {
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
  const { user } = useUser();
  const [standups, setStandups] = useState<Data[]>([]);

  // unfortunately useUser create an infinite loop on async components, so we need to use useEffect
  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await getStandups(user.externalAccounts[0].providerUserId);
      setStandups(data);
    })();
  }, [user]);

  console.log(standups);

  return (
    <main>
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((standup) => (
          <TableRow key={standup.id}>
            <TableCell className="font-medium">
              <Link href={`/standups/${standup.id}`} className="block">
                {standup.name}
              </Link>
            </TableCell>
            <TableCell>{standup.author.name}</TableCell>
            <TableCell>{standup.createdAt.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
