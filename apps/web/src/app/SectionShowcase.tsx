import { DetailedHTMLProps, HTMLAttributes } from "react";

import {
  FeatureCard,
  FeatureCardContent,
  FeatureCardHeader,
} from "@ssb/ui/featureCard";
import { PhoneIcon, UserIcon } from "@ssb/ui/icons";

export const SectionShowcase = ({
  className,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>) => {
  return (
    <section className={`grid grid-cols-2 gap-24 ${className}`} {...props}>
      <div>
        <div className="mt-[-6rem] grid grid-cols-2 gap-10">
          <FeatureCard variant="outlinePrimary" className="mt-[6rem]">
            <FeatureCardHeader>25%</FeatureCardHeader>
            <FeatureCardContent>
              Increase in productivity due to streamlining
            </FeatureCardContent>
          </FeatureCard>
          <FeatureCard className="mb-20">
            <FeatureCardHeader className="mb-[3rem]">
              <PhoneIcon className="m-auto h-20 w-20" />
            </FeatureCardHeader>
            <FeatureCardContent>
              20% increase in timely responses
            </FeatureCardContent>
          </FeatureCard>
          <FeatureCard>
            <FeatureCardHeader className="mb-[3rem]">
              <UserIcon className="m-auto h-20 w-20" />
            </FeatureCardHeader>
            <FeatureCardContent>
              30% reduction in missed updates
            </FeatureCardContent>
          </FeatureCard>
          <FeatureCard
            variant="outlinePrimary"
            className="mb-[3rem] mt-[-3rem]"
          >
            <FeatureCardHeader>2hs</FeatureCardHeader>
            <FeatureCardContent>
              Saves average of 2 hours per week
            </FeatureCardContent>
          </FeatureCard>
        </div>
      </div>
      <div>
        <h2 className="text-gradient mb-5 inline-block">Get Upped’</h2>
        <h3 className="font-headline mb-8 inline-block text-6xl">
          What makes Stand-Up Bot so special?
        </h3>
        <p className="mb-10 text-lg">
          Automate your entire stand-up process with Stand-Up Bot. Set up a
          schedule, choose your questions, and let the bot handle the rest.
        </p>
      </div>
    </section>
  );
};
