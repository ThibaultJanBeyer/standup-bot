export function getWebUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_WEB_URL;
  const fromVercel = process.env.VERCEL_BRANCH_URL;
  return `//${
    fromEnv ||
    fromVercel?.replace("mobius-app", "mobius-web") ||
    "localhost:3333"
  }`;
}

export function getAppUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  const fromVercel = process.env.VERCEL_BRANCH_URL;
  return `//${
    fromEnv ||
    fromVercel?.replace("mobius-web", "mobius-app") ||
    "localhost:3000"
  }`;
}

export function ensureEnvIsDefined(
  value: string | undefined,
  envVariableName: string,
): string {
  if (typeof value !== "string" || value.length === 0)
    throw `Missing ENV: ${envVariableName}`;
  return value;
}
