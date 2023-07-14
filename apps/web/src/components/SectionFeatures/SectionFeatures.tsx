import { DetailedHTMLProps, HTMLAttributes } from "react";

import { FeatureCards } from "./FeatureCards";

export const SectionFeatures = ({
  className,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>) => {
  return (
    <section
      className={`grid lg:grid-cols-2 lg:gap-24 ${className}`}
      {...props}
    >
      <div id="feature-anchor">
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
        <FeatureCards />
      </div>
    </section>
  );
};
