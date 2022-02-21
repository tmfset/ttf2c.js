import { addCommas } from "./common";

export const singleLineComment = (line: string) =>
  "// " + line;

export const multiLineComment = (lines: Array<string>) =>
  ["/**", ...(lines.map(l => " * " + l)), " */"];

export const toByteString = (byte: number) =>
  "0x" + byte.toString(16).padStart(2, "0");

export const toPixelArray = (pixels: Array<Array<number>>) =>
  addCommas(pixels.map(row => row.map(toByteString).join(", ")));
