# ttf2c.js
A tool to rasterize TTF fonts and convert to C code.

## Installation
```
npm install
```
Notably this requires [canvas](https://www.npmjs.com/package/canvas) to rasterize the fonts. If it fails to install/build make sure you have the required dependencies for that first.

## Usage
```
node ttf2c.js examples/simple4x5.ttf
```

```
--------------------------------------------------
65        "A"            4x5  (0, 0)
--------------------------------------------------
 ███
█  █
████
█  █
█  █
--------------------------------------------------
66        "B"            4x5  (0, 0)
--------------------------------------------------
███
█  █
███
█  █
███
--------------------------------------------------
67        "C"            4x5  (0, 0)
--------------------------------------------------
 ██
█  █
█
█  █
 ██
```