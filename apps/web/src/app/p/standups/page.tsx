import React from "react";
import Link from "next/link";

import { Button } from "@ssb/ui/button";

import { db, Standup, Standups } from "@/lib/orm";

const fetchStandups = async (): Promise<Standup[]> => {
  try {
    return await db.select().from(Standups);
  } catch (e) {
    console.error(e);
    return [];
  }
};

export default async function StandupList() {
  const standups = await fetchStandups();
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Button asChild>
        <Link href={`/standups/create`}>Create New Standup</Link>
      </Button>
      {standups.map((standup) => {
        return standup.name;
      })}
    </main>
  );
}
