"use client";

import { motion, useScroll, useTransform } from "framer-motion";

import { FeatureCard } from "@ssb/ui/featureCard";

export const FeatureCards = () => {
  const { scrollY } = useScroll();
  const yPosAnimUp = useTransform(scrollY, [0, 1000, 4000], [0, 0.001, -150]);
  return (
    <motion.div style={{ y: yPosAnimUp }}>
      <FeatureCard
        variant="primary"
        id="showcase-primary"
        className="w-full p-8 text-left"
      >
        <CartTextBlockTitle />
        <CartTextBlock title="What Did You Do Yesterday?" />
        <CartTextBlock title="What Are You Working on Today?" />
        <CartTextBlock title="Any Questions, Blockers or Thoughts?" />
      </FeatureCard>
    </motion.div>
  );
};

const CartTextBlock = ({ title }: { title: string }) => {
  const { scrollYProgress, scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 1000, 2000], [0, 0.001, 1]);
  return (
    <div className="mb-3">
      <motion.div style={{ opacity }} className="rounded-md border p-1">
        {title}
      </motion.div>
      <ul className="list-disc p-3">
        <li>
          <motion.div
            style={{ scaleX: scrollYProgress }}
            className="mb-1 inline-block h-1 w-full bg-gray-700"
          />
        </li>
        <li>
          <motion.div
            style={{ scaleX: scrollYProgress }}
            className="mb-1 inline-block h-1 w-1/3 bg-gray-700"
          />
        </li>
      </ul>
    </div>
  );
};

const CartTextBlockTitle = () => {
  const { scrollYProgress } = useScroll();
  return (
    <>
      <div className="mb-5 text-xl">Slack Standup Bot</div>
      <div className="mb-10">
        <div className="mb-3 grid grid-cols-[auto_1fr] items-center gap-4">
          <div className="inline-block bg-[#6D4B26] px-1 text-[#F2C744]">
            @Thibault
          </div>
          <motion.div
            style={{ scaleX: scrollYProgress }}
            className="h-1 w-full bg-gray-700"
          />
        </div>
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="mb-5 h-1 w-full bg-gray-700"
        />
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="h-1 w-1/3 bg-gray-700"
        />
      </div>
    </>
  );
};
