import { readFile, writeFile } from "fs/promises";
import { resolve } from "node:path";
import { exec as _exec } from "child_process";
import { promisify } from "util";

const exec = promisify(_exec);

const themeFilePath = resolve("./src/constants/theme.constant.ts");
const themeTypeDeclarationPath = resolve("./src/emotion.d.ts");

const REMOVE_REVERSED_WORD_LIST = [
  ["export const THEME =", ""], // script start
  ["as const;", ""], // script end
  [/,/g, ";"], // ts interface splitter
] as const;

async function generateThemeTyping() {
  const file = await readFile(`${themeFilePath}`, { encoding: "utf-8" });

  const template = generateTemplate(
    REMOVE_REVERSED_WORD_LIST.reduce((acc, cur) => {
      const replacing = cur[0];
      const replacer = cur[1];
      return acc.replace(replacing, replacer);
    }, file),
  );

  await writeFile(themeTypeDeclarationPath, template);
  await exec(`npx prettier ${themeTypeDeclarationPath} -w`);
  console.log(`Write theme typing to ${themeTypeDeclarationPath}`);
}

function generateTemplate(content: string) {
  return `
  /** @description 
   * this file is auto-generated. 
   * please don't edit it manually. 
   * execute \`npm run type:theme\` to get it.
   * */ 
  
  import '@emotion/react'

  declare module "@emotion/react" {
    export interface Theme ${content}
  }
    `;
}

generateThemeTyping();
