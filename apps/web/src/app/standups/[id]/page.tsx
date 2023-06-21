"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Form from "@radix-ui/react-form";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import * as zod from "zod";

import { Button } from "@ssb/ui/button";

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

async function getData(id?: string): Promise<Data> {
  const res = await fetch(`/api/standups/${id}`, {
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

export default async ({ params: { id } }: { params: { id: string } }) => {
  const [data, setData] = useState<Data>();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  // @TODO refactor to server action for SSR
  useEffect(() => {
    (async () => {
      const data = await getData(id);
      form.reset({
        name: data?.name,
        channelId: data?.channelId,
        scheduleCron: data?.scheduleCron,
        summaryCron: data?.summaryCron,
        members: data?.members,
      });
      setData(data);
    })();
  }, []);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const updateStandup: Omit<NewStandup, "workspaceId" | "authorId"> = {
      id,
      name: data.name,
      channelId: data.channelId,
      scheduleCron: data.scheduleCron,
      summaryCron: data.summaryCron,
      members: data.members,
    };

    fetch("/api/standups/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(updateStandup),
    })
      .then((ok) => ok.json())
      .then((ok) => router.push(`/standups`))
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-10">
      <div>
        <h1 className="m-10 text-center text-lg">
          Update {data?.name || "loading…"}
        </h1>
        {data && (
          <Form.Root onSubmit={form.handleSubmit(onSubmit)}>
            <StandupsFormFields {...form} />
            <Form.Submit asChild>
              <Button type="submit">Update Standup</Button>
            </Form.Submit>
          </Form.Root>
        )}
      </div>
    </main>
  );
};
