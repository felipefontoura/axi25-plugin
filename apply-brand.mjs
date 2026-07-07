#!/usr/bin/env node
// apply-brand.mjs — turns a vendored BojuBot build into the AXI25 plugin.
//
// This repo (axi25-plugin) vendors the upstream BojuBot bundle under ./plugin
// and re-brands it deterministically: display name, ribbon icon, real AXI25
// artwork (charcoal + amber, serif wordmark — NO cartoon bot), the
// manifest identity (author/urls), and it STRIPS every third-party link so the
// distributable product points nowhere but AXI25. Idempotent; re-run
// after pulling a newer BojuBot build. DRIFT warnings flag targets that moved.
//
//   node apply-brand.mjs [--dry-run]

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

// ── BRAND CONFIG ─────────────────────────────────────────────────────────────
const REPO_URL = "https://github.com/felipefontoura/axi25-plugin";
const BRAND = {
  name: "AXI25",
  icon: "square-terminal",              // Lucide id — terminal/craft, not "AI robot"
  logoFile: "axi25-logo.png",           // header + About: stacked AXI/25 wordmark on charcoal
  spriteFile: "axi25-mark.png",         // welcome mascot (real AXI25 wordmark)
  manifest: {
    id: "axi25",
    name: "AXI25",
    description: "AXI25 — Augmented eXtraction Intelligence. Vault-aware AI, skills, and a Claude chat panel native to your vault.",
    author: "Felipe Fontoura",
    authorUrl: REPO_URL,
    fundingUrl: "",                     // no third-party funding
  },
  about: {
    removeGithubCard: true,             // distributable: drop the source-repo card from the About modal
    docUrl: "https://github.com/felipefontoura/axi25",        // Documentation card target (temporary)
  },
  // exact third-party URLs in the bundle → repoint to our own repo (removes every
  // destination that led to the original author). Claude/w3.org infra is left alone.
  urlSwaps: {
    "https://github.com/ScottKirvan/BojuBot": REPO_URL,
    "https://www.scottkirvan.com/BojuBot/": REPO_URL,
    "https://discord.gg/TN6XJSNK5Y": REPO_URL,
  },
};
// ─────────────────────────────────────────────────────────────────────────────

const DRY = process.argv.includes("--dry-run") || process.argv.includes("-n");
const DIR = dirname(fileURLToPath(import.meta.url));
const MAIN_JS = join(DIR, "plugin", "main.js");
const MANIFEST = join(DIR, "plugin", "manifest.json");
const C = { g: "\x1b[32m", y: "\x1b[33m", r: "\x1b[31m", d: "\x1b[2m", x: "\x1b[0m" };
const log = [];
const note = (i, m) => log.push(`  ${i} ${m}`);
const short = (s) => (s.length > 50 ? s.slice(0, 50) + "…" : s);

if (!existsSync(MAIN_JS)) { console.error(`${C.r}✗ ${MAIN_JS} não existe${C.x}`); process.exit(1); }

// ── main.js ──────────────────────────────────────────────────────────────────
let src = readFileSync(MAIN_JS, "utf8");
const srcBefore = src;

const NAME_TARGETS = [
  `cls: "bojubot-welcome-header-name", text: "BojuBot" }`,
  `text: "BojuBot", cls: "bojubot-about-name" }`,
  `return "BojuBot";`,
  `placeholder: "Ask BojuBot`,
  `this.currentAssistantLabel = "BojuBot";`,
  `helpBtn.title = "About BojuBot";`,
  `sprite.title = "About BojuBot";`,
  `settingsBtn.title = "Open BojuBot settings";`,
  `sessionTitle || "BojuBot Session";`,
  `logoImg.alt = "BojuBot";`,
  `this.titleEl.setText("BojuBot `,
  `bojubot-assistant") ? "BojuBot" :`,
];
for (const from of NAME_TARGETS) {
  const to = from.split("BojuBot").join(BRAND.name);
  const n = src.split(from).length - 1;
  if (n > 0) { src = src.split(from).join(to); note(`${C.g}✓${C.x}`, `nome ×${n}  ${C.d}${short(from)}${C.x}`); }
  else if (src.includes(to)) note(`${C.d}·${C.x}`, `nome    ${C.d}ok → ${short(to)}${C.x}`);
  else note(`${C.y}!${C.x}`, `${C.y}DRIFT${C.x}   ${C.d}${short(from)}${C.x}`);
}

// third-party URL stripping
for (const [from, to] of Object.entries(BRAND.urlSwaps)) {
  const n = src.split(from).length - 1;
  if (n > 0) { src = src.split(from).join(to); note(`${C.g}✓${C.x}`, `link ×${n}  ${C.d}${short(from)}${C.x}`); }
  else if (src.includes(to)) note(`${C.d}·${C.x}`, `link    ${C.d}ok (repointed)${C.x}`);
  else note(`${C.y}!${C.x}`, `${C.y}DRIFT${C.x}   ${C.d}${short(from)}${C.x}`);
}

// remove the About-modal "Discord" card entirely (no third-party community channel)
{
  const re = /\n[ \t]*\{\s*icon: "",\s*svgInline: DISCORD_SVG,[\s\S]*?\n[ \t]*\},/;
  if (re.test(src)) { src = src.replace(re, ""); note(`${C.g}✓${C.x}`, `card    ${C.d}Discord removido do modal "Sobre"${C.x}`); }
  else note(`${C.d}·${C.x}`, `card    ${C.d}Discord ausente (ok)${C.x}`);
}

// remove the GitHub (source-repo) card — last element in the array
if (BRAND.about?.removeGithubCard) {
  const re = /,\s*\{\s*icon: "github",[\s\S]*?\n[ \t]*\}(?=\s*\];)/;
  if (re.test(src)) { src = src.replace(re, ""); note(`${C.g}✓${C.x}`, `card    ${C.d}GitHub removido do modal "Sobre"${C.x}`); }
  else note(`${C.d}·${C.x}`, `card    ${C.d}GitHub ausente (ok)${C.x}`);
}

// point the Documentation card at the configured URL
if (BRAND.about?.docUrl) {
  const re = /(title: "Documentation",[\s\S]*?href: ")[^"]*(")/;
  const m = src.match(re);
  if (!m) note(`${C.y}!${C.x}`, `${C.y}DRIFT${C.x}   Documentation card`);
  else if (m[0].endsWith(BRAND.about.docUrl + '"')) note(`${C.d}·${C.x}`, `link    ${C.d}Documentation ok → ${BRAND.about.docUrl}${C.x}`);
  else { src = src.replace(re, `$1${BRAND.about.docUrl}$2`); note(`${C.g}✓${C.x}`, `link    ${C.d}Documentation → ${BRAND.about.docUrl}${C.x}`); }
}

// ribbon icon
if (BRAND.icon) {
  const re = /(getIcon\(\)\s*\{\s*return\s*")([^"]*)("\s*;)/;
  const m = src.match(re);
  if (!m) note(`${C.y}!${C.x}`, `${C.y}DRIFT${C.x}   getIcon()`);
  else if (m[2] === BRAND.icon) note(`${C.d}·${C.x}`, `ícone   ${C.d}ok → "${BRAND.icon}"${C.x}`);
  else { src = src.replace(re, `$1${BRAND.icon}$3`); note(`${C.g}✓${C.x}`, `ícone   ${C.d}"${m[2]}" → "${BRAND.icon}"${C.x}`); }
}

// images
swapImage("logo_default", BRAND.logoFile);
swapImage("BojuBotSprite_800x800_default", BRAND.spriteFile);

// ── manifest.json ────────────────────────────────────────────────────────────
if (existsSync(MANIFEST)) {
  const man = JSON.parse(readFileSync(MANIFEST, "utf8"));
  let changed = false;
  for (const [k, v] of Object.entries(BRAND.manifest)) {
    if (man[k] !== v) { man[k] = v; changed = true; }
  }
  if (changed && !DRY) writeFileSync(MANIFEST, JSON.stringify(man, null, 2) + "\n");
  note(changed ? `${C.g}✓${C.x}` : `${C.d}·${C.x}`, `manifest ${C.d}${changed ? "atualizado (name/author/urls)" : "ok"}${C.x}`);
}

// ── output ───────────────────────────────────────────────────────────────────
console.log(`\n${DRY ? C.y + "DRY-RUN " + C.x : ""}Brand → ${C.g}${BRAND.name}${C.x}`);
console.log(log.join("\n"));
if (src !== srcBefore) {
  if (DRY) console.log(`\n${C.y}dry run: nada escrito${C.x}\n`);
  else { writeFileSync(MAIN_JS, src); console.log(`\n${C.g}✓ plugin brandado${C.x} (recarregue o Obsidian)\n`); }
} else console.log(`\n${C.d}main.js já brandado${C.x}\n`);

function swapImage(varName, file) {
  const path = join(DIR, file);
  if (!file || !existsSync(path)) { note(`${C.d}·${C.x}`, `img     ${C.d}${varName}: ${file} ausente, pulado${C.x}`); return; }
  const re = new RegExp(`var ${varName} = "data:image\\/[^"]*";`);
  if (!re.test(src)) { note(`${C.y}!${C.x}`, `${C.y}DRIFT${C.x}   ${varName}`); return; }
  const ext = extname(file).toLowerCase();
  const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".svg" ? "image/svg+xml" : ext === ".webp" ? "image/webp" : "image/png";
  const next = `var ${varName} = "data:${mime};base64,${readFileSync(path).toString("base64")}";`;
  if (src.includes(next)) { note(`${C.d}·${C.x}`, `img     ${C.d}${varName}: ok${C.x}`); return; }
  src = src.replace(re, next.replace(/\$/g, "$$$$"));
  note(`${C.g}✓${C.x}`, `img     ${C.d}${varName} ← ${file}${C.x}`);
}
