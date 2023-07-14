"use client";

import { motion, useScroll, useTransform } from "framer-motion";

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
    <div className="mt-[-6rem] grid grid-cols-2 gap-10">
      <motion.div style={{ y: yPosAnimDown }}>
        <FeatureCard variant="primary">
          <FeatureCardHeader variant="primary">25%</FeatureCardHeader>
          <FeatureCardContent variant="primary">
            Increase in productivity due to streamlining
          </FeatureCardContent>
        </FeatureCard>
      </motion.div>
      <motion.div style={{ y: yPosAnimUp }}>
        <FeatureCard>
          <FeatureCardHeader className="mb-[3rem]">
            <PhoneIcon className="m-auto h-20 w-20" />
          </FeatureCardHeader>
          <FeatureCardContent>
            20% increase in timely responses
          </FeatureCardContent>
        </FeatureCard>
      </motion.div>
      <motion.div style={{ y: yPosAnimDown }}>
        <FeatureCard>
          <FeatureCardHeader className="mb-[3rem]">
            <UserIcon className="m-auto h-20 w-20" />
          </FeatureCardHeader>
          <FeatureCardContent>
            30% reduction in missed updates
          </FeatureCardContent>
        </FeatureCard>
      </motion.div>
      <motion.div style={{ y: yPosAnimUp }}>
        <FeatureCard variant="primary">
          <FeatureCardHeader variant="primary">2hs</FeatureCardHeader>
          <FeatureCardContent variant="primary">
            Saves average of 2 hours per week
          </FeatureCardContent>
        </FeatureCard>
      </motion.div>
    </div>
  );
};
