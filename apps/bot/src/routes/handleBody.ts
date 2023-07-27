import { IncomingMessage, ServerResponse } from "http";
import { ParamsIncomingMessage } from "@slack/bolt/dist/receivers/ParamsIncomingMessage";

export const handleBody = async (
  req: ParamsIncomingMessage,
  res: ServerResponse<IncomingMessage>,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    res.setHeader("content-type", "appliation/json");

    if (req.headers["x-api-key"] !== process.env.COMMUNICATION_TOKEN) {
      res.writeHead(401);
      res.end({ message: "Unauthorized" });
      reject({ message: "Unauthorized" });
    }

    let body = "";
    req.on("data", (buffer) => {
      body += decodeURIComponent(buffer.toString());
    });
    req.on("end", async () => {
      const result = JSON.parse(body);
      resolve(result);
    });
  });
};
