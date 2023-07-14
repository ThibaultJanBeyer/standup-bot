"use client";

import { motion, MotionValue, useScroll, useTransform } from "framer-motion";

import {
  FeatureCard,
  FeatureCardContent,
  FeatureCardHeader,
} from "@ssb/ui/featureCard";
import { PhoneIcon, UserIcon } from "@ssb/ui/icons";

export const FeatureCards = () => {
  const { scrollY } = useScroll();
  const yPosAnimUp = useTransform(scrollY, [0, 1500], [0, -40]);
  const yPosAnimDown = useTransform(scrollY, [0, 1500], [0, 40]);
  return (
    <div className="grid gap-10 sm:grid-cols-2">
      <Card
        y={yPosAnimDown}
        header="25%"
        variant="primary"
        body="Increase in productivity due to streamlining"
        className="w-56 justify-self-start sm:justify-self-center md:w-full"
      />
      <Card
        y={yPosAnimUp}
        header={<PhoneIcon className="m-auto h-20 w-20" />}
        body="20% increase in timely responses"
        className="w-56 justify-self-end sm:justify-self-center md:w-full"
      />
      <Card
        y={yPosAnimDown}
        header={<UserIcon className="m-auto h-20 w-20" />}
        body="30% reduction in missed updates"
        className="w-56 justify-self-start sm:justify-self-center md:w-full"
      />
      <Card
        y={yPosAnimUp}
        variant="primary"
        header="2hs"
        body="Saves average of 2 hours per week"
        className="w-56 justify-self-end sm:justify-self-center md:w-full"
      />
    </div>
  );
};

const Card = ({
  y,
  header,
  body,
  variant,
  className,
}: {
  y: MotionValue<number>;
  header: JSX.Element | string;
  body: string;
  variant?: "primary";
  className?: string;
}) => {
  return (
    <motion.div style={{ y }} className={className}>
      <FeatureCard variant={variant} className="inline-block h-full w-full">
        <FeatureCardHeader variant={variant}>{header}</FeatureCardHeader>
        <FeatureCardContent variant={variant}>{body}</FeatureCardContent>
      </FeatureCard>
    </motion.div>
  );
};
