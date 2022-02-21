import fontkit, { Font } from 'fontkit';
import { createCanvas } from 'canvas';
import { GlyphRaster } from './models';

const toMatrix = (stride: number) => {
  const inner = (array: Array<any>): Array<any> => {
    const slice = array.slice(0, stride);
    if (slice.length == 0) return [];
    return [slice, ...inner(array.slice(stride))];
  }
  return inner;
}

const clip = (x: number, y: number) => (m: Array<Array<any>>) =>
  m.slice(0, y).map(r => r.slice(0, x));

const rasterize = (font: Font, scale: number) => (codePoint: number): GlyphRaster => {
  const glyph = font.glyphForCodePoint(codePoint);

  const toPixels = (ems: number) => (ems / font.unitsPerEm) * scale;
  const meta = {
    codePoint,
    name: String.fromCodePoint(codePoint),
    width: toPixels(glyph.bbox.maxX - glyph.bbox.minX),
    height: toPixels(glyph.bbox.maxY - glyph.bbox.minY),
    xOffset: toPixels(glyph.bbox.minX),
    yOffset: toPixels(glyph.bbox.minY)
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

export default function (filename: string, size: number, ascii: boolean, chars: string) {
  const font = fontkit.openSync(filename);

  const charCodePoints = chars.split("").flatMap(s => {
    const codePoint = s.codePointAt(0);
    return codePoint ? [codePoint] : [];
  });

  const fontCodePoints = font.characterSet;
  const selectedCodePoints = charCodePoints.length > 0 ? charCodePoints : fontCodePoints;

  const isAsciiCodePoint = (c: number) => c >= 32 && c <= 126;
  const filteredCodePoints = ascii ? selectedCodePoints.filter(isAsciiCodePoint) : selectedCodePoints;

  return filteredCodePoints.map(rasterize(font, size));
}
