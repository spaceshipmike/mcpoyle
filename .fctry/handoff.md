# Handoff — v1.3 → v2.0.1 migration, mid-build

**Last updated:** 2026-04-19
**Build run:** `.fctry/state.json` (status: `awaiting-user`, but the gate is *passed* — see below)
**Resume with:** `/fctry:execute` (will detect the existing buildRun and offer to continue from step 13)

## Where we are

Steps 11a, 11b, 11c, 12 and the MANUAL gate are **all complete**.

- `~/.config/ensemble/config.json` is already in v2.0.1 shape (29 library entries, install matrix reconstructed from 5 detected clients across ~30 projects).
- `~/.config/ensemble/config.json.v1.3.bak` is the verbatim pre-migration backup.
- `ensemble sync --dry-run` reports **already in sync** on all 5 detected clients. Scenario L2175 acceptance gate is satisfied.

**Do NOT re-run `ensemble import-legacy`.** It has already run successfully. Re-running would be a no-op in theory (it checks for existing backup before overwriting), but there is no reason to do it again.

## What's left

- **Step 13 — atomic v1.3-verb rename sweep** (XL, single commit). Scope locked in — see decisions below.
- **Step 14 — delete `src/import-legacy.ts` and its CLI subcommand** (XS, follow-up commit).

## Locked-in decisions for step 13

| Decision | Answer |
|---|---|
| Backup filename | `config.json.v1.3.bak` (already shipped, no change needed) |
| `chorus-app/src/main/services/ensemble-config.ts` — `needsMigration`/`migrate` imports | **Delete them and the surrounding try/catch (L74–78).** They reference exports that never existed; the try/catch silently swallows the ReferenceError. |
| v1.3 scenario test bodies (scenarios.md L282, L426–434, L628) | **Delete test bodies; keep section headers + `v2.0.1 note:` markers.** |
| Desktop UI strategy | **Functional holding pattern.** Rewire the 8 tRPC mutations onto `installResource`/`uninstallResource`. Leave the sidebar looking v1.3 — pivot IA rewrite is step 15+ (out of scope here). |

## Step 13 — concrete scope

**Single atomic commit** across:

- `src/operations.ts` — delete the 8 v1.3 install-state verbs: `enableServer` (L172), `disableServer` (L184), `installPlugin` (L684), `uninstallPlugin` (L717), `enablePlugin` (L736), `disablePlugin` (L751), `installSkill` (L830), `uninstallSkill` (L863). The new library-first operations (`pullFromMarketplace`, `addToLibrary`, `removeFromLibrary`, `installResource`, `uninstallResource`, `getInstallState`, `getLibraryByPivot`, `listLibraryResources`, `getLibraryResource`) are already present.
- `src/index.ts` — drop re-exports for the 8 deleted verbs.
- `src/cli/index.ts` — replace v1.3 per-type grammar (`agents/commands/plugins/skills/hook each with list/add/remove/install/uninstall`) with noun-first grammar: `ensemble pull <source>`, `ensemble add <name> …`, `ensemble install <name> --client …`, `ensemble uninstall`, `ensemble remove`. Keep `registry`/`marketplace`/`sync`/`doctor`/`rollback` groups.
- `src/lifecycle.ts` — stop routing to v1.3 ops underneath. Rewrite `pull()` to call `pullFromMarketplace`. Add real `install()` / `uninstall()` / `add()` functions. Make `remove()` cascade through `getInstallState` → `uninstallResource` → `removeFromLibrary`.
- `src/clients.ts` — already has `supportsProjectScoping` per client (shipped in step 11b).
- `packages/desktop/src/main/ipc/router.ts` — rewrite 8 tRPC mutations: `servers.enable/disable` (L264, L268), `plugins.install/uninstall/enable/disable` (L633, L637, L641, L645), `skills.install/uninstall` (L711, L720). All call `installResource`/`uninstallResource` now.
- `packages/desktop/src/main/ipc/router.test.ts` — update ~10 contract tests.
- `tests/operations.test.ts` (32 refs), `tests/discover.test.ts`, `tests/re-import-preservation.test.ts`, `tests/sync.test.ts`, `tests/export.test.ts`, `tests/doctor.test.ts`, `tests/search.test.ts` — ~55 references total to rewrite or delete.
- `chorus-app/src/main/services/ensemble-config.ts` — drop `needsMigration`/`migrate` imports + try/catch (L74–78); replace the 4 enable/disable wrappers (L270, L277, L284, L291) with `installResource`/`uninstallResource` calls passing `client: 'chorus'`. ~25 lines per spec estimate.
- `.fctry/scenarios.md` — delete test bodies for L282, L426–434, L628. Keep headers + `v2.0.1 note:` markers.
- `.fctry/spec.md` — nothing to change (spec §Migration is already correct).

## After step 13 lands

- **Step 14:** delete `src/import-legacy.ts` and the `ensemble import-legacy` CLI subcommand in a follow-up commit.
- **Post-build gate:** retro, capability registration, build notes, codebase index refresh. Mark each in `.fctry/state.json` under `buildRun.completionGate`.
- **Suggest minor version bump** (1.2.10 → 1.3.0) since the v2.0.1 lifecycle surface is now the only install-state API.

## Known follow-ups outside this build

Parked as roadmap, not blocking:

- v2.0.3 — `ensemble note <ref>` CLI verb (schemas already carry `userNotes`).
- v2.0.4 — snapshot tag format `ens-snap-YYYYMMDD-HHMMSS-<shortsha>`, per-client sync-mode table, forward-restore semantics.
- v2.0.5 — `src/io/atomic-write.ts`, `redactForExport`, typed variables (`ResourceVariableSchema` with `kind`), `launchPrompt` profile field, inherited installation state vocabulary, `upstreamHash(id)` adapter method.
- Chunk 15+ — `sync.ts` write-path rewrite for library → install-matrix projection, 4 new clients, desktop pivot IA.

## Reference

- Recent commits: `e3cdef9` (step 12 bump), `acb4b29` (step 12 translator), `edb56b1` (step 12 fix), `563b267` (v1.2.10 bump).
- Spec: `.fctry/spec.md` v2.4.1 — §Migration (L748–795), §CLI-Surface Lifecycle Verbs (L516–552), §Library API Operations (L329–417).
- Scenarios: `.fctry/scenarios.md` — §Library-First Resource Intake (L1488+), §Install State Matrix (L1576+), §Migration v1.3 → v2.0.1 (L2152+).
- Build notes digest: `~/.fctry/memory.md` (top entry dated 2026-04-19T21:15:00Z).
