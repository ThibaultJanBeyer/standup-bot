import React from "react";

import { SectionFeatures } from "./SectionFeatures";
import { SectionInstall } from "./SectionInstall";
import { SectionShowcase } from "./SectionShowcase";

export default function Home() {
  return (
    <main className="w-full p-10">
      <SectionInstall className="m-auto mb-96 max-w-5xl" />
      <SectionFeatures className="m-auto mb-96 max-w-5xl" />
      <SectionShowcase className="m-auto mb-96 max-w-5xl" />
    </main>
  );
}
