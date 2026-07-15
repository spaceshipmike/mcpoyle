# CLAUDE.md

## Project

Ensemble — Library, CLI, TUI, and desktop app for centrally managing Claude Code extension artifacts across 17 AI clients. The library manages MCP servers, skills, plugins, hooks, settings, rollback snapshots, subagents, slash commands, and local discovery. Library-first: designed to be consumed by apps (like Chorus) as a dependency. The Electron desktop app provides visual management with full CLI parity; `ensemble browse` provides a TUI-grade discovery experience.

## Tech Stack

- TypeScript, Node 24+, npm (workspaces monorepo)
- CLI: Commander.js (`ensemble` / `ens`)
- Desktop: Electron + React + Tailwind CSS v4 (packages/desktop/), scaffold-compliant (sandboxed, tRPC bridge, minimal preload)
- Desktop IPC: `electron-trpc` 0.7 + `@trpc/server`/`@trpc/client`/`@trpc/react-query` **pinned to ^10.45** and `@tanstack/react-query` pinned to ^4.36. Do not bump any of these independently — electron-trpc 0.7 is not compatible with tRPC v11, and tRPC v10 requires react-query v4. Bumping any one of the four breaks the stack until electron-trpc ships a v11 release.
- Desktop wire format: superjson transformer on both router and client (rich types across IPC)
- Validation: Zod (schemas exported for consumers)
- Build: tsup (library), electron-vite (desktop, main + preload emit CJS so they can `require()` native deps under sandbox)
- Test: Vitest (library/CLI), Playwright (desktop E2E)
- Lint: Biome
- Config: `~/.config/ensemble/config.json`
- Skills: `~/.config/ensemble/skills/`

## Architecture

Library-first with four layers: schemas/config → operations → sync/I/O → presentation (CLI + desktop app). Monorepo: library/CLI at root, desktop at `packages/desktop/`.

| Module | Role |
|--------|------|
| `schemas.ts` | Zod schemas and inferred TypeScript types for the entire data model |
| `config.ts` | Config I/O (loadConfig/saveConfig), query helpers, resolution helpers |
| `operations.ts` | **Pure functions** for all mutations: `(config, params) → { config, result }` |
| `clients.ts` | 17 client definitions, detection, format adapters, CC settings helpers |
| `sync.ts` | Sync engine — resolve + write configs, non-destructive hook/settings merge, pre-sync snapshot creation, drift detection, symlink fan-out |
| `skills.ts` | SKILL.md frontmatter parser, canonical store CRUD |
| `search.ts` | BM25-style local capability search across servers and skills |
| `registry.ts` | Registry adapters (Official + Glama), caching, security summary |
| `doctor.ts` | Deterministic health audit, structured scoring, 6 categories (adds `capability`) |
| `hooks.ts` | Hook store — non-destructive `settings.json` merge under the `hooks` key, seven lifecycle events |
| `settings.ts` | Declarative `settings.json` key management — non-destructive key-level merge preserving unmanaged keys |
| `snapshots.ts` | Safe apply / rollback snapshots — pre-sync capture, forward-restore, retention |
| `agents.ts` | Subagent store — `.claude/agents/*.md` frontmatter parser, canonical store CRUD, fan-out to client agents directories; dual-field contract (`description` from frontmatter, `userNotes` library-side only) |
| `commands.ts` | Slash command store — `.claude/commands/*.md` frontmatter parser (`description` + optional `allowed-tools`, `argument-hint`), canonical store CRUD, fan-out to client commands directories |
| `projects.ts` | Project registry reader (optional better-sqlite3) |
| `secrets.ts` | Secret scanning — regex detection in env values and skill content |
| `usage.ts` | Usage tracking for self-learning search scoring |
| `setlist.ts` | Setlist capability integration (read-only, optional `@setlist/core`) |
| `init.ts` | Guided onboarding (`ensemble init` / `--auto`) |
| `export.ts` | Profile-as-plugin group export |
| `discover.ts` | Filesystem scan for existing installed skills and plugins; feeds `addToLibrary` during `ensemble init` |
| `lifecycle.ts` | Noun-first verb dispatcher — routes `pull`/`install`/`uninstall`/`remove`/`library` across the existing operations layer |
| `managed-settings.ts` | Canonical managed-settings store at `~/.config/ensemble/managed-settings.json`, backing the `ensemble settings` verbs |
| `browse.ts` | Library-side browse engine — pure-function fuzzy search over library + discoverable resources with `@marketplace/` filter parsing. Powers `ensemble browse` and the desktop Registry view. |
| `cli/index.ts` | Thin Commander.js wrapper over operations and lifecycle |

Desktop IPC (chunk 10) now exposes `agents`, `commands`, `hooks`, and `settings` sub-routers alongside the existing `browse` and `snapshots` routers — the Electron renderer can drive every v2.0.1 resource type.
| `index.ts` | Public API barrel export |
| `packages/desktop/` | Electron desktop app — React + Tailwind over library via IPC |

Future product targets belong in issues or temporary notes under `designs/`;
the running library and tests are the source of truth for what is built.

## Package Exports

```ts
import { loadConfig, saveConfig, addServer } from 'ensemble';
import { ServerSchema } from 'ensemble/schemas';
import { syncClient } from 'ensemble/sync';
```

## Rules

1. **Operations are pure.** `(config, params) → { config, result }`. No I/O in operations.ts.
2. **Run tests before committing.** All tests must pass: `npm test`
3. **Additive sync only.** Never delete servers, plugins, skills, agents, commands, hooks, or managed settings keys the user didn't create via Ensemble. The `__ensemble` marker (or `ensemble: managed` frontmatter on markdown resources) identifies managed entries.
4. **Secrets stay in 1Password.** Env values may contain `op://` references — store them as-is, never resolve.
5. **Always update docs with functionality changes.** Update `COMMANDS.md` and the relevant agent-model or product documentation.
6. **Type check.** `npx tsc --noEmit` must pass.

## Agent-Model & the prototype-driven loop

<!-- inserted by fctry init-agent-model -->

This project follows fctry's prototype-driven methodology. The running product
is the source of truth for behavior; the files below preserve the constraints
and learning that must travel across sessions and runtimes.

The agent-model files:

- **`INVARIANTS.md`** — what must stay true (ENFORCED vs PROSE)
- **`SURFACES.md`** — the cross-surface ripple map
- **`MODEL_DECISIONS.md`** — decisions, reasons, and revisit triggers
- **`.fctry/lessons.md`** — running learnings

Forward-looking design lives in `designs/<slug>.md`, using
`designs/_template.md`. A design note is temporary: distill accepted decisions
into the agent model and issues, then archive it under `designs/_archived/`.

The loop is: *experience → issue → Diagnose → Scope → Build in a task-owned
worktree → local checks → CI → independent review → `/close`*. Final merging
remains operator-authorized.

Use the runtime-neutral core for deterministic behavior:

```text
fctry host capabilities --json
fctry project mode --json
fctry close inspect --json
fctry phase validate <packet.json> --json
fctry task create|claim|renew|complete|review
fctry message send|ack|reject
fctry recover --json
```

Shared primitives are resolved from `FCTRY_PLUGIN_ROOT`. Runtime adapters may
populate compatibility aliases, but project instructions and custom scripts
must not require a Claude- or Codex-specific plugin-root variable.

Session state is namespaced under `.fctry/sessions/`. Do not hand-edit shared
state or another session's record. Write-capable tasks declare scope and use a
task-owned worktree and branch; overlapping active scopes are rejected.

For substantive user-facing reports, apply the shared `operator-comms` skill:
plain language must preserve the outcome, material detail, practical
consequences, uncertainty, recommendation, and next decision.

Sentinels:

- `.fctry/no-session-handoff` — use the host's canonical handoff only
- `.fctry/substrate-tier` — substrate sizing
- `.fctry/agent-model-init` — agent-model bootstrap date
