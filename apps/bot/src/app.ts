import bodyParser from "body-parser";
import express, { Request, Response } from "express";

import { db, Standups } from "./orm";
import { StandupBot } from "./StandupBot";

const app = express();
const port = process.env.PORT || 3001;

const standupsStore: { [standupId: string]: StandupBot } = {};

app.use(bodyParser.json());

const createStandups = async () => {
  const standups = await db.select().from(Standups).execute();
  for (const standup of standups) {
    if (standup.id in standupsStore) continue;
    standupsStore[standup.id] = new StandupBot({ standupId: standup.id });
    await standupsStore[standup.id]!.init();
  }
};

app.post("/bot/slack/init", async (req: Request, res: Response) => {
  if (req.headers["x-api-key"] !== process.env.COMMUNICATION_TOKEN)
    return res.status(401).json({ message: "Unauthorized" });

  const standupId = req.body.standupId;
  if (!standupId || typeof standupId !== "string")
    return res.status(400).json({ message: "standupId is required" });

  if (standupsStore[standupId]) standupsStore[standupId]!.softUpdate();
  else {
    standupsStore[standupId] = new StandupBot({ standupId });
    await standupsStore[standupId]!.init();
  }

  res.status(200).json({ message: "ok" });
});

app.delete("/bot/slack/init", async (req: Request, res: Response) => {
  if (req.headers["x-api-key"] !== process.env.COMMUNICATION_TOKEN)
    return res.status(401).json({ message: "Unauthorized" });

  const standupId = req.body.standupId;
  if (!standupId || typeof standupId !== "string")
    return res.status(400).json({ message: "standupId is required" });

  if (!standupsStore[standupId]) {
  } else {
    await standupsStore[standupId]!.teardown();
    delete standupsStore[standupId];
  }

  res.status(200).json({ message: "ok" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  createStandups();
});
