import { Generator } from "../models";

import er301 from "./er-301";
import debug from "./debug";

interface Supported {
  'er-301': 'er-301',
  debug: 'debug'
}

const byName = {
  'er-301': er301,
  'debug': debug
};

export const generatorNames = Object.keys(byName)

export default function (name: keyof Supported): Generator {
  return byName[name] || byName.debug;
}
