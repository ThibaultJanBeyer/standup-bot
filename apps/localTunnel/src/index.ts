import express from "express";
import ngrok from "ngrok";

import { setEnvValue } from "@ssb/utils/src/setEnvValue";

const app = express();
const port = 6969;
const portUrlMap = new Map<number, string>();

app.get("/api/urls/3000", (_, res) => res.send(portUrlMap.get(3000)));
app.get("/api/urls/3001", (_, res) => res.send(portUrlMap.get(3001)));
app.get("/api/ping", (_, res) => res.send("pong"));

app.listen(port, async () => {
  const WEB_URI = await ngrok.connect({
    addr: 3000,
    authtoken: process.env.NGROK_AUTH_TOKEN,
    region: "eu",
  });
  portUrlMap.set(3000, WEB_URI);
  const BOT_URI = await ngrok.connect({
    addr: 3001,
    authtoken: process.env.NGROK_AUTH_TOKEN,
    region: "eu",
  });
  portUrlMap.set(3001, BOT_URI);

  // Write updated environment variables to .env file
  setEnvValue("../../.env", "WEB_URI", WEB_URI.split("//")[1]!);
  setEnvValue("../../.env", "BOT_URI", BOT_URI.split("//")[1]!);

  console.log(`
  ---------------------------------
  LocalTunnel on :${port} 
  | :3000 => ${WEB_URI}
  | :3001 => ${BOT_URI}
  ---------------------------------`);
});
