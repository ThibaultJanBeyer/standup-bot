// WEB
export const AFTER_SIGN_IN_PATH = "/standups";
export const AFTER_SIGN_IN_URI = `${process.env.WEB_URI}${AFTER_SIGN_IN_PATH}`;
export const AUTH_PATH = "/auth/sign-in";
export const AUTH_URI = `${process.env.WEB_URI}${AUTH_PATH}`;
export const AUTH_BOT_PATH = "/auth/sign-bot";
export const AUTH_BOT_URI = `${process.env.WEB_URI}${AUTH_BOT_PATH}`;
// BOT
export const UPDATE_STANDUP_SLACK_PATH = "/standups/slack";
export const UPDATE_STANDUP_SLACK_URI = `${process.env.BOT_URI}${UPDATE_STANDUP_SLACK_PATH}`;
export const INSTALL_SLACK_PATH = "/slack/install";
export const INSTALL_SLACK_URI = `${process.env.BOT_URI}${INSTALL_SLACK_PATH}`;
