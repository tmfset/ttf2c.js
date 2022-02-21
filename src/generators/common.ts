import { GlyphRaster } from "../models";

export type Generator = (glyphs: Array<GlyphRaster>) => string

export const indent = (by: number) => (level: number) => (line: string) =>
  "".padStart(by * level, " ") + line;

export const addCommas = (lines: Array<string>) =>
  lines.join(",\n").split("\n");

export const toCodePointHex = (c: number) =>
  "U+" + c.toString(16).padStart(4, "0");

const toByteDisplay = (byte: number) =>
  byte > 0 ? "█" : " ";

export const toBox = (minWidth: number) => (lines: Array<string>) => {
  const max = (a: number, b: number) => Math.max(a, b)
  const width = lines.map(l => l.length).reduce(max, minWidth);
  const end = "+" + "".padEnd(width + 2, "-") + "+";
  const middle = lines.map(l => "| " + l.padEnd(width, " ") + " |");
  return [end, ...middle, end];
}

export const glyphFormatter = (glyph: GlyphRaster) => {
  return {
    codePointHex: () => toCodePointHex(glyph.codePoint),
    quotedName: () => `"${glyph.name}"`,
    size: () => `${glyph.width}x${glyph.height}`,
    offset: () => `(${glyph.xOffset}, ${glyph.yOffset})`,

    pixelDisplay: () => glyph.pixels.map(row => row.map(toByteDisplay).join("")),

    description: () => `${toCodePointHex(glyph.codePoint)} "${glyph.name}"`
  }
};