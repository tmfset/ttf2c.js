import { GlyphRaster } from "../models";
import { toBox, glyphFormatter, Generator } from "./common";

const toMetadata = (glyph: GlyphRaster) => {
  const format = glyphFormatter(glyph);

  const metadata = toBox(40)([[
    format.codePointHex().padEnd(10),
    format.quotedName().padEnd(15),
    format.size().padEnd(5),
    format.offset()
  ].join("")]);

  return [...metadata, ...(format.pixelDisplay())];
}

const generate: Generator = glyphs =>
  glyphs.flatMap(g => [...toMetadata(g), ""]).join("\n");

export default generate;
