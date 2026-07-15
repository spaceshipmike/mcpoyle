# Experience Report — v2.0.1 slim cut close-out (chunks 8–10)

**Run:** `run-1744993200`
**Date:** 2026-04-18
**External version:** 1.1.2 → 1.2.4 (chunks 8/9/10/retro)
**Spec version:** 2.4.0 (unchanged through build)
**Tests:** library 379 → 430 (+51); desktop router 31 → 46 (+15). All green.

## What the user can now do

Before chunks 8–10 shipped, Ensemble had a v1.3-style per-type CLI — `ensemble plugins install`, `ensemble skills add`, `ensemble hook add`, and so on — seven resource-type groups that each carried their own install semantics. The user could manage every resource type, but the grammar forced them to remember which verb lived in which group.

After this build, the v2.0.1 noun-first grammar works end-to-end. The four universal lifecycle verbs (`pull`, `install`, `uninstall`, `remove`) apply across every resource type uniformly:

- `ensemble pull acme/some-marketplace` — brings a source into the library. Source can be an `owner/repo` GitHub shorthand, a local `./path` or absolute directory, a `registry:slug` lookup against the official or Glama registries, or a full URL (git clone). The `--type` flag disambiguates when inference is impossible.
- `ensemble install <name>` — turns a library entry on for the active or named client. Routes through the existing operation paths for whichever resource type the name resolves to.
- `ensemble uninstall <name>` — turns it off without losing the library entry. The dual-field contract holds: re-installing preserves `userNotes`.
- `ensemble remove <name>` — the destructive eviction that cascades through clients first via `uninstall`, then removes the library entry itself.

The library view is first-class: `ensemble library list` shows every library entry with the columns from `ensemble list` plus an install-state badge column. `ensemble library show <name>` drills into a single entry with full frontmatter/config detail. `ensemble library pivot <type>` filters to one resource type.

The long-deferred `#settings` scenario now ships: `ensemble settings set permissions.allow '["Read","Grep"]' --client claude-code` parses the value as JSON, writes it as a managed key through `mergeSettings()`, and tracks it so `ensemble settings unset permissions.allow` can stop managing the key without deleting its value. Every unmanaged key in `settings.json` round-trips byte-identical across any operation. `ensemble settings list/show/sync` complete the verb group.

`ensemble browse` prints a ranked plain-text list of every library entry plus everything discoverable in the configured marketplaces, one row per result: name, type, source, install-state badge, and — for discoverable-only results — the exact install command the user can run next. Filters compose: `--type`, `--marketplace`, fuzzy query strings, and the `@marketplace-name/<query>` token syntax all parse through the same engine (`src/browse.ts`). Default result limit is 50; `--limit N` overrides.

The desktop app has a new **REGISTRY** tab consuming the same `browseSearch()` engine through a `browse` tRPC sub-router — identical ranking (installed > library-only > discoverable), identical filter chip parsing, identical result shape. The CLI and the desktop surface share the engine exactly.

The desktop IPC surface is complete. Every v2.0.1 resource type now has a typed tRPC sub-router on `appRouter`: `agents`, `commands`, `hooks`, `settings`, `browse`, `snapshots` — alongside the existing `servers`, `skills`, `plugins`, `marketplaces`, `doctor`, `sync`, etc. Every procedure validates input with a Zod schema and returns a typed result. The renderer can drive every v2.0.1 resource type from React via `@trpc/react-query` hooks with compile-time type safety.

## Artifacts added this build

- `src/lifecycle.ts` — noun-first verb dispatcher; routes `pull`/`install`/`uninstall`/`remove`/`library` across the existing operations layer
- `src/managed-settings.ts` — canonical managed-settings store at `~/.config/ensemble/managed-settings.json`, backing `ensemble settings`
- `src/browse.ts` — pure-function fuzzy search primitive with `@marketplace/` parsing + ranking
- `packages/desktop/src/renderer/src/views/RegistryView.tsx` — desktop Registry consuming the browse engine
- Four new sub-routers in `packages/desktop/src/main/ipc/router.ts`: `agentsRouter`, `commandsRouter`, `hooksRouter`, `settingsRouter`

## Scenario closure

- `#settings` (scenarios.md:1879) — satisfied via `ensemble settings set/unset/list/show/sync`
- §Library-First Resource Intake critical path (scenarios.md:1488) — satisfied via noun-first verbs
- §Install State Matrix critical path (scenarios.md:1576) — satisfied via `ensemble install`/`uninstall`
- §Browse Engine (v2.0) — all 3 scenarios satisfied (scenarios.md:2008, L2017, L2023)
- §Managed Agents/Commands/Hooks/Settings desktop-side coverage — complete via the four new sub-routers

## Known anomalies (not blockers)

1. **Version sequence skipped `v1.2.0`.** The plan called for a minor bump at chunk 8's public-surface break (1.1.2 → 1.2.0). Auto-patch-bump on each chunk produced 1.2.1 → 1.2.2 → 1.2.3 instead, with a fourth 1.2.4 cut by the auto-bump on the retro commit. The minor boundary crossed correctly; the `.0` tag was simply never materialized. Cosmetic only.

2. **CLAUDE.md is post-build stale** on two fronts: (a) the project summary at L5 still says "Library, CLI, TUI, and desktop app" and "TUI browse engine (`browse.ts`) remain v2.0.1 targets" — both outdated after today's browse-scope evolve and the chunk 9 build; (b) the desktop-IPC note inserted by the build at L53 is positioned inside the architecture table (awkward). Next `/fctry:review` will catch both.

3. **Playwright e2e harness** — snapshots.spec.ts's Electron-launch issue from the earlier session wasn't debugged in this build. Still deferred.

## Follow-ups queued in the retro

See `.fctry/retros/2026-04-18-chunks-8-10.md` for the full list. Highlights: CLAUDE.md parity cleanup (see Anomaly #2), Playwright harness debug, pre-existing ~180 biome baseline cleanup (still untouched).
