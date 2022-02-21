export interface GlyphRaster {
  codePoint: number,
  name: string,

  width: number,
  height: number,
  xOffset: number,
  yOffset: number,

  pixels: Array<Array<number>>
}
