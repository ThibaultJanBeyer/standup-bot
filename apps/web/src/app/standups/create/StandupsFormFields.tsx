"use client";

import React, { useEffect, useState } from "react";
import * as Form from "@radix-ui/react-form";
import { FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";
import * as zod from "zod";

import { Input } from "@ssb/ui/input";

type Data = {
  slackId: string;
  name: string;
};

async function getChannels(): Promise<Data[]> {
  const res = await fetch(`/api/slack/channels`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch data");
  const data: { channels: Data[] } = await res.json();
  return data.channels;
}
async function getUsers(channelId?: string): Promise<Data[]> {
  const res = await fetch(
    `/api/slack/users-by-channel?channelId=${channelId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );
  if (!res.ok) throw new Error("Failed to fetch data");
  const data: { users: Data[] } = await res.json();
  return data.users;
}

export const schema = {
  name: zod.string().nonempty({ message: "Name is required" }),
  channelId: zod.string().nonempty({ message: "Channel ID is required" }),
  members: zod
    .array(zod.string())
    .nonempty({ message: "Members are required" }),
  scheduleCron: zod.string().nonempty({ message: "Schedule cron is required" }),
  summaryCron: zod.string().nonempty({ message: "Summary cron is required" }),
};

type Props = {
  register: UseFormRegister<any>;
  formState: {
    errors: FieldErrors<any>;
  };
  watch: UseFormWatch<any>;
};

export default ({ register, formState: { errors }, watch }: Props) => {
  const [channels, setChannels] = useState<Data[]>([]);
  const [users, setUsers] = useState<Data[]>([]);
  const selectedChannel = watch("channelId");

  // @TODO refactor to server action for SSR
  useEffect(() => {
    (async () => {
      const data = await getChannels();
      setChannels(data);
    })();
  }, []);

  useEffect(() => {
    if (!selectedChannel) return;
    (async () => {
      const data = await getUsers(selectedChannel);
      setUsers(data);
    })();
  }, [selectedChannel]);

  return (
    <>
      <Form.Field name="name" className="mb-5">
        <Form.Label>Name</Form.Label>
        {Boolean(errors.name?.message) && (
          <Form.Message className="text-red-600">
            {`(${errors.name?.message})`}
          </Form.Message>
        )}
        <Form.Control asChild>
          <Input {...register("name")} />
        </Form.Control>
      </Form.Field>
      <Form.Field name="channelId" className="mb-5">
        <Form.Label>Channel ID</Form.Label>
        {Boolean(errors.channelId?.message) && (
          <Form.Message className="text-red-600">
            {`(${errors.channelId?.message})`}
          </Form.Message>
        )}
        <Form.Control asChild>
          {channels.length ? (
            <select
              {...register("channelId")}
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
              {...register("members")}
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
          <Input {...register("scheduleCron")} defaultValue="0 7 * * 1-5" />
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
          <Input {...register("summaryCron")} defaultValue="0 11 * * 1-5" />
        </Form.Control>
      </Form.Field>
    </>
  );
};
