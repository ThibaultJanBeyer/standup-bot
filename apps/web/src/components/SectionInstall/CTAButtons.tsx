import Link from "next/link";

import { Button } from "@ssb/ui/button";
import { CSlackIcon, GithubIcon } from "@ssb/ui/icons";

export const CTAButtons = () => {
  return (
    <>
      <Button variant="ghost" asChild>
        <Link
          href={`/auth/sign-in`}
          className="hover:box-shadow block bg-white text-sm font-medium text-black shadow-md transition-transform  hover:scale-105  hover:underline"
        >
          <CSlackIcon className="mr-1 w-4" />
          Add to Slack
        </Link>
      </Button>
      <Button variant="outlinePrimary" asChild>
        <a
          href="https://github.com/ThibaultJanBeyer/standup-bot"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GithubIcon className="mr-1 w-4" /> Host Yourself
        </a>
      </Button>
    </>
  );
};
