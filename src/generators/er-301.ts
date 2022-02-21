import { GlyphRaster } from "../models";
import { indent, toBox, addCommas, glyphFormatter, Generator } from "./common";
import { multiLineComment, singleLineComment, toPixelArray } from "./common-c";

const singleIndent = indent(2)(1)

const toGlyphDeclarationName = (glyph: GlyphRaster) =>
  `glyph_${glyph.codePoint}`;

const toPixelBlock = (glyph: GlyphRaster) => {
  const format = glyphFormatter(glyph);
  const data = toPixelArray(glyph.pixels);
  const comments = format.pixelDisplay().map(singleLineComment);
  return data.map((d, i) => d.padEnd(40, " ") + comments.slice(i, i + 1));
}

const toGlyphDeclarationComment = (glyph: GlyphRaster) => {
  const format = glyphFormatter(glyph);
  return multiLineComment(toBox(40)([[
    format.codePointHex().padEnd(8, " "),
    format.quotedName().padEnd(15, " "),
    format.size().padEnd(5, " "),
    format.offset()
  ].join("")]));
}

const toGlyphDeclaration = (glyph: GlyphRaster) => {
  return [
    ...toGlyphDeclarationComment(glyph),
    `static const uint8_t ${toGlyphDeclarationName(glyph)}[] = {`,
    ...(toPixelBlock(glyph).map(singleIndent)),
    "};"
  ]
}

const toGlyphMetadata = (glyph: GlyphRaster) => {
  const padNumber = (n: number) =>
    n.toString().padStart(2, " ");

  const data = addCommas([
    `.width = ${padNumber(glyph.width)}`,
    `.height = ${padNumber(glyph.height)}`,
    `.xadvance = ${padNumber(glyph.width + 1)}`,
    `.xOffset = ${padNumber(glyph.xOffset)}`,
    `.yOffset = ${padNumber(glyph.yOffset)}`,
    `.bitmap = ${toGlyphDeclarationName(glyph)}`
  ]);
  return ["{", ...data, "}"].join(" ");
}

const toDescription = (glyph: GlyphRaster) =>
  glyphFormatter(glyph).description();

const toMetadataTable = (glyphs: Array<GlyphRaster>) => {
  const max = (a: number, b: number) => Math.max(a, b)

  const data = addCommas(glyphs.map(toGlyphMetadata));
  const length = data.map(l => l.length).reduce(max, 0);
  const comments = glyphs.map(toDescription).map(singleLineComment);

  const block = data.map((l, i) => l.padEnd(length, " ") + comments.slice(i, i + 1));
  return [
    `static const font_t metadata[${glyphs.length}] = {`,
    ...(block.map(singleIndent)),
    "};"
  ];
}

const toLookupTable = (glyphs: Array<GlyphRaster>) => {
  const switchBlock = glyphs.map((glyph, i) => {
    return `case ${glyph.codePoint}: return &metadata[${i}];`
  });

  const switchStatement = [
    "switch (id) {",
    ...(switchBlock.map(singleIndent)),
    "}"
  ];
  return [
    `const font_t * lookup(int id) {`,
    ...(switchStatement.map(singleIndent)),
    "};"
  ];
}

const generate: Generator = glyphs => {
  const declarations = glyphs.flatMap(g => [...toGlyphDeclaration(g), ""]);
  const metadataTable = toMetadataTable(glyphs);
  const lookupTable = toLookupTable(glyphs);

  return [
    ...declarations,
    ...metadataTable,
    "",
    ...lookupTable,
  ].join("\n");
}

export default generate;
