export const parseCustomCronString = (string: string) => {
  const cron = string.split("{")[0]?.trim() || string;
  const timeZone = string.split("{")[1]?.split("}")[0]?.trim();
  return { cron, timeZone };
};
