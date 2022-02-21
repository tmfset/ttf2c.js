import fontkit, { Font } from 'fontkit';
import { createCanvas } from 'canvas';
import { GlyphRaster, FontRaster } from './models';

const toMatrix = (stride: number) => {
  const inner = (array: Array<any>): Array<any> => {
    const slice = array.slice(0, stride);
    if (slice.length == 0) return [];
    return [slice, ...inner(array.slice(stride))];
  }
  return inner;
}

const toPixels = (font: Font, scale: number) => (ems: number) => (ems / font.unitsPerEm) * scale;

const clip = (x: number, y: number) => (m: Array<Array<any>>) =>
  m.slice(0, y).map(r => r.slice(0, x));

const rasterize = (font: Font, scale: number) => (codePoint: number): GlyphRaster => {
  const glyph = font.glyphForCodePoint(codePoint);

  const toP = toPixels(font, scale)
  const meta = {
    codePoint,
    name: String.fromCodePoint(codePoint),
    width: Math.max(0, toP(glyph.bbox.maxX - glyph.bbox.minX)),
    height: Math.max(0, toP(glyph.bbox.maxY - glyph.bbox.minY)),
    xOffset: toP(glyph.cbox.minX),
    yOffset: toP(glyph.cbox.minY),
    xAdvance: toP(glyph.advanceWidth)
  };

  const canvas = createCanvas(scale, scale);
  const ctx = canvas.getContext('2d', { pixelFormat: 'A8' });

  ctx.save();
  glyph.path.scale(1 / font.unitsPerEm * scale).translate(-meta.xOffset, -meta.yOffset).toFunction()(ctx);
  ctx.fill();
  ctx.restore();

  const raster = toMatrix(scale)(Array.from(ctx.getImageData(0, 0, scale, scale).data));
  const pixels = clip(meta.width, meta.height)(raster);

  return { ...meta, pixels };
}

const toCodePoints = (s: string) =>
  s.split("").flatMap(c => {
    const codePoint = c.codePointAt(0);
    return codePoint ? [codePoint] : [];
  });

export default function (filename: string, size: number, ascii: boolean, chars: string): FontRaster {
  const font = fontkit.openSync(filename);

  const fontCodePoints = font.characterSet;
  const charCodePoints = toCodePoints(chars);

  const useCharCodePoints = charCodePoints.length > 0;
  const selectedCodePoints = useCharCodePoints ? charCodePoints : fontCodePoints;

  const isAsciiCodePoint = (c: number) => c >= 32 && c <= 126;
  const filteredCodePoints = ascii ? selectedCodePoints.filter(isAsciiCodePoint) : selectedCodePoints;

  const toP = toPixels(font, size);

  const defaultCodePoints = toCodePoints("? ");
  const defaultIndices = defaultCodePoints.flatMap(c => {
    const i = filteredCodePoints.findIndex(v => v === c);
    return i >= 0 ? [i] : [];
  });

  return {
    outputName: font.postscriptName,
    fontName: font.fullName,
    lineHeight: toP(font.bbox.maxY - font.bbox.minY),
    baseHeight: toP(font.bbox.maxY),
    totalFontGlyphs: fontCodePoints.length,
    glyphs: filteredCodePoints.map(rasterize(font, size)),
    defaultIndex: defaultIndices[0] || 0
  };
}
