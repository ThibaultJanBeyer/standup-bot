import { DetailedHTMLProps, HTMLAttributes } from "react";

import {
  FeatureCard,
  FeatureCardContent,
  FeatureCardHeader,
} from "@ssb/ui/featureCard";
import { PhoneIcon, UserIcon } from "@ssb/ui/icons";

export const SectionFeatures = ({
  className,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>) => {
  return (
    <section className={`grid grid-cols-2 gap-24 ${className}`} {...props}>
      <div>
        <h2 className="text-gradient mb-5 inline-block">Features</h2>
        <h3 className="font-headline mb-8 inline-block text-6xl">
          Why Choose Stand-Up Bot?
        </h3>
        <p className="mb-10 text-lg">
          Boost your team's productivity and collaboration with Stand-Up Bot for
          Slack. Say goodbye to time-consuming and inefficient stand-up meetings
          and hello to streamlined updates that keep everyone on track. Try
          Stand-Up Bot today and experience the difference!
        </p>
      </div>
      <div>
        <div className="mt-[-6rem] grid grid-cols-2 gap-10">
          <FeatureCard variant="primary" className="mt-[6rem]">
            <FeatureCardHeader variant="primary">25%</FeatureCardHeader>
            <FeatureCardContent variant="primary">
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
          <FeatureCard variant="primary" className="mb-[3rem] mt-[-3rem]">
            <FeatureCardHeader variant="primary">2hs</FeatureCardHeader>
            <FeatureCardContent variant="primary">
              Saves average of 2 hours per week
            </FeatureCardContent>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
};
