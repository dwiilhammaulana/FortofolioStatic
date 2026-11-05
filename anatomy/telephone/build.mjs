import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "telephone.svg");
const PREVIEW = join(HERE, "preview.html");

const parts = [];
const part = (name, markup) => parts.push(`<g data-part="${name}">${markup}</g>`);
const group = (name, markup) => parts.push(`<g data-part="${name}">${markup}</g>`);
const wrapSince = (start, name) => {
  const children = parts.splice(start);
  parts.push(`<g data-assembly="${name}">${children.join("\n")}</g>`);
};

// Base shell, ordered from rear to front.
part("rear-ledge", `<path class="fine solid" d="M86 101 296 71 346 108 137 140Z"/>`);
part("top-shell", `<path class="line solid" d="M74 108 296 75 356 119 136 157Z"/>`);
part("left-shell", `<path class="line solid" d="M74 108 136 157 136 224 75 181Z"/>`);
part("front-shell", `<path class="line solid" d="M136 157 356 119 356 190 136 228Z"/>`);
part("front-lip", `<path class="fine" d="M137 211 355 174 355 190 136 228Z"/>`);
part("label-plate", `<path class="fine solid" d="M264 173 327 162 327 178 264 189Z"/>`);
part("label-rule-a", `<path class="faint" d="M274 176 316 169"/>`);
part("label-rule-b", `<path class="faint" d="M274 181 305 176"/>`);
part("left-foot", `<path class="fine solid" d="M103 207 127 203 127 220 104 224Z"/>`);
part("right-foot", `<path class="fine solid" d="M314 178 340 174 340 190 315 195Z"/>`);
for (const [i, [cx, cy]] of [[87,119],[127,149],[319,108],[345,124]].entries()) {
  part(`shell-screw-${i + 1}`, `<circle class="dot-ring" cx="${cx}" cy="${cy}" r="2.4"/><circle class="dot" cx="${cx}" cy="${cy}" r=".8"/>`);
}

// Cradle structure beneath the handset.
part("cradle-left-post", `<path class="line solid" d="M101 91 119 88 128 96 110 100Z M106 99 124 96 124 118 107 121Z"/>`);
part("cradle-right-post", `<path class="line solid" d="M292 59 310 56 320 64 301 68Z M298 67 315 64 315 86 299 89Z"/>`);
part("cradle-left-pad", `<path class="fine solid" d="M99 86 121 82 131 89 108 94Z"/>`);
part("cradle-right-pad", `<path class="fine solid" d="M289 53 312 49 322 56 299 61Z"/>`);

// Rotary dial assembly in the plane of the top shell.
const dialStart = parts.length;
group("dial-bezel", `<g transform="translate(221 136) rotate(-9) scale(1 .58)"><circle class="line solid" r="55"/></g>`);
group("dial-ring", `<g transform="translate(221 136) rotate(-9) scale(1 .58)"><circle class="line solid" r="44"/><circle class="fine" r="32"/></g>`);
group("dial-inner", `<g transform="translate(221 136) rotate(-9) scale(1 .58)"><circle class="fine solid" r="23"/></g>`);
group("dial-hub", `<g transform="translate(221 136) rotate(-9) scale(1 .58)"><circle class="line solid" r="15"/><circle class="faint" r="8"/></g>`);
for (let i = 0; i < 10; i++) {
  const a = (-120 + i * 27) * Math.PI / 180;
  const cx = (Math.cos(a) * 38).toFixed(2);
  const cy = (Math.sin(a) * 38).toFixed(2);
  group(`dial-hole-${i + 1}`, `<g transform="translate(221 136) rotate(-9) scale(1 .58)"><circle class="line solid" cx="${cx}" cy="${cy}" r="7"/></g>`);
}
part("dial-stop", `<path class="line solid" d="M273 126 286 123 292 131 279 135Z"/>`);
part("dial-marker", `<path class="bright" d="M212 103 219 111 228 101Z"/>`);
for (const [i, [cx, cy]] of [[174,138],[222,166],[268,139]].entries()) {
  part(`dial-mount-${i + 1}`, `<circle class="dot" cx="${cx}" cy="${cy}" r="1.15"/>`);
}
wrapSince(dialStart, "dial");

// Handset; the dark fill keeps base edges from reading through it.
const handsetStart = parts.length;
part("handset-body", `<path class="bright solid handset" d="M80 72C78 58 88 47 103 44L127 40C141 38 151 45 154 57L157 65C195 62 233 55 269 46L267 38C264 25 273 16 287 14L310 12C326 11 338 21 340 36L343 49C345 62 337 72 324 75L300 79C288 81 280 75 277 65L275 59C238 70 198 78 159 82L160 91C161 102 152 109 139 110L113 112C97 113 86 104 84 90Z"/>`);
part("handset-grip", `<path class="fine solid" d="M151 66C190 64 231 57 274 47L277 59C237 70 198 78 159 82Z"/>`);
part("left-cup-ring", `<ellipse class="line solid" cx="117" cy="76" rx="31" ry="24" transform="rotate(-8 117 76)"/>`);
part("left-cup-inner", `<ellipse class="fine solid" cx="117" cy="76" rx="21" ry="15" transform="rotate(-8 117 76)"/>`);
part("right-cup-ring", `<ellipse class="line solid" cx="306" cy="46" rx="31" ry="24" transform="rotate(-8 306 46)"/>`);
part("right-cup-inner", `<ellipse class="fine solid" cx="306" cy="46" rx="21" ry="15" transform="rotate(-8 306 46)"/>`);
for (const [side, x, y] of [["left",107,68],["left",116,66],["left",125,65],["right",296,39],["right",305,37],["right",314,36]]) {
  part(`${side}-acoustic-${x}`, `<rect class="faint" x="${x}" y="${y}" width="5" height="17" rx="2.5" transform="rotate(-8 ${x + 2.5} ${y + 8.5})"/>`);
}
part("left-neck-seam", `<path class="fine" d="M154 57C155 66 156 73 159 82"/>`);
part("right-neck-seam", `<path class="fine" d="M269 46C272 52 274 57 277 65"/>`);
wrapSince(handsetStart, "handset");

// Cord port, connector and a real spiral cord routed away from the body.
part("cord-port", `<ellipse class="line solid" cx="347" cy="162" rx="8" ry="11" transform="rotate(-9 347 162)"/>`);
part("cord-connector", `<path class="line solid" d="M350 157 364 163 360 176 346 169Z"/>`);
part("cord-lead", `<path class="line cord" d="M357 160C372 176 376 185 371 193"/>`);
let coil = "M371 193";
for (let i = 0; i < 12; i++) {
  const x = 371 - i * 4.2;
  const y = 193 + i * 4.3;
  coil += ` C${x + 10} ${y + 2},${x + 9} ${y + 10},${x} ${y + 8}`;
}
part("cord-coil", `<path class="line cord" d="${coil}"/>`);
part("cord-tail", `<path class="line cord" d="M324.8 248.3C307 255 293 252 285 243"/>`);
part("cord-terminal", `<circle class="dot-ring" cx="285" cy="243" r="3"/><circle class="dot" cx="285" cy="243" r="1"/>`);

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 270" role="img" aria-labelledby="phone-title phone-desc">
  <title id="phone-title">Anatomi telepon meja klasik</title>
  <desc id="phone-desc">Ilustrasi isometrik bergaris putih yang memperlihatkan handset, rotary dial, dudukan, sekrup, kaki, dan kabel spiral.</desc>
  <style>
    .line,.fine,.faint,.bright,.dot-ring{fill:none;stroke:#fff;vector-effect:non-scaling-stroke;stroke-linecap:round;stroke-linejoin:round}
    .solid{fill:#1d1d1b}
    .line{stroke-width:1.8;opacity:.84}.fine{stroke-width:1.15;opacity:.48}.faint{stroke-width:.8;opacity:.28}.bright{stroke-width:2.25;opacity:.96}
    .dot-ring{stroke-width:1;opacity:.55}.dot{fill:#fff;opacity:.72}.cord{stroke-width:1.35}.handset{filter:drop-shadow(0 7px 8px rgba(0,0,0,.28))}
    [data-assembly]{transform-box:fill-box;transform-origin:center;will-change:transform}
  </style>
  ${parts.join("\n  ")}
</svg>`;

const builtSvg = svg.replace(/class="(line|fine|faint|bright|dot-ring)(?=[^\"]*\")/g, 'class="iso-line $1');
const inlineSvg = builtSvg.replace(/^<\?xml[^>]+>\s*/, "");
const preview = `<!doctype html><meta charset="utf-8"><title>Telephone Anatomy</title><style>html,body{height:100%;margin:0;background:#1d1d1b;display:grid;place-items:center}.iso-plate{width:min(90vw,760px)}svg{display:block;width:100%;height:auto}</style><div class="iso-plate">${inlineSvg}</div>`;

mkdirSync(HERE, { recursive: true });
writeFileSync(OUT, builtSvg);
writeFileSync(PREVIEW, preview);

if (process.argv.includes("--audit")) {
  const built = readFileSync(OUT, "utf8");
  const count = (built.match(/data-part=/g) || []).length;
  const failures = [];
  if (count < 40 || count > 80) failures.push(`part count ${count}, expected 40–80`);
  if (/stroke-dasharray/.test(built)) failures.push("dashed line found");
  if (!/viewBox="0 0 420 270"/.test(built)) failures.push("unexpected viewBox");
  if (failures.length) {
    console.error(`audit failed: ${failures.join("; ")}`);
    process.exit(1);
  }
  console.log(`audit passed: ${count} purposeful parts`);
}

console.log(`wrote ${OUT}`);
