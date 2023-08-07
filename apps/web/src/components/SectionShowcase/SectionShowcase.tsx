"use client";

import { DetailedHTMLProps, HTMLAttributes } from "react";

import { CArrowRightIcon, CIconHeart, CIconSearch } from "@ssb/ui/icons";

import { FeatureCards } from "./FeatureCards";

export const SectionShowcase = ({
  className,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>) => {
  return (
    <section
      className={`grid-areas-imageTextSlim lg:grid-areas-imageText grid items-start gap-32 md:gap-24 ${className}`}
      {...props}
    >
      <FeatureCards style={{ gridArea: "image" }} />
      <div style={{ gridArea: "text" }}>
        <h2 className="text-gradient mb-5 inline-block">Get Upped’</h2>
        <h3 className="font-headline mb-8 inline-block text-6xl">
          What makes Stand-Up Bot so special?
        </h3>
        <p className="text-l mb-10">
          Automate your entire stand-up process with Stand-Up Bot. Set up a
          schedule, choose your questions, and let the bot handle the rest.
        </p>
        <ShowcaseBullet
          icon={<CArrowRightIcon />}
          title="Real-time Notifications"
          subTitle="Stay in the loop effortlessly, with team updates"
        />
        <ShowcaseBullet
          icon={<CIconSearch />}
          title="Customizable Questions"
          subTitle="Tailor stand-up questions to suit your team's needs"
        />
        <ShowcaseBullet
          icon={<CIconHeart />}
          title="Centralized Reporting"
          subTitle="Easily access and review past stand-up reports "
        />
      </div>
    </section>
  );
};

const ShowcaseBullet = ({
  title,
  subTitle,
  icon,
}: {
  title: string;
  subTitle: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="mb-5 grid grid-cols-[auto_1fr] gap-10">
      <div className="mt-5">{icon}</div>
      <div>
        <div>{title}</div>
        <div className="text-gray-400">{subTitle}</div>
      </div>
    </div>
  );
};
