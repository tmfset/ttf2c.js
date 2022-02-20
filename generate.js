

const toByteString = byte => "0x" + byte.toString(16).padStart(2, "0")
const toByteDisplay = byte => byte > 0 ? "█" : " "

const glyphDeclName = glyph => `glyph_${glyph.codePoint}`

const toPixelRow = row => {
  const bytes = row.map(toByteString).join(", ")
  const comment = row.map(toByteDisplay).join("")
  return `  ${bytes}, // ${comment}`;
}

const glyphDeclComment = glyph => {
  return `// "${glyph.name}" ${glyph.width}x${glyph.height}`;
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