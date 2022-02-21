#!/usr/bin/env node

import { ArgumentParser } from "argparse";

import generators, { generatorNames } from "./generators/provider";
import rasterize from "./rasterize";

const version = process.env.npm_package_version;

const parser = new ArgumentParser({
  description: 'Generate C code from TTF files.'
});
 
parser.add_argument('filename', {
  help: "The TTF file to rasterize."
});

parser.add_argument('-s', '--size', {
  help: "The font size / raster resolution to use.",
  default: 16
});

parser.add_argument('-f', '--format', {
  help: "The output format.",
  default: 'debug',
  choices: generatorNames
})

parser.add_argument('-v', '--version', {
  action: 'version',
  version
});

const args = parser.parse_args();

const generator = generators(args.format);
console.log(generator(rasterize(args.filename, args.size)));
