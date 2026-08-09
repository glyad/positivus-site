import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";

const [, , sourcePath, marker, destinationPath] = process.argv;

if (!sourcePath || !marker || !destinationPath) {
  throw new Error(
    "Usage: node extract-source-svg.mjs <source> <marker> <destination>"
  );
}

const source = readFileSync(sourcePath, "utf8");
const markerIndex = source.indexOf(marker);

if (markerIndex === -1) {
  throw new Error(`Marker not found in ${basename(sourcePath)}: ${marker}`);
}

const svgStart = source.indexOf("<svg", markerIndex);
const svgEnd = source.indexOf("</svg>", svgStart);

if (svgStart === -1 || svgEnd === -1) {
  throw new Error(`SVG block not found in ${basename(sourcePath)}`);
}

let svg = source.slice(svgStart, svgEnd + "</svg>".length);

const attributeNames = {
  clipPath: "clip-path",
  clipRule: "clip-rule",
  fillRule: "fill-rule",
  fillOpacity: "fill-opacity",
  strokeWidth: "stroke-width",
  strokeLinecap: "stroke-linecap",
  strokeLinejoin: "stroke-linejoin",
  strokeMiterlimit: "stroke-miterlimit",
  strokeOpacity: "stroke-opacity",
  maskUnits: "maskUnits",
  xlinkHref: "xlink:href",
};

svg = svg
  .replace(/className=\{[^}]+\}\s*/g, "")
  .replace(/\{\.\.\.\{\s*ref,\s*\.\.\.props\s*\}\}\s*/g, "")
  .replace(/=\{(-?\d+(?:\.\d+)?)\}/g, '="$1"')
  .replace(
    /style=\{\{\s*maskType:\s*["']alpha["']\s*\}\}/g,
    'style="mask-type:alpha"'
  );

for (const [reactName, svgName] of Object.entries(attributeNames)) {
  svg = svg.replaceAll(`${reactName}=`, `${svgName}=`);
}

svg = `<?xml version="1.0" encoding="UTF-8"?>\n${svg}\n`;
writeFileSync(destinationPath, svg);
