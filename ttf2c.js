const fontkit = require('fontkit');
const { createCanvas } = require('canvas');

const toByteString = byte => "0x" + byte.toString(16).padStart(2, "0")
const toClearByteString = byte => byte > 0 ? byte.toString(16).padStart(2, "0") : "  "
const toSimpleByteString = byte => byte > 0 ? "█" : " "

const toMatrix = stride => {
  const inner = array => {
    const slice = array.slice(0, stride);
    if (slice.length == 0) return [];
    return [slice, ...inner(array.slice(stride))];
  }
  return inner
}

const clip = (x, y) => m => m.slice(0, y).map(r => r.slice(0, x));

const extractGlyphData = (font, scale) => codePoint => {
  const glyph = font.glyphForCodePoint(codePoint);

  const toPixels = ems => (ems / font.unitsPerEm) * scale;
  const meta = {
    codePoint,
    name: glyph.name,
    width: toPixels(glyph.bbox.width),
    height: toPixels(glyph.bbox.height),
    xOffset: toPixels(glyph.bbox.minX),
    yOffset: toPixels(glyph.bbox.minY)
  };

  const canvas = createCanvas(scale, scale);
  const ctx = canvas.getContext('2d', { pixelFormat: 'A8' });

  ctx.save();
  glyph.getScaledPath(scale).translate(-meta.xOffset, -meta.yOffset).toFunction()(ctx);
  ctx.fill();
  ctx.restore();

  const raster = toMatrix(scale)(Array.from(ctx.getImageData(0, 0, scale, scale).data));
  const pixels = clip(meta.width, meta.height)(raster);

  return { ...meta, pixels };
}

const printGlyphData = data => {
  console.log("".padStart(50, "-"));
  const codePoint = data.codePoint.toString().padEnd(10);
  const name = `"${data.name}"`.padEnd(15);
  const size = `${data.width}x${data.height}`.padEnd(5);
  const offset = `(${data.xOffset}, ${data.yOffset})`;

  console.log(`${codePoint}${name}${size}${offset}`);
  console.log("".padStart(50, "-"))
  data.pixels.reverse().forEach(row => {
    console.log(row.map(toSimpleByteString).join(""));
  })
}

const isAsciiCodePoint = c => c >= 32 && c <= 126

const args = process.argv.slice(2);

const filename = args[0];
const font = fontkit.openSync(filename);

const scale = 16

font.characterSet.filter(isAsciiCodePoint).map(extractGlyphData(font, scale))

font.characterSet.filter(isAsciiCodePoint).map(extractGlyphData(font, scale)).forEach(data => {
  printGlyphData(data);
})
