import Link from "next/link";

import { Button } from "@ssb/ui/button";
import { GithubIcon } from "@ssb/ui/icons";

import { AddToSlack } from "../AddToSlack";

export const CTAButtons = () => {
  return (
    <>
      <AddToSlack />
      <Button variant="outlinePrimary" asChild>
        <Link
          href="https://github.com/ThibaultJanBeyer/standup-bot"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GithubIcon className="mr-1 w-4" /> Host Yourself
        </Link>
      </Button>
    </>
  );
};
