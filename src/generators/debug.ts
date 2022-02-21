import { Generator, GlyphRaster } from "../models";
import { toBox, glyphFormatter, fileDescriptor } from "./common";

const toMetadata = (glyph: GlyphRaster) => {
  const format = glyphFormatter(glyph);

  const metadata = toBox(30)([[
    format.codePointHex().padEnd(10),
    format.quotedName().padEnd(15),
    format.size().padEnd(5),
    format.offset()
  ].join("")]);

  return [...metadata, ...(format.pixelDisplay().reverse())];
}

const generate: Generator = font => [
  ...fileDescriptor(font),
  "",
  ...(font.glyphs.flatMap(g => [...toMetadata(g), ""]))
].join("\n");
  

export default generate;
