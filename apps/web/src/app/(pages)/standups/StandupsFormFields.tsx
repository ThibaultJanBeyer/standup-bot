"use client";

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Form from "@radix-ui/react-form";
import {
  FieldErrors,
  FormProvider,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import * as zod from "zod";

import { Button } from "@ssb/ui/button";
import { DeleteIcon } from "@ssb/ui/icons";
import { Input } from "@ssb/ui/input";

import { CronPicker } from "@/components/CronPicker";

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

export default function StandupsFormFields({
  onSubmit,
  data,
  children,
}: Props) {
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
  }, [data, form]);

  const errors = form.formState.errors;

  return (
    <FormProvider {...form}>
      <Form.Root onSubmit={form.handleSubmit(onSubmit)}>
        <FormField name="name" errors={errors} label="Name">
          <Input {...form.register("name")} />
        </FormField>
        <FormField
          name="scheduleCron"
          errors={errors}
          label="Select time to send-out questionnaire (in UTC):"
        >
          <CronPicker
            onChange={(val: string) => form.setValue("scheduleCron", val)}
            registered={form.register("scheduleCron")}
          />
        </FormField>
        <FormField
          name="summaryCron"
          errors={errors}
          label="Select time to send-out summary (in UTC):"
        >
          <CronPicker
            onChange={(val: string) => form.setValue("summaryCron", val)}
            registered={form.register("summaryCron")}
          />
        </FormField>
        <FormField
          name="questions"
          errors={errors}
          label="Questions the BOT is asking:"
        >
          <>
            {questionFields.map((field, index) => (
              <React.Fragment key={field.id}>
                {Boolean(
                  (errors as any).questions?.[index]?.value?.message,
                ) && (
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
                    variant="ghost"
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
          </>
        </FormField>
        <FormField
          name="channelId"
          errors={errors}
          label="Channel (where the summary gets posted)"
        >
          {channels.length ? (
            <select
              {...form.register("channelId")}
              className="bg-default block w-full p-3"
              style={{ borderBottom: "1px dotted rgba(100,100,100,1)" }}
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
            <div>Loading...</div>
          )}
        </FormField>
        <FormField
          name="members"
          errors={errors}
          label="Select users to participate in this standup"
        >
          {!users.length ? (
            <div>
              <em>Select a channel first!</em>
            </div>
          ) : (
            <select
              {...form.register("members")}
              multiple
              className="bg-default block w-full rounded-md p-3"
              style={{ borderBottom: "1px dotted rgba(100,100,100,1)" }}
            >
              {users.map((user) => (
                <option key={user.slackId} value={user.slackId}>
                  {user.name}
                </option>
              ))}
            </select>
          )}
        </FormField>
        {children}
      </Form.Root>
    </FormProvider>
  );
}

const FormField = <T extends keyof FormData>({
  name,
  label,
  errors,
  children,
}: {
  name: T;
  label: string;
  errors: FieldErrors<FormData>;
  children: React.ReactNode;
}) => {
  const error = errors[name]?.message;
  return (
    <Form.Field name={name} className="mb-10">
      <Form.Label className="mb-2 block font-bold">
        {label}
        {error && (
          <Form.Message className="font-normal text-red-600">
            {` (${error})`}
          </Form.Message>
        )}
      </Form.Label>
      <Form.Control asChild>{children}</Form.Control>
    </Form.Field>
  );
};

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
  scheduleCron:
    data?.scheduleCron ||
    `30 6 * * 1-5 {${Intl.DateTimeFormat().resolvedOptions().timeZone}}`,
  summaryCron:
    data?.summaryCron ||
    `0 11 * * 1-5 {${Intl.DateTimeFormat().resolvedOptions().timeZone}}`,
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
