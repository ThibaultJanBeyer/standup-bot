"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Form from "@radix-ui/react-form";
import { SubmitHandler } from "react-hook-form";

import { Button } from "@ssb/ui/button";

import { NewStandup } from "@/lib/orm";

import StandupsFormFields, { FormData } from "../create/StandupsFormFields";

type APIStandupData = FormData & {
  id: string;
};

export default ({ params: { id } }: { params: { id: string } }) => {
  const [data, setData] = useState<APIStandupData>();
  const router = useRouter();

  // @TODO refactor to server action for SSR
  useEffect(() => {
    fetch(`/api/standups/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((ok) => ok.json())
      .then((data) =>
        setData({
          ...data,
          questions: data.questions.map((q: string) => ({ value: q })),
        }),
      )
      .catch((err) => console.error(err));
  }, []);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const updateStandup: Omit<NewStandup, "workspaceId" | "authorId"> = {
      id,
      name: data.name,
      channelId: data.channelId,
      scheduleCron: data.scheduleCron,
      summaryCron: data.summaryCron,
      members: data.members,
      questions: data.questions.map((q) => q.value),
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

  const onDelete = () => {
    if (!confirm("Are you sure you want to delete this standup?")) return;
    fetch(`/api/standups/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
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
        {Boolean(data?.id) && (
          <StandupsFormFields onSubmit={onSubmit} data={data}>
            <div className="grid grid-cols-2 gap-10">
              <Form.Submit asChild>
                <Button type="submit">Update Standup</Button>
              </Form.Submit>
              <Button onClick={onDelete} type="button" variant={"destructive"}>
                Delete Standup
              </Button>
            </div>
          </StandupsFormFields>
        )}
      </div>
    </main>
  );
};
