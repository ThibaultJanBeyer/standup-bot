"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Form from "@radix-ui/react-form";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import * as zod from "zod";

import { Button } from "@ssb/ui/button";

import { NewStandup } from "@/lib/orm";

import StandupsFormFields, {
  schema as standupsFormFieldsSchema,
} from "./StandupsFormFields";

const schema = zod.object(standupsFormFieldsSchema).strict();

export default () => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const newStandup: Omit<NewStandup, "workspaceId" | "authorId"> = {
      name: data.name,
      channelId: data.channelId,
      scheduleCron: data.scheduleCron,
      summaryCron: data.summaryCron,
      members: data.members,
      questions: data.questions.split(","),
    };

    // @TODO refactor to server action for SSR
    fetch("/api/standups/create", {
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
        <Form.Submit asChild>
          <Button type="submit">Create Standup</Button>
        </Form.Submit>
      </Form.Root>
    </main>
  );
};
