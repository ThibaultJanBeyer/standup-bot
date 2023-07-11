"use client";

import { motion } from "framer-motion";

export const LineAnimationTop = () => {
  return (
    <>
      <svg
        className="absolute left-[2.5rem] top-0 h-[37rem] xl:left-[5rem] 2xl:left-[10rem]"
        width="1"
        height="641"
        viewBox="0 0 1 641"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.line
          x1="0.5"
          y1="-75"
          x2="0.5"
          y2="641"
          stroke="url(#paint0_linear_479_26)"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        <defs>
          <linearGradient
            id="paint0_linear_479_26"
            x1="-68.896"
            y1="568.918"
            x2="105.101"
            y2="-84.6624"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.0104651" stop-color="#00F0FF" />
            <stop offset="0.320133" stop-color="#4479DA" />
            <stop offset="0.682292" stop-color="#0351FF" stop-opacity="0.74" />
            <stop offset="0.946105" stop-color="white" stop-opacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <motion.div
        initial={{ transform: "scale(0)" }}
        whileInView={{ transform: "scale(1)" }}
        transition={{
          delay: 1.3,
          damping: 8,
          type: "spring",
        }}
        className="ball-shadow-light absolute left-[calc(2.5rem-5px)] top-[37rem] h-[10px] w-[10px] rounded-full border bg-teal-200 xl:left-[calc(5rem-5px)] 2xl:left-[calc(10rem-5px)]"
      />
    </>
  );
};
