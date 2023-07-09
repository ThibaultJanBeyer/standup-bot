import { App } from "@slack/bolt";

type Props = {
  app: App;
  token: string;
  step: number;
  channel: string;
  ts: string;
};

export const notWorking = async (props: Props) => {
  const { step = 0 } = props;
  for (let index = step; index < steps.length; index++)
    await steps[index]!(props);
};

const steps = [
  async ({ app, token, channel, ts }: Props) => {
    await app.client.chat.update({
      token,
      channel,
      ts,
      text: "Marked: not working today",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `~~ not working today ${new Date().toDateString()} ~~`,
          },
        },
      ],
    });
  },
  async ({ app, token, channel }: Props) => {
    await app.client.chat.postMessage({
      token,
      channel,
      text: "Ok, see you tomorrow :wave:",
    });
  },
];
