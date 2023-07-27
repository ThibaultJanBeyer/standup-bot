import { IncomingMessage, ServerResponse } from "http";
import { ParamsIncomingMessage } from "@slack/bolt/dist/receivers/ParamsIncomingMessage";

import { type SlackApp } from "../app";
import { StandupBot } from "../StandupBot";
import { handleBody } from "./handleBody";

export const standupHandlerPost = async (
  APP: SlackApp,
  req: ParamsIncomingMessage,
  res: ServerResponse<IncomingMessage>,
) => {
  const { standupId } = await handleBody(req, res);
  if (!standupId || typeof standupId !== "string") {
    res.writeHead(400);
    res.end({ message: "standupId is required" });
    return;
  }

  if (APP.standups.has(standupId)) APP.standups.get(standupId)!.softUpdate();
  else await new StandupBot({ standupId, APP }).init();

  res.writeHead(200);
  res.end(JSON.stringify({ message: "ok" }));
};
