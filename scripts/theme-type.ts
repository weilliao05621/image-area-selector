import { readFile, writeFile } from "fs/promises";
import { resolve } from "node:path";
import { exec as _exec } from "child_process";
import { promisify } from "util";

const exec = promisify(_exec);

const themeFilePath = resolve("./src/constants/theme.constant.ts");
const themeTypeDeclarationPath = resolve("./src/emotion.d.ts");

async function generateThemeTyping() {
  const file = await readFile(`${themeFilePath}`, { encoding: "utf-8" });
  const content = replaceJsonStrings(file.replace("export const THEME = ", ""));
  const template = generateTemplate(content);

  await writeFile(themeTypeDeclarationPath, template);
  await exec(`npx prettier ${themeTypeDeclarationPath} -w`);
  console.log("Write theme typing: \n", template);
}

function replaceJsonStrings(jsonLikeStr: string): string {
  const regexWithComma = /: ?"[^"]*",/g;
  const regexWithoutComma = /: ?"[^"]*"/g;
  const replaceTemplate = ": string;";

  return jsonLikeStr
    .replace(regexWithComma, replaceTemplate)
    .replace(regexWithoutComma, replaceTemplate);
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
