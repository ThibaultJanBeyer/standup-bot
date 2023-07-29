import Link from "next/link";

import { Button } from "@ssb/ui/button";
import { CSlackIcon } from "@ssb/ui/icons";
import { INSTALL_SLACK_URI } from "@ssb/utils/src/constants";

export const AddToSlack = () => (
  <Button
    variant="ghost"
    className="hover:box-shadow inline-block bg-white text-center text-sm font-medium text-black  shadow-md  transition-transform hover:scale-105 hover:underline"
    asChild
  >
    <Link href={INSTALL_SLACK_URI}>
      <CSlackIcon className="mr-1 w-4" />
      Add to Slack
    </Link>
  </Button>
);
