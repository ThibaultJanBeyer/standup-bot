"use client";

import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Form from "@radix-ui/react-form";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import * as zod from "zod";

import { Button } from "@ssb/ui/button";
import { Input } from "@ssb/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ssb/ui/select";

import { NewStandup } from "@/lib/orm";

async function getData(slackId?: string) {
  if (!slackId) return { users: [], channels: [], loading: true };
  const res = await fetch(`/api/p/slack/lists?slackId=${slackId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
}

export default function Hello() {
  const { user } = useUser();
  // if(!isSignedIn) return null;
  console.log(user?.externalAccounts[0].providerUserId);
  return <div>Hello, {user?.firstName}</div>;
}
