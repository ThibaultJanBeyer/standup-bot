import React from "react";
import Link from "next/link";

import { Button } from "@ssb/ui/button";
import { BotIcon } from "@ssb/ui/icons";

import BottomCTA from "@/components/BottomCTA";
import { LineAnimations } from "@/components/LineAnimations";

import { SectionFeatures } from "../components/SectionFeatures/SectionFeatures";
import { SectionInstall } from "../components/SectionInstall/SectionInstall";
import { SectionShowcase } from "../components/SectionShowcase/SectionShowcase";

export default function Home() {
  return (
    <>
      <main className="w-full px-16 py-10">
        <LineAnimations />
        <SectionInstall className="m-auto mb-[10rem] max-w-5xl lg:mb-[500px]" />
        <SectionFeatures className="m-auto mb-[10rem] max-w-5xl lg:mb-[20rem]" />
        <SectionShowcase className="m-auto mb-[5rem] max-w-5xl" />
      </main>
      {/* <BottomCTA /> */}
    </>
  );
}
