"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Form from "@radix-ui/react-form";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import * as zod from "zod";

import { NewStandup } from "@/lib/orm";

import StandupsFormFields, {
  schema as standupsFormFieldsSchema,
} from "./StandupsFormFields";

const schema = zod.object(standupsFormFieldsSchema).strict();

export default () => {
  const { user } = useUser();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const newStandup: Omit<NewStandup, "workspaceId"> = {
      name: data.name,
      channelId: data.channelId,
      scheduleCron: data.scheduleCron,
      summaryCron: data.summaryCron,
      authorId: user!.externalAccounts[0].providerUserId,
      members: data.members,
    };

    fetch("/api/standups/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(newStandup),
    })
      .then((ok) => ok.json())
      .then((ok) => router.push(`/standups/${ok.id}`))
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
