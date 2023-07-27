import { IncomingMessage, ServerResponse } from "http";
import { ParamsIncomingMessage } from "@slack/bolt/dist/receivers/ParamsIncomingMessage";

import { type SlackApp } from "../app";
import { handleBody } from "./handleBody";

export const standupHandlerDelete = async (
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

  if (!APP.standups.has(standupId)) return;

  await APP.standups.get(standupId)!.teardown();
  APP.standups.delete(standupId);

  res.writeHead(200);
  res.end(JSON.stringify({ message: "ok" }));
};
