# Upstream proposal — optional white-label / brand config

> **Status:** filed upstream as a feature request — [ScottKirvan/BojuBot#286](https://github.com/ScottKirvan/BojuBot/issues/286). PR to follow if the maintainer is open to it.

**Goal:** let a user set a custom display name, ribbon icon, logo, mascot, and
greetings from `data.json` (plugin settings), instead of the hard-coded
"BojuBot" identity. This turns re-branding from a post-update patch into a
supported configuration — zero maintenance for downstream users, and a selling
point for a plugin that positions itself as a *personal AI platform*.

Post this as a GitHub **issue / feature request first** (etiquette: gauge the
maintainer's interest before a large PR), then offer the PR.

---

## Suggested issue text (paste into github.com/ScottKirvan/BojuBot/issues)

> **Title:** Optional brand config (custom name / icon / logo / greetings) via settings
>
> **Body:**
>
> BojuBot is bundled as a single `main.js`, so anyone who wants to present it
> under their own name/logo (teams, agencies, template vaults, white-label
> setups) has to patch the bundle and re-apply after every release. Since the
> plugin bills itself as turning a vault into a *personal AI platform*, a small
> "make it yours" config would be a natural fit — and a differentiator.
>
> **Proposal — new optional keys in `data.json` (all default to current behaviour):**
>
> ```jsonc
> {
>   "brand": {
>     "name": "BojuBot",            // display name: view title, welcome header, About, input placeholder, default assistant label
>     "icon": "brain-circuit",      // Lucide icon id for the ribbon / view icon
>     "logo": null,                 // vault-relative path or data URI; falls back to bundled logo
>     "sprite": null,               // vault-relative path or data URI; falls back to bundled sprite
>     "greetings": null             // optional override for the welcome.json greeting sets
>   }
> }
> ```
>
> Nothing set → byte-for-byte the current experience. I'm happy to open the PR
> if you're open to it.

---

## Where the hooks go (for the PR — verified against v3.3.0 bundle)

A thin `brand` accessor read from settings, consumed at these existing points:

| Concern | Current source | Change |
| --- | --- | --- |
| View/tab title | `getDisplayText()` returns `"BojuBot"` | return `brand.name` |
| Ribbon/view icon | `getIcon()` returns `"brain-circuit"` | return `brand.icon` |
| Welcome header name | `createSpan({ cls: "bojubot-welcome-header-name", text: "BojuBot" })` | `text: brand.name` |
| Welcome mascot | `BojuBotSprite_800x800_default` | `brand.sprite ?? BojuBotSprite_800x800_default` |
| About modal logo + name | `logo_default`, `text: "BojuBot"` | `brand.logo ?? logo_default`, `brand.name` |
| Input placeholder | `"Ask BojuBot…"` | `` `Ask ${brand.name}…` `` |
| Default assistant label | `this.currentAssistantLabel = "BojuBot"` | `brand.name` |
| Session title fallback | `sessionTitle || "BojuBot Session"` | `` `${brand.name} Session` `` |
| Greetings | `welcome.json` (`welcome_default`) | `brand.greetings ?? welcome_default` |

Deliberately **left as-is** (identity/attribution, not branding): the CSS
classes `bojubot-*`, the manifest `id`, the author GitHub link, the internal
`@@BOJU` protocol token, and the MIT notice.

**Backward compatibility:** every key is optional and defaults to the bundled
value, so existing installs are unaffected.

**Settings UI (optional, second PR):** a small "Branding" section — name field,
icon picker, two file pickers, greetings textarea.

---

## Fallback if upstream declines

Keep `apply-brand.mjs` (Level 1). It already covers the same surface as a
post-update patch. The proposal above is the higher-leverage bet — if it lands,
we delete the patch and the maintenance burden moves upstream permanently.
