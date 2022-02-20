
const toCodePointHex = c => "U+" + c.toString(16).padStart(4, "0")
const toByteString = byte => "0x" + byte.toString(16).padStart(2, "0")
const toByteDisplay = byte => byte > 0 ? "█" : " "

const glyphDeclName = glyph => `glyph_${glyph.codePoint}`

const toPixelRow = row => {
  const bytes = (row.map(toByteString).join(", ") + ",").padEnd(40, " ")
  const comment = "// " + row.map(toByteDisplay).join("")
  return `  ${bytes}${comment}`;
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
  return box(40)(lines).map(l => "// " + l).join("\n");
}

const glyphDecl = glyph => {
  return `
${glyphDeclComment(glyph)}
static const uint8_t ${glyphDeclName(glyph)}[] = {
${glyph.pixels.map(toPixelRow).join("\n")}
};
  `;
}

export default function (glyphs) {
  return glyphs.map(glyphDecl).join("\n");
}