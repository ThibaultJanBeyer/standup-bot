import React from "react";
import Link from "next/link";

import { Button } from "@ssb/ui/button";
import { BotIcon } from "@ssb/ui/icons";

import BottomCTA from "@/components/BottomCTA";
import { LineAnimations } from "@/components/LineAnimations";

import { SectionFeatures } from "../components/SectionFeatures/SectionFeatures";
import { SectionInstall } from "../components/SectionInstall/SectionInstall";
import { SectionShowcase } from "../components/SectionShowcase/SectionShowcase";

export const spacingTop = 580;

export default function Home() {
  const className = `m-auto mb-[${spacingTop + ""}px] max-w-5xl`;
  return (
    <>
      <main className="w-full overflow-x-hidden px-16 py-10">
        <LineAnimations />
        <SectionInstall className={className} />
        <SectionFeatures className="m-auto mb-[20rem] max-w-5xl" />
        <SectionShowcase className="m-auto mb-[5rem] max-w-5xl" />
      </main>
      <BottomCTA />
    </>
  );
}
