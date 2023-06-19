#!/usr/bin/env node
const PackageJson = require("@npmcli/package-json");
const fs = require("fs");
const path = require("path");

async function main() {
  const root = path.resolve(__dirname, "..");
  const pkgJson = await PackageJson.load(path.resolve(root));
  const srcContents = fs.readdirSync(path.resolve(root, "src"));
  const exports = srcContents.reduce(
    (acc, file) => {
      const fstat = fs.lstatSync(path.resolve(root, "src", file));
      if (fstat.isDirectory()) {
        acc.exports[`./${file}`] = `./src/${file}`;
        acc.types[file] = [`./src/${file}`];
      } else if (fstat.isFile()) {
        const name = file.replace(/\.(ts|js)x{0,1}$/, "");
        acc.exports[`./${name}`] = `./src/${file}`;
        acc.types[name] = [`./src/${file}`];
      }
      return acc;
    },
    { exports: {}, types: {} },
  );
  pkgJson.update({
    exports: exports.exports,
    typesVersions: { "*": exports.types },
  });
  await pkgJson.save();
}

main();
