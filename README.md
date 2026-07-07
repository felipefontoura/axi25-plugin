# axi25-plugin

The **AXI25** Obsidian plugin — the vault-aware AI chat panel that ships inside
the distributable [AXI25](https://github.com/felipefontoura/axi25) vault.

It is a **re-branded distribution of BojuBot** (MIT, Scott Kirvan). We do not
maintain a source fork: this repo vendors the upstream build under `plugin/` and
applies the AXI25 identity deterministically with `apply-brand.mjs`. See
[`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md) for the required MIT attribution.

## What the branding covers

`apply-brand.mjs` rewrites, idempotently:

- **Name** — every visible `BojuBot` → `AXI25` (header, tab, About, placeholder, labels, transcript).
- **Icon** — the ribbon icon → `square-terminal` (craft/terminal aesthetic, not an "AI robot").
- **Artwork** — the real AXI25 logo (charcoal `#14120F` + amber `#EDA921`, serif wordmark):
  - `axi25-mark.png` — welcome mascot (wordmark, transparent).
  - `axi25-tile.png` — header/About selo (wordmark on charcoal).
  - Both generated from `axi25-banner-dark.png` (the canonical logo) via ImageMagick.
- **Identity** — `manifest.json` name/description/author (`Felipe Fontoura`)/authorUrl; `fundingUrl` cleared.
- **Links** — every third-party destination (author GitHub, `scottkirvan.com`, Discord) repointed to
  this repo. Only Claude infra (`claude.ai`, `code.claude.com`) and the SVG namespace remain.

## Usage

```bash
# after pulling a newer BojuBot build into ./plugin
node apply-brand.mjs --dry-run   # preview
node apply-brand.mjs             # apply
```

`DRIFT` warnings flag any target string that moved in a new upstream build — a
quick fix in `apply-brand.mjs`, never a merge.

## How AXI25 (the vault) consumes this

The distributable `axi25` vault vendors the **built, branded** `plugin/` into
`.obsidian/plugins/…`. Source and tooling stay here; the vault ships only the
clean output.

## Credits & upstream

AXI25 is built on **[BojuBot](https://github.com/ScottKirvan/BojuBot)** by Scott
Kirvan (MIT). Full credit to the original project — the underlying plugin is his
work; our changes are branding and packaging only. The required MIT notice is
retained in [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).

**Giving back:** rather than only patch downstream, we proposed the
brandable-config feature upstream so any user can white-label the plugin from
settings — see the feature request at
[ScottKirvan/BojuBot#286](https://github.com/ScottKirvan/BojuBot/issues/286)
(full design in [`UPSTREAM-PROPOSAL.md`](UPSTREAM-PROPOSAL.md)). If it lands, this
repo's branding step is retired.

## Open items

- **Plugin id** is still `bojubot` (internal, in `manifest.json` + the vault's
  plugin folder + `community-plugins.json`). Renaming to `axi25` is a coordinated
  step (folder rename + `community-plugins.json` + Obsidian restart) — it resets
  the active session, so it's kept as an explicit, opt-in step.
- **Header selo at 28px**: the full wordmark is cramped; a punchier amber `25`
  mark is a candidate for that size.
- **About modal** still has a "Discord" card (now pointing to this repo) — can be
  removed or repointed to an AXI25 channel.
