import { Generator, GlyphRaster, FontRaster } from "../models";
import { indent, toBox, addCommas, glyphFormatter, fileDescriptor, toCodePointDescription } from "./common";
import { multiLineComment, singleLineComment, toPixelArray, toLocalInclude } from "./common-c";

const singleIndent = indent(2)(1)

const fileComment = (font: FontRaster) =>
  multiLineComment(fileDescriptor(font));

const includes = [
  "font.h"
].map(toLocalInclude)

const toFontDeclaration = (font: FontRaster) => [
  `static const font_family_t info = {`,
  ...([
    `.line_height = ${font.lineHeight},`,
    `.base        = ${font.baseHeight},`,
    `.name        = "${font.outputName}"`
  ].map(singleIndent)),
  "}",
  "",
  `const font_family_t * ${font.outputName}_info(int id) {`,
  singleIndent("return &info;"),
  "}"
];

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
  const comments = glyphs.map(toDescription).map(singleLineComment).map(singleIndent);

  const block = data.map((l, i) => l.padEnd(length, " ") + comments.slice(i, i + 1));
  return [
    `static const font_t metadata[${glyphs.length}] = {`,
    ...(block.map(singleIndent)),
    "};"
  ];
}

const toLookupTable = (font: FontRaster) => {
  const switchBlock = font.glyphs.map((glyph, i) => {
    return `case ${glyph.codePoint}: return &metadata[${i}];  // ${toCodePointDescription(glyph.codePoint)}`
  });

  const switchStatement = [
    "switch (id) {",
    ...(switchBlock.map(singleIndent)),
    "}",
    "",
    `return &metadata[${font.defaultIndex}];`
  ];

  return [
    `const font_t * ${font.outputName}_lookup(int id) {`,
    ...(switchStatement.map(singleIndent)),
    "};"
  ];
}

const generate: Generator = font => {
  const declarations = font.glyphs.flatMap(g => [...toGlyphDeclaration(g), ""]);
  const metadataTable = toMetadataTable(font.glyphs);
  const lookupTable = toLookupTable(font);

  return [
    ...(fileComment(font)),
    "",
    ...includes,
    "",
    ...(toFontDeclaration(font)),
    "",
    ...declarations,
    ...metadataTable,
    "",
    ...lookupTable,
    ""
  ].join("\n");
}

export default generate;
