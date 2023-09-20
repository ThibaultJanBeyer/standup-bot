// WEB
export const WEB_BASE_URL = `${process.env.PROTOCOL}${process.env.WEB_URI}`;
export const AFTER_SIGN_IN_PATH = "/standups";
export const AFTER_SIGN_IN_URI = `${WEB_BASE_URL}${AFTER_SIGN_IN_PATH}`;
export const SIGN_OUT_PATH = "/auth/sign-out";
export const AUTH_PATH = "/auth/sign-in";
export const AUTH_URI = `${WEB_BASE_URL}${AUTH_PATH}`;
export const AUTH_BOT_PATH = "/auth/sign-bot";
export const AUTH_BOT_URI = `${WEB_BASE_URL}${AUTH_BOT_PATH}`;
// BOT
export const BOT_BASE_URL = `${process.env.PROTOCOL}${process.env.BOT_URI}`;
// // Update/Insert Standup
export const UPDATE_STANDUP_SLACK_PATH = "/standups/slack";
export const UPDATE_STANDUP_SLACK_URI = `${BOT_BASE_URL}${UPDATE_STANDUP_SLACK_PATH}`;
// // Trigger installation
export const INSTALL_SLACK_PATH = "/slack/install";
export const INSTALL_SLACK_URI = `${BOT_BASE_URL}${INSTALL_SLACK_PATH}`;
// // Slack OAuth redirect capture
export const REDIRECT_SLACK_PATH = "/slack/oauth_redirect";
export const REDIRECT_SLACK_URI = `${BOT_BASE_URL}${REDIRECT_SLACK_PATH}`;
