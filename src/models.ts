export interface GlyphRaster {
  codePoint: number,
  name: string,

  width: number,
  height: number,
  xOffset: number,
  yOffset: number,

  pixels: Array<Array<number>>
}

export interface FontRaster {
  outputName: string,
  fontName: string,
  lineHeight: number,
  baseHeight: number,
  totalFontGlyphs: number,
  glyphs: Array<GlyphRaster>,
  defaultIndex: number
}

export type Generator = (font: FontRaster) => string