# ttf2c.js
A tool to rasterize TTF fonts and convert to C code.

## Installation
```
npm install
```
Notably this requires [canvas](https://www.npmjs.com/package/canvas) to rasterize the fonts. If it fails to install/build make sure you have the required dependencies for that first.

## Usage
```
➜  ttf2c.js git:(main) ✗ npm run -s generate -- examples/simple4x5.ttf -c ABC
+--------------------------------------+
| U+0041    "A"            4x5  (0, 0) |
+--------------------------------------+
 ███
█  █
████
█  █
█  █

+--------------------------------------+
| U+0042    "B"            4x5  (0, 0) |
+--------------------------------------+
███
█  █
███
█  █
███

+--------------------------------------+
| U+0043    "C"            4x5  (0, 0) |
+--------------------------------------+
 ██
█  █
█
█  █
 ██

```