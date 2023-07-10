import { DetailedHTMLProps, HTMLAttributes } from "react";

import { FeatureCard } from "@ssb/ui/featureCard";
import { CArrowRightIcon, CIconHeart, CIconSearch } from "@ssb/ui/icons";

export const SectionShowcase = ({
  className,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>) => {
  return (
    <section
      className={`grid grid-cols-2 items-start gap-24 ${className}`}
      {...props}
    >
      <FeatureCard variant="primary" className="p-8 text-left">
        <CartTextBlockTitle />
        <CartTextBlock title="What Did You Do Yesterday?" />
        <CartTextBlock title="What Are You Working on Today?" />
        <CartTextBlock title="Any Questions, Blockers or Thoughts?" />
      </FeatureCard>
      <div>
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

const CartTextBlock = ({ title }: { title: string }) => {
  return (
    <div className="mb-3">
      <div className="rounded-md border p-1">{title}</div>
      <ul className="list-disc p-3">
        <li>
          <div className="mb-1 inline-block h-1 w-full bg-gray-700"></div>
        </li>
        <li>
          <div className="mb-1 inline-block h-1 w-1/3 bg-gray-700"></div>
        </li>
      </ul>
    </div>
  );
};

const CartTextBlockTitle = () => {
  return (
    <>
      <div className="mb-5 text-xl">Slack Standup Bot</div>
      <div className="mb-10">
        <div className="mb-3 grid grid-cols-[auto_1fr] items-center gap-4">
          <div className="inline-block bg-[#6D4B26] px-1 text-[#F2C744]">
            @Thibault
          </div>
          <div className="h-1 w-full bg-gray-700"></div>
        </div>
        <div className="mb-5 h-1 w-full bg-gray-700"></div>
        <div className="h-1 w-1/3 bg-gray-700"></div>
      </div>
    </>
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
