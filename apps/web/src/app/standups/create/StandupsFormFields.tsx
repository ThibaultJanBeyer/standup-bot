"use client";

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Form from "@radix-ui/react-form";
import {
  FieldValues,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import * as zod from "zod";

import { Button } from "@ssb/ui/button";
import { DeleteIcon } from "@ssb/ui/icons";
import { Input } from "@ssb/ui/input";

const schema = {
  name: zod.string().nonempty({ message: "Name is required" }),
  questions: zod
    .array(
      zod.object({
        value: zod.string().nonempty({ message: "Question is required" }),
      }),
    )
    .nonempty({ message: "Questions are required" }),
  scheduleCron: zod.string().nonempty({ message: "Schedule cron is required" }),
  summaryCron: zod.string().nonempty({ message: "Summary cron is required" }),
  channelId: zod.string().nonempty({ message: "Channel ID is required" }),
  members: zod
    .array(zod.string())
    .nonempty({ message: "Members are required" }),
};

const getDefaultValues = (data?: FormData): FormData => ({
  channelId: data?.channelId || "",
  members: data?.members || [],
  scheduleCron: data?.scheduleCron || "0 5 * * 1-5",
  summaryCron: data?.summaryCron || "0 9 * * 1-5",
  name: data?.name || "",
  questions: data?.questions || [
    { value: ":arrow_left: What did you do since last standup?" },
    { value: ":sunny: What do you plan to work on today?" },
    {
      value: ":speech_balloon: Any questions, blockers or other thoughts?",
    },
    { value: ":raised_hands: How are you feeling today?" },
  ],
});

type Data = {
  slackId: string;
  name: string;
};

export type FormData = {
  name: string;
  channelId: string;
  scheduleCron: string;
  summaryCron: string;
  members: string[];
  questions: { value: string }[];
};

type Props = {
  onSubmit: SubmitHandler<FormData>;
  children: React.ReactNode;
  data?: FormData;
};

export default ({ onSubmit, data, children }: Props) => {
  const [channels, setChannels] = useState<Data[]>([]);
  const [users, setUsers] = useState<Data[]>([]);
  const form = useForm({
    resolver: zodResolver(zod.object(schema).strict()),
    mode: "onChange",
    defaultValues: getDefaultValues(data),
  });

  const selectedChannel = form.watch("channelId");

  const {
    fields: questionFields,
    append,
    remove,
  } = useFieldArray({
    name: "questions",
    control: form.control,
  });

  // @TODO refactor to server action for SSR
  useEffect(() => {
    fetch(`/api/slack/channels`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((ok) => ok.json())
      .then((data) => setChannels(data.channels))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedChannel) return;
    fetch(`/api/slack/users-by-channel?channelId=${selectedChannel}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((ok) => ok.json())
      .then((data) => setUsers(data.users))
      .catch((err) => console.error(err));
  }, [selectedChannel]);

  useEffect(() => {
    if (!data) return;
    form.reset(getDefaultValues(data));
  }, [data]);

  const errors = form.formState.errors;
  console.log(errors);

  return (
    <Form.Root onSubmit={form.handleSubmit(onSubmit)}>
      <Form.Field name="name" className="mb-5">
        <Form.Label>Name</Form.Label>
        {Boolean(errors.name?.message) && (
          <Form.Message className="text-red-600">
            {`(${errors.name?.message})`}
          </Form.Message>
        )}
        <Form.Control asChild>
          <Input {...form.register("name")} />
        </Form.Control>
      </Form.Field>
      <Form.Field name="scheduleCron" className="mb-5">
        <Form.Label>
          Cron expression to start the questionnaire (in UTC):
        </Form.Label>
        {Boolean(errors.scheduleCron?.message) && (
          <Form.Message className="text-red-600">
            {`(${errors.scheduleCron?.message})`}
          </Form.Message>
        )}
        <Form.Control asChild>
          <Input {...form.register("scheduleCron")} />
        </Form.Control>
      </Form.Field>
      <Form.Field name="summaryCron" className="mb-5">
        <Form.Label>Cron expression to send the summary (in UTC):</Form.Label>
        {Boolean(errors.summaryCron?.message) && (
          <Form.Message className="text-red-600">
            {`(${errors.summaryCron?.message})`}
          </Form.Message>
        )}
        <Form.Control asChild>
          <Input {...form.register("summaryCron")} />
        </Form.Control>
      </Form.Field>
      <Form.Field name="questions" className="mb-5">
        <Form.Label>Questions the BOT is asking:</Form.Label>
        {Boolean(errors.questions?.message) && (
          <Form.Message className="text-red-600">
            {`(${errors.questions?.message})`}
          </Form.Message>
        )}
        {questionFields.map((field, index) => (
          <React.Fragment key={field.id}>
            {Boolean((errors as any).questions?.[index]?.value?.message) && (
              <Form.Message className="text-red-600">
                {(errors as any).questions?.[index]?.value?.message}
              </Form.Message>
            )}
            <div
              key={field.id}
              className={`${
                index === questionFields.length - 1 ? "" : "mb-2"
              } grid grid-cols-[1fr_auto] gap-2`}
            >
              <Form.Control asChild>
                <Input
                  key={field.id} // important to include key with field's id
                  {...form.register(`questions.${index}.value`)}
                />
              </Form.Control>
              <Button
                type="button"
                variant="outline"
                onClick={() => remove(index)}
              >
                <DeleteIcon>Delete</DeleteIcon>
              </Button>
            </div>
          </React.Fragment>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => append({ value: "" })}
        >
          Add Question
        </Button>
      </Form.Field>
      <Form.Field name="channelId" className="mb-5">
        <Form.Label>Channel (where the summary gets posted)</Form.Label>
        {Boolean(errors.channelId?.message) && (
          <Form.Message className="text-red-600">
            {`(${errors.channelId?.message})`}
          </Form.Message>
        )}
        <Form.Control asChild>
          {channels.length ? (
            <select
              {...form.register("channelId")}
              className="block w-full rounded-md border-2 border-solid border-gray-300 p-3"
              defaultValue={selectedChannel}
            >
              <option key={""} value={""}>
                Select a channel
              </option>
              {channels.map((channel) => (
                <option key={channel.slackId} value={channel.slackId}>
                  {channel.name}
                </option>
              ))}
            </select>
          ) : (
            "Loading..."
          )}
        </Form.Control>
      </Form.Field>
      <Form.Field name="members" className="mb-5">
        <Form.Label>Select users to participate in this standup</Form.Label>
        {Boolean(errors.members?.message) && (
          <Form.Message className="text-red-600">
            {`(${errors.members?.message})`}
          </Form.Message>
        )}
        {!users.length ? (
          <div>
            <em>Select a channel first!</em>
          </div>
        ) : (
          <Form.Control asChild>
            <select
              {...form.register("members")}
              multiple
              className="block w-full rounded-md border-2 border-solid border-gray-300 p-3"
            >
              {users.map((user) => (
                <option key={user.slackId} value={user.slackId}>
                  {user.name}
                </option>
              ))}
            </select>
          </Form.Control>
        )}
      </Form.Field>
      {children}
    </Form.Root>
  );
};
