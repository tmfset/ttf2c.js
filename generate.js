
const max = (a, b) => a > b ? a : b;
const indent = by => level => line => "".padStart(by * level, " ") + line;
const singleIndent = indent(2)(1)

const singleLineComment = line => "// " + line
const multiLineComment = lines => ["/**", ...(lines.map(l => " * " + l)), " */"]

const addCommas = lines => lines.join(",\n").split("\n");

const toCodePointHex = c => "U+" + c.toString(16).padStart(4, "0");
const toByteString = byte => "0x" + byte.toString(16).padStart(2, "0");
const toByteDisplay = byte => byte > 0 ? "█" : " ";

const toGlyphDeclarationName = glyph => `glyph_${glyph.codePoint}`;

const toPixelDataRow = row => row.map(toByteString).join(", ");
const toPixelDisplayRow = row => row.map(toByteDisplay).join("");

const toPixelBlock = rows => {
  const data = addCommas(rows.map(toPixelDataRow));
  const comments = rows.map(toPixelDisplayRow).map(singleLineComment);
  return data.map((d, i) => d.padEnd(40, " ") + comments.slice(i, i + 1));
}

const box = minWidth => lines => {
  const width = lines.map(l => l.length + 3).reduce(max, minWidth);

  const end = "+".padEnd(width - 2, "-") + "+";
  const middle = lines.map(l => "| " + l.padEnd(width - 4, " ") + "|");
  return [end, ...middle, end];
}
const defaultBox = box(40)

const toGlyphDeclarationComment = glyph => {
  const codePoint = toCodePointHex(glyph.codePoint).padEnd(8, " ")
  const name = `"${glyph.name}"`.padEnd(15, " ")
  const size = `${glyph.width}x${glyph.height}`.padEnd(5, " ")
  const offset = `(${glyph.xOffset}, ${glyph.yOffset})`

  const lines = [`${codePoint}${name}${size}${offset}`];
  return multiLineComment(defaultBox(lines));
}

const toGlyphDeclaration = glyph => {
  return [
    ...toGlyphDeclarationComment(glyph),
    `static const uint8_t ${toGlyphDeclarationName(glyph)}[] = {`,
    ...(toPixelBlock(glyph.pixels).map(singleIndent)),
    "};"
  ]
}

const toGlyphMetadata = glyph => {
  const padNumber = n => n.toString().padStart(2, " ");
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

const toGlyphSimpleDescription = glyph => `${toCodePointHex(glyph.codePoint)} "${glyph.name}"`;

const toMetadataTable = glyphs => {
  const data = addCommas(glyphs.map(toGlyphMetadata));
  const length = data.map(l => l.length).reduce(max, 0);
  const comments = glyphs.map(toGlyphSimpleDescription).map(singleLineComment);

  const block = data.map((l, i) => l.padEnd(length, " ") + comments.slice(i, i + 1));
  return [
    `static const font_t metadata[${glyphs.length}] = {`,
    ...(block.map(singleIndent)),
    "};"
  ];
}

const toLookupTable = glyphs => {
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

export default function (glyphs) {
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
