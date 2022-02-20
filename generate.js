
const indent = by => level => line => "".padStart(by * level, " ") + line;
const indentDefault = indent(2)

const comment = line => "// " + line

const toCodePointHex = c => "U+" + c.toString(16).padStart(4, "0");
const toByteString = byte => "0x" + byte.toString(16).padStart(2, "0");
const toByteDisplay = byte => byte > 0 ? "█" : " ";

const glyphDeclName = glyph => `glyph_${glyph.codePoint}`;

const toPixelDataRow = row => row.map(toByteString).join(", ");
const toPixelDisplayRow = row => row.map(toByteDisplay).join("");

const toPixelBlock = indentLevel => rows => {
  const indent = indentDefault(indentLevel);
  const data = rows.map(toPixelDataRow).map(indent).join(",\n").split("\n");
  const comments = rows.map(toPixelDisplayRow).map(comment);
  const lines = data.map((d, i) => d.padEnd(40, " ") + comments.slice(i, i + 1));
  return lines.join("\n");
}

const box = minWidth => lines => {
  const max = (a, b) => a > b ? a : b

  const width = lines.map(l => l.length + 3).reduce(max, minWidth);

  const end = "+".padEnd(width - 2, "-") + "+";
  const middle = lines.map(l => "| " + l.padEnd(width - 4, " ") + "|");
  return [end, ...middle, end];
}

const glyphDeclComment = glyph => {
  const codePoint = toCodePointHex(glyph.codePoint).padEnd(8, " ")
  const name = `"${glyph.name}"`.padEnd(15, " ")
  const size = `${glyph.width}x${glyph.height}`.padEnd(5, " ")
  const offset = `(${glyph.xOffset}, ${glyph.yOffset})`

  const lines = [`${codePoint}${name}${size}${offset}`];
  return box(40)(lines).map(comment).join("\n");
}

const glyphDecl = glyph => {
  return `
${glyphDeclComment(glyph)}
static const uint8_t ${glyphDeclName(glyph)}[] = {
${toPixelBlock(1)(glyph.pixels)}
};`;
}

export default function (glyphs) {
  return glyphs.map(glyphDecl).join("\n");
}