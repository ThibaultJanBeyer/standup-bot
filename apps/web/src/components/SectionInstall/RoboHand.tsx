"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

import RoboHandImage from "../../../public/robo-hand.png";

export const handTranslate = {
  x: 100,
  y: -200,
};

export const RoboHand = () => {
  const { scrollY } = useScroll();
  const yPosAnim = useTransform(scrollY, [0, 1000], [0, -150]);

  return (
    <motion.div
      className="pointer-events-none absolute w-[100%] min-w-[300px] max-w-[500px]"
      aria-hidden
      style={{
        bottom: `${handTranslate.y}px`,
        left: `${handTranslate.x}px`,
        boxShadow: "0 160px 200px rgba(0, 0, 0, .5)",
        y: yPosAnim,
      }}
    >
      <Image id="install-hand" src={RoboHandImage} alt="" />
    </motion.div>
  );
};
