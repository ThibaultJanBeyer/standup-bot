"use client";

import React from "react";
import Link from "next/link";

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

export default async function StandupList() {
  const [standups, setStandups] = React.useState<Data[]>([]);

  // @TODO refactor to server action for SSR
  React.useEffect(() => {
    (async () => {
      const data = await getStandups();
      setStandups(data);
    })();
  }, []);

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
