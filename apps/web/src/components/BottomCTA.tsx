"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

import { Button } from "@ssb/ui/button";
import { BotIcon } from "@ssb/ui/icons";

export default function BottomCTA() {
  const [isInView, setIsInView] = useState(false);

  return (
    <>
      <div className="h-[80vh] w-full bg-black p-[20rem] text-center">
        <motion.div
          className="fixed flex items-center justify-center bg-black opacity-0"
          animate={
            isInView
              ? {
                  opacity: 1,
                  top: 0,
                  left: 0,
                  height: "100vh",
                  width: "100vw",
                  zIndex: 999,
                }
              : {}
          }
        >
          <Button
            variant="outlinePrimary"
            className="p-8"
            onClick={() => signIn()}
            loading={false}
          >
            <BotIcon className="mr-1 w-4" />
            Start Now For Free!
          </Button>
        </motion.div>
      </div>
      <motion.div
        className="w-full bg-black p-10 text-black"
        aria-hidden
        onViewportEnter={() => setIsInView(true)}
        onViewportLeave={() => setIsInView(false)}
      >
        Trigger
      </motion.div>
    </>
  );
}
