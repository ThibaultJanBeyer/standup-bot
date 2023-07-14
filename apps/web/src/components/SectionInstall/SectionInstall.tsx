import { DetailedHTMLProps, HTMLAttributes } from "react";

import { Button } from "@ssb/ui/button";
import { CSlackIcon, GithubIcon } from "@ssb/ui/icons";

import { RoboHand } from "./RoboHand";

export const handTranslate = {
  x: 100,
  y: -200,
};

export const SectionInstall = ({
  className,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>) => {
  return (
    <section
      className={`grid grid-cols-2 items-end gap-24 ${className}`}
      {...props}
    >
      <div>
        <h1 className="font-headline mb-8 text-7xl">
          Install, Your{" "}
          <span className="text-gradient block">
            Standup
            <br />
            Bot
          </span>
        </h1>
        <p className="mb-10 text-lg">
          Make Stand-ups simple and automated. With your own bot, making it easy
          to catch up with projects.
        </p>
        <div className="grid grid-cols-2 gap-10">
          <a
            href={`https://slack.com/oauth/v2/authorize?scope=channels%3Ahistory%2Cchannels%3Ajoin%2Cchannels%3Aread%2Cchat%3Awrite%2Cchat%3Awrite.customize%2Cim%3Ahistory%2Cim%3Aread%2Cim%3Awrite%2Cusers%3Aread&user_scope=&redirect_uri=${encodeURIComponent(
              process.env.SLACK_REDIRECT_URI!,
            )}&client_id=${process.env.SLACK_CLIENT_ID!}&state=${process.env
              .SLACK_CODE!}`}
            className="inline-flex items-center justify-center bg-white text-sm font-medium text-black shadow-md"
            id="install-cta"
          >
            <CSlackIcon />
            Add to Slack
          </a>
          <Button variant="outlinePrimary" asChild>
            <a
              href="https://github.com/ThibaultJanBeyer/standup-bot"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon className="text-blue mr-1 inline-block h-4 w-4" />{" "}
              Host Yourself
            </a>
          </Button>
        </div>
      </div>
      <div className="relative">
        <RoboHand />
      </div>
    </section>
  );
};
