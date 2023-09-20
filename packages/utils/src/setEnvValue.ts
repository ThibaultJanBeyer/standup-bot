import fs from "fs";
import os from "os";

// altered from https://stackoverflow.com/a/65001580/3712591
export const setEnvValue = (path: string, key: string, value: string): void => {
  // read file from hdd & split if from a linebreak to a array
  const ENV_VARS = fs.readFileSync(path, "utf8").split(os.EOL);

  // find the env we want based on the key
  const target = ENV_VARS.indexOf(
    ENV_VARS.find((line) => line.match(new RegExp(key))) || "",
  );

  // replace the key/value with the new value
  ENV_VARS.splice(target, 1, `${key}=${value}`);

  // write everything back to the file system
  fs.writeFileSync(path, ENV_VARS.join(os.EOL));
};
