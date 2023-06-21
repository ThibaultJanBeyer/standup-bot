"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Form from "@radix-ui/react-form";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import * as zod from "zod";

import { Input } from "@ssb/ui/input";

import { NewStandup } from "@/lib/orm";

import StandupsFormFields, {
  schema as standupsFormFieldsSchema,
} from "../create/StandupsFormFields";

type Data = {
  name: string;
  channelId: string;
  scheduleCron: string;
  summaryCron: string;
  id: string;
  workspaceId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  members: string[];
  authorName: string;
};

async function getData(slackId?: string, id?: string): Promise<Data> {
  const res = await fetch(`/api/standups/${id}?slackId=${slackId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch data");
  const data: Data = await res.json();
  return data;
}

const schema = zod.object(standupsFormFieldsSchema).strict();

export default ({ params: { id } }: { params: { id: string } }) => {
  const { user } = useUser();
  const [data, setData] = useState<Data>();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: data?.name,
      channelId: data?.channelId,
      scheduleCron: data?.scheduleCron,
      summaryCron: data?.summaryCron,
      members: data?.members,
    },
  });

  // unfortunately useUser create an infinite loop on async components, so we need to use useEffect
  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await getData(user.externalAccounts[0].providerUserId, id);
      setData(data);
    })();
  }, [user]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const newStandup: Omit<NewStandup, "workspaceId"> = {
      name: data.name,
      channelId: data.channelId,
      scheduleCron: data.scheduleCron,
      summaryCron: data.summaryCron,
      authorId: user!.externalAccounts[0].providerUserId,
      members: data.members,
    };

    fetch(`/api/standups/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(newStandup),
    })
      .then((ok) => ok.json())
      .then((ok) => router.push(`/standups`))
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Form.Root onSubmit={form.handleSubmit(onSubmit)}>
        <StandupsFormFields {...form} />
      </Form.Root>
    </main>
  );
};
