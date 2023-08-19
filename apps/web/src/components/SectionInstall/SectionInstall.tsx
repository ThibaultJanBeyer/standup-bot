import { DetailedHTMLProps, HTMLAttributes } from "react";

import { Button } from "@ssb/ui/button";
import { CSlackIcon, GithubIcon } from "@ssb/ui/icons";

import { CTAButtons } from "./CTAButtons";
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
      className={`grid items-end gap-24 lg:grid-cols-2 ${className}`}
      {...props}
    >
      <div>
        <h1 className="font-headline mb-8 text-7xl">
          Install Akira, your{" "}
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
        <div className="grid gap-10 md:grid-cols-2" id="install-cta">
          <CTAButtons />
        </div>
      </div>
      <div className="relative h-[200px]">
        <RoboHand />
      </div>
    </section>
  );
};
