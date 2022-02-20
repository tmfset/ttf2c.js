
const indent = by => level => line => "".padStart(by * level, " ") + line;
const defaultIndent = indent(2)

const singleLineComment = line => "// " + line
const multiLineComment = lines => ["/**", ...(lines.map(l => " * " + l)), " */"]

const toCodePointHex = c => "U+" + c.toString(16).padStart(4, "0");
const toByteString = byte => "0x" + byte.toString(16).padStart(2, "0");
const toByteDisplay = byte => byte > 0 ? "█" : " ";

const toGlyphDeclarationName = glyph => `glyph_${glyph.codePoint}`;

const toPixelDataRow = row => row.map(toByteString).join(", ");
const toPixelDisplayRow = row => row.map(toByteDisplay).join("");

const toPixelBlock = indentLevel => rows => {
  const indent = defaultIndent(indentLevel);
  const data = rows.map(toPixelDataRow).map(indent).join(",\n").split("\n");
  const comments = rows.map(toPixelDisplayRow).map(singleLineComment);
  const lines = data.map((d, i) => d.padEnd(40, " ") + comments.slice(i, i + 1));
  return lines;
}

const box = minWidth => lines => {
  const max = (a, b) => a > b ? a : b

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
    ...(toPixelBlock(1)(glyph.pixels)),
    "};"
  ]
}

export default function (glyphs) {
  return glyphs.map(glyph => {
    return toGlyphDeclaration(glyph).join("\n");
  }).join("\n");
}
