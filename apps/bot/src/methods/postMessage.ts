import { type SlackApp } from "@/app";

import { checkToken } from "./checkToken";

type Props = {
  app: SlackApp;
  token: string;
  channel: string;
  text: string;
  blocks?: any[];
  username?: string;
  icon_url?: string;
  thread_ts?: string;
  slackWorkspaceId?: string;
};

export const postMessage = async ({
  app,
  token,
  channel,
  text,
  blocks,
  username,
  icon_url,
  thread_ts,
  slackWorkspaceId,
}: Props) => {
  try {
    if (slackWorkspaceId)
      if (
        !(await checkToken({
          slackWorkspaceId,
          token,
          APP: app,
        }))
      )
        return;
    return await app.client.chat.postMessage({
      token,
      channel,
      text,
      ...(blocks ? { blocks } : {}),
      ...(username ? { username } : {}),
      ...(icon_url ? { icon_url } : {}),
      ...(thread_ts ? { thread_ts } : {}),
    });
  } catch (error) {
    console.error("Error Posting Message", error);
  }
};

export const postWelcomeMessage = async ({
  app,
  token,
  channel,
}: {
  app: SlackApp;
  token?: string;
  channel?: string;
}) => {
  if (!token || !channel) return;
  postMessage({
    app,
    token,
    channel,
    text: "Welcome to your _StandupBot's Home_ :tada:",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Welcome to your _StandupBot's Home_ :tada:",
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `This is a place where the StandupBot will communicate with you.
You can create and manage standups on the website at <${process.env.PROTOCOL}${process.env.WEB_URI}|${process.env.WEB_URI}>.`,
        },
      },
    ],
  });
};
