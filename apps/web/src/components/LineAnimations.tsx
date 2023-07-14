"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const LineAnimations = () => {
  return (
    <>
      <LineAnimationTop />
      <LinearAnimationMiddle />
      <LineAnimationBottom />
    </>
  );
};

export const LineAnimationTop = () => {
  const [anchor, setAnchor] = useState(null as { x: number; y: number } | null);
  const [isInView, setIsInView] = useState(false);

  const updatePos = () => {
    const cta = document.querySelector("#install-cta") as HTMLElement;
    setAnchor(() => ({
      y: cta.offsetTop + cta.offsetHeight / 2,
      x: cta.offsetLeft,
    }));
  };

  useEffect(() => {
    updatePos();
    window.addEventListener("resize", updatePos);
    return () => window.removeEventListener("resize", updatePos);
  }, []);

  if (!anchor) return null;

  const initHeight = 640;
  const height =
    anchor.y - initHeight > 0 ? initHeight + anchor.y - initHeight : initHeight;

  return (
    <>
      <svg
        className="absolute opacity-60"
        style={{
          left: `${anchor.x / 2 - 1.5}px`,
          top: `${anchor.y - height}px`,
        }}
        width="3"
        height={height}
        viewBox={`0 0 3 ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.line
          x1="1.5"
          y1="-75"
          x2="1.5"
          y2={height}
          strokeWidth="3"
          stroke="url(#paint0_linear_479_26)"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: isInView ? 1 : 0 }}
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
            <stop offset="0.0104651" stopColor="#00F0FF" />
            <stop offset="0.320133" stopColor="#4479DA" />
            <stop offset="0.682292" stopColor="#0351FF" stopOpacity="0.74" />
            <stop offset="0.946105" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <motion.div
        initial={{ transform: "scale(0)" }}
        whileInView={{ transform: "scale(1)" }}
        onViewportEnter={() => setIsInView(true)}
        onViewportLeave={() => setIsInView(false)}
        transition={{
          delay: 1.3,
          damping: 8,
          type: "spring",
        }}
        style={{ left: `${anchor.x / 2 - 5}px`, top: `${anchor.y - 5}px` }}
        className="ball-shadow-light absolute h-[10px] w-[10px] rounded-full border bg-teal-200"
      />
    </>
  );
};

export const LinearAnimationMiddle = () => {
  const [anchor, setAnchor] = useState(null as { x: number; y: number } | null);
  const [isInView, setIsInView] = useState(false);
  const { scrollY } = useScroll();
  // const sizeAnim = useTransform(scrollY, [0, 400, 700], [0, 0.0001, 1]);
  // const sizeAnim2 = useTransform(scrollY, [0, 600, 700], [0, 0.0001, 1]);

  const updatePos = () => {
    const anchor = document.querySelector("#feature-anchor") as HTMLElement;

    setAnchor(() => ({
      y: anchor.offsetTop - 200,
      x: anchor.offsetLeft,
    }));
  };

  useEffect(() => {
    updatePos();
    window.addEventListener("resize", updatePos);
    return () => window.removeEventListener("resize", updatePos);
  }, []);

  if (!anchor) return null;

  const initLength = 1100;
  const length =
    initLength + document.body.offsetWidth - initLength - anchor.x / 2;

  const initHeight = 400;
  const height = initHeight;

  return (
    <>
      <svg
        className="absolute opacity-60"
        style={{
          left: `${anchor.x / 2}px`,
          top: `${anchor.y}px`,
        }}
        width={length}
        height={height}
        viewBox={`0 0 ${length} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d={`M${length} 2H35C16.7746 2 2 16.7746 2 35V${height}`}
          stroke="url(#paint0_linear_512_316)"
          strokeWidth="3"
          // style={{ pathLength: sizeAnim }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: isInView ? 1 : 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        <defs>
          <linearGradient
            id="paint0_linear_512_316"
            x1="1180.31"
            y1="-64.5"
            x2="237.06"
            y2="722.847"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#C27EB8" />
            <stop offset="0.105557" stopColor="#CE8FC7" />
            <stop offset="0.19268" stopColor="#675EBC" />
            <stop offset="0.243654" stopColor="#432087" />
            <stop offset="0.320837" stopColor="#533476" />
            <stop offset="0.56291" stopColor="#4159B3" />
            <stop offset="0.708805" stopColor="#4899F8" />
            <stop offset="0.810077" stopColor="#4B7DE1" />
            <stop offset="0.979212" stopColor="#CC44C9" />
          </linearGradient>
        </defs>
      </svg>
      <motion.div
        initial={{ transform: "scale(0)" }}
        whileInView={{ transform: "scale(1)" }}
        onViewportEnter={() => setIsInView(true)}
        onViewportLeave={() => setIsInView(false)}
        transition={{
          delay: 1.3,
          damping: 8,
          type: "spring",
        }}
        style={{
          // scale: sizeAnim2,
          left: `${anchor.x / 2 - 3.5}px`,
          top: `${anchor.y + height - 3.5}px`,
        }}
        className="ball-shadow-dark absolute h-[10px] w-[10px] rounded-full border bg-purple-200"
      />
    </>
  );
};

export const LineAnimationBottom = () => {
  const [anchor, setAnchor] = useState(null as { x: number; y: number } | null);
  const [isInView, setIsInView] = useState(false);

  const updatePos = () => {
    const primary = document.querySelector("#showcase-primary") as HTMLElement;
    setAnchor(() => ({
      y: primary.offsetTop + primary.offsetHeight / 2,
      x: primary.offsetLeft,
    }));
  };

  useEffect(() => {
    updatePos();
    window.addEventListener("resize", updatePos);
    return () => window.removeEventListener("resize", updatePos);
  }, []);

  if (!anchor) return null;

  return (
    <>
      <svg
        className="absolute opacity-60"
        style={{
          top: `${anchor.y - 684}px`,
          left: `${anchor.x / 2 - 1.5}px`,
        }}
        width="3"
        height="684"
        viewBox="0 0 3 684"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.line
          x1="1.5"
          y1="-3.03916e-10"
          x2="1.5"
          y2="683.376"
          stroke="url(#paint0_linear_490_372)"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: isInView ? 1 : 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        <defs>
          <linearGradient
            id="paint0_linear_490_372"
            x1="-68.8677"
            y1="614.578"
            x2="90.5737"
            y2="-12.9205"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.00670768" stopColor="#CE44C8" />
            <stop offset="0.400994" stopColor="#4479DA" />
            <stop offset="0.682292" stopColor="#0351FF" stopOpacity="0.5" />
            <stop offset="0.946105" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <motion.div
        initial={{ transform: "scale(0)" }}
        whileInView={{ transform: "scale(1)" }}
        onViewportEnter={() => setIsInView(true)}
        onViewportLeave={() => setIsInView(false)}
        transition={{
          delay: 1,
          damping: 8,
          type: "spring",
        }}
        style={{ left: `${anchor.x / 2 - 5}px`, top: `${anchor.y - 5}px` }}
        className="ball-shadow-dark absolute h-[10px] w-[10px] rounded-full border bg-purple-200"
      />
    </>
  );
};
