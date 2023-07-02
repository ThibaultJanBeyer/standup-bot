import bodyParser from "body-parser";
import express, { Request, Response } from "express";

import { StandupBot } from "./StandupBot";

const app = express();
const port = process.env.PORT || 3001;

const standups: { [standupId: string]: StandupBot } = {};

app.use(bodyParser.json());

app.post("/bot/slack/init", async (req: Request, res: Response) => {
  if (req.headers["x-api-key"] !== process.env.COMMUNICATION_TOKEN)
    return res.status(401).json({ message: "Unauthorized" });

  const standupId = req.body.standupId;
  if (!standupId || typeof standupId !== "string")
    return res.status(400).json({ message: "standupId is required" });

  if (standups[standupId]) standups[standupId].softUpdate();
  else {
    standups[standupId] = new StandupBot({ standupId });
    await standups[standupId].init();
  }

  res.status(200).json({ message: "ok" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
