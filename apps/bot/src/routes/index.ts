import { UPDATE_STANDUP_SLACK_PATH } from "@ssb/utils/src/constants";

import { standupHandlerDelete } from "./standupHandlerDelete";
import { standupHandlerPost } from "./standupHandlerPost";

export const handlers = [
  {
    path: UPDATE_STANDUP_SLACK_PATH,
    method: ["POST"],
    handler: standupHandlerPost,
  },
  {
    path: UPDATE_STANDUP_SLACK_PATH,
    method: ["DELETE"],
    handler: standupHandlerDelete,
  },
];
