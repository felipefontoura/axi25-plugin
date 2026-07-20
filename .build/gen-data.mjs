#!/usr/bin/env node
// gen-data.mjs — produces the AXI25 distributable data.json for the upstream
// `brand` config path (BojuBot#286). This REPLACES the main.js patching the old
// apply-brand.mjs did: instead of rewriting the bundle, AXI25 ships stock
// upstream main.js + styles.css and drives every branding surface from the
// `brand` block written here (name, icon, art, links, greetings/tips, and the
// assistant identity). Art is embedded as data: URIs so the plugin is
// self-contained — no vault-relative art files required.
//
// Decision (locked): manifest.id stays "bojubot" so the internal plugin folder
// (.obsidian/plugins/bojubot/…, settings-tab id, skill command prefix) lines up
// with upstream's hardcoded paths. The folder name is invisible to users.
//
//   node .build/gen-data.mjs        # write data.json
//   node .build/gen-data.mjs -n     # dry run (print, don't write)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));   // .build/
const ROOT = join(DIR, "..");                          // repo root
const ART = join(DIR, "brand");
const DATA = join(ROOT, "data.json");
const DRY = process.argv.includes("-n") || process.argv.includes("--dry-run");

const dataUri = (file) => {
  const path = join(ART, file);
  if (!existsSync(path)) throw new Error(`missing art: ${path}`);
  return `data:image/png;base64,${readFileSync(path).toString("base64")}`;
};

// Neutral greetings (no emoji/jokes) + factual tips (no marketing) — the AXI25
// welcome copy. Single source of truth for what overrides upstream welcome.json.
const WELCOME = {
  greetings: {
    morning: [
      { withName: "Good morning, {{name}}.", withoutName: "Good morning." },
      { withName: "Morning, {{name}}. What are we working on?", withoutName: "Morning. What are we working on?" },
    ],
    afternoon: [
      { withName: "Good afternoon, {{name}}.", withoutName: "Good afternoon." },
      { withName: "Afternoon, {{name}}. What's next?", withoutName: "Afternoon. What's next?" },
    ],
    evening: [
      { withName: "Good evening, {{name}}.", withoutName: "Good evening." },
      { withName: "Evening, {{name}}. What are we working on?", withoutName: "Evening. What are we working on?" },
    ],
    night: [
      { withName: "Good evening, {{name}}.", withoutName: "Good evening." },
      { withName: "Working late, {{name}}?", withoutName: "Working late?" },
    ],
  },
  tips: [
    "Type @ in your message to inject any vault note directly into your prompt.",
    "Drag and drop an image or PDF onto the chat panel to attach it to your next message.",
    "Paste an image from your clipboard straight into chat to attach it automatically.",
    "Switch to Read-only mode to let Claude browse your vault without making any changes to it.",
    "The ring gauge in the toolbar shows how full Claude's context window is — click it to compact the session and free up space.",
    "Skills are parameterized slash commands stored as Markdown files in your vault — type / to browse them.",
    "Click the session name in the toolbar to browse, rename, or jump to any past session.",
    "Hover over the download icon in the session manager to export any session as a formatted Markdown transcript.",
    "Claude can open notes, navigate headings, and trigger Obsidian commands on your behalf.",
    "Token stats appear below each response, including how many tokens were served from cache.",
    "Set a context file to give Claude standing instructions it reads at the start of every new session.",
    "The vault tree depth setting controls how much of your folder structure Claude sees — set it to 0 to hide it entirely.",
    "Skills registered as Ctrl+P commands let you fire a parameterized prompt from anywhere in Obsidian.",
    "Session names are generated from your first message — rename them anytime by clicking the name in the toolbar.",
    "Drag sessions in the session manager to reorder them.",
    "The command allowlist lets you pre-approve specific Obsidian commands so Claude can run them without asking each time.",
    "Attach a URL to your message and Claude will fetch and read the page as part of your prompt.",
    "Claude can see which notes you have open, including your active file and split-pane context.",
    "Full access mode lets Claude edit your vault directly, without asking before each change.",
    "The autorun field in a skill file fires the skill immediately, straight from the command palette.",
    "Skills support a note parameter type — Claude receives the full content of a vault note as context for that skill.",
    "Run the Reload skills command after adding or editing skill files to pick up changes without restarting Obsidian.",
    "Mid-session permission upgrade: if Claude needs more access, you can grant it without starting a new session.",
    "Claude can look up backlinks, outlinks, tags, or file lists from your live vault on demand.",
  ],
};

const brand = {
  name: "AXI25",
  icon: "square-terminal",
  logo: dataUri("axi25-logo.png"),    // header + About logo
  sprite: dataUri("axi25-mark.png"),  // welcome mascot
  applyToAssistantIdentity: true,     // Claude introduces itself as AXI25 too
  locked: true,                       // hide the Brand settings section (white-label; revert only via data.json)
  links: {
    doc: "https://github.com/felipefontoura/axi25",
    community: "",  // no third-party community server — hides the Discord card
    source: "",     // hides the GitHub card; author credit stays via the About credit line
    support: "https://github.com/felipefontoura/axi25",
  },
  greetings: WELCOME.greetings,
  tips: WELCOME.tips,
};

// Preserve the existing shipped settings; only (re)write the branding surface
// and the two fields the id="bojubot" decision touches.
const base = existsSync(DATA) ? JSON.parse(readFileSync(DATA, "utf8")) : {};
delete base.brand;                    // regenerated below (drop stale art)
const data = {
  ...base,
  logFilePath: "",                    // empty → default under plugins/bojubot (matches manifest.id)
  lastActiveSessionId: "",            // never ship a live session id
  brand,
};

const json = JSON.stringify(data, null, 2) + "\n";
if (DRY) {
  const preview = { ...data, brand: { ...brand, logo: `[${brand.logo.length} chars]`, sprite: `[${brand.sprite.length} chars]` } };
  console.log(JSON.stringify(preview, null, 2));
  console.log(`\n[dry run] would write ${json.length} bytes to ${DATA}`);
} else {
  writeFileSync(DATA, json);
  console.log(`✓ wrote ${DATA} (${json.length} bytes; logo ${brand.logo.length}, sprite ${brand.sprite.length})`);
}
