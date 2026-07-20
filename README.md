<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".build/brand/axi25-banner-dark.png">
    <img alt="AXI25" src=".build/brand/axi25-banner.png" width="560">
  </picture>
</p>

<p align="center">
  <strong>The vault-aware Claude chat panel for Obsidian.</strong><br>
  Native AI, skills, and sessions — on your own Claude subscription, inside your vault.
</p>

<p align="center">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-EDA921">
  <img alt="Obsidian desktop" src="https://img.shields.io/badge/Obsidian-desktop-14120F">
</p>

---

**AXI25** turns Obsidian into an AI workspace: a chat panel that reads your vault, runs your
skills, and drives Claude against your own notes. It ships inside the distributable
[AXI25 vault](https://github.com/felipefontoura/axi25).

It is a **re-branded distribution of [BojuBot](https://github.com/ScottKirvan/BojuBot)**
(MIT, Scott Kirvan). We do not fork the source and we no longer patch the bundle: the
**repo root ships the stock upstream `main.js` / `styles.css` unmodified**, and all branding
is driven by the upstream `brand` config in `data.json` (a feature we contributed upstream —
see [Credits](#credits--upstream)). See [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md)
for the required MIT attribution.

## Layout

| Path | What |
| --- | --- |
| `main.js` · `styles.css` | **stock upstream build, byte-for-byte** — never edited here |
| `manifest.json` | plugin identity (`id: bojubot`, `name: AXI25`, author `Felipe Fontoura`) |
| `data.json` | shipped settings + the `brand` block that drives all branding |
| [`.build/gen-data.mjs`](.build/gen-data.mjs) | generates `data.json` — brand name, icon, embedded artwork, links, greetings/tips |
| [`.build/brand/`](.build/brand) | AXI25 artwork (logo, mark, banner) |
| [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md) | required MIT attribution |

## Branding

Nothing rewrites the bundle. Upstream BojuBot exposes an opt-in `brand` config; AXI25 sets it
in `data.json` and ships the stock `main.js`. `gen-data.mjs` writes that block:

- **Name** — `brand.name: "AXI25"`. Being ≠ `"BojuBot"` marks the build white-labeled, which
  upstream uses to suppress its own sponsor message / funding card and show the MIT credit line.
- **Icon** — `brand.icon: "square-terminal"` (craft aesthetic, not an "AI robot").
- **Artwork** — the real AXI25 wordmark (charcoal `#14120F` + amber `#EDA921`), embedded as
  `data:` URIs so the plugin is self-contained (no vault-relative art files).
- **Identity** — Claude introduces itself as AXI25 (`applyToAssistantIdentity: true`).
- **Links** — `doc` / `support` → the AXI25 GitHub repo; `community` / `source` set to `""` to hide the
  Discord / GitHub cards (author credit stays via upstream's non-configurable MIT line).
- **Locked** — `brand.locked: true` hides the Brand settings section from end users.
- **Defaults** — `data.json` shipped clean: no live session id, default log path.

```bash
# after refreshing the stock upstream build at the repo root (see below)
node .build/gen-data.mjs -n   # dry run (print, don't write)
node .build/gen-data.mjs      # write data.json
```

### Refreshing the upstream build

`main.js` / `styles.css` come straight from an upstream `npm run build`. To update to a newer
BojuBot: build upstream (or our fork) and copy `main.js` + `styles.css` to the repo root, bump
`manifest.json` `version` / `minAppVersion` to match, then re-run `gen-data.mjs`. Keep
`manifest.id` as `bojubot` — upstream hardcodes `.obsidian/plugins/bojubot/` for its log path
and command reference, so the plugin folder must be named `bojubot`.

## How the vault consumes it

The [AXI25 vault](https://github.com/felipefontoura/axi25) mounts this repo as a **git
submodule** at `.obsidian/plugins/bojubot/` (the folder name must match `manifest.id`), so
Obsidian loads the plugin live during development. At release, the vault's CI assembles a clean
copy — resets `data.json`, strips `.build/` — into the distributable zip.

## Credits & upstream

Built on **[BojuBot](https://github.com/ScottKirvan/BojuBot)** by Scott Kirvan (MIT) — full
credit to the original project; our changes are branding and packaging only. Rather than only
patch downstream, we contributed the brandable-config feature **upstream** so any user can
white-label the plugin from settings:
[ScottKirvan/BojuBot#286](https://github.com/ScottKirvan/BojuBot/issues/286), merged as
[#293](https://github.com/ScottKirvan/BojuBot/pull/293). AXI25 now ships the stock upstream
build and configures it via `data.json` — the old bundle-patching step is retired.

## License

[MIT](LICENSE.md) — © Scott Kirvan (BojuBot). AXI25 branding and packaging by Felipe Fontoura.
