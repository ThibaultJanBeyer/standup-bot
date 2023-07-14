import React from "react";

import { LineAnimations } from "@/components/LineAnimations";

import { SectionFeatures } from "../components/SectionFeatures/SectionFeatures";
import { SectionInstall } from "../components/SectionInstall/SectionInstall";
import { SectionShowcase } from "../components/SectionShowcase/SectionShowcase";

export const spacingTop = 580;

export default function Home() {
  return (
    <main className="w-full px-16 py-10">
      <LineAnimations />
      <SectionInstall className={`m-auto mb-[${spacingTop}px] max-w-5xl`} />
      <SectionFeatures className="m-auto mb-[20rem] max-w-5xl" />
      <SectionShowcase className="m-auto mb-28 max-w-5xl" />
    </main>
  );
}
