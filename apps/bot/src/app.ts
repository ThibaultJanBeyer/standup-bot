import bodyParser from "body-parser";
import express, { Request, Response } from "express";

const app = express();
const port = process.env.PORT || 3001;

app.post("/bot", (req: Request, res: Response) => {
  res.send("Hello, world!");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
