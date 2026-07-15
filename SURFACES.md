# Surfaces

This project ships through multiple surfaces, and several depend on each other in
non-obvious ways. Before calling a change "done," sweep this list and ask which
surfaces it touches. Most changes touch one or two; the dangerous ones touch a
cross-cutting edge without looking like they do.

## The map

| Surface | Lives in | A change ripples here when you… | Verify |
|---|---|---|---|
| Schemas and config | `src/schemas.ts`, `src/config.ts` | change a resource shape, default, validation rule, or persisted config field | Run typecheck and schema/config round-trip tests, including a consumer import fixture |
| Operations and lifecycle | `src/operations.ts`, `src/lifecycle.ts` | add or rename a mutation, noun, result shape, or ownership rule | Run pure-operation tests and confirm no I/O entered the operations layer |
| Sync, snapshots, and settings | `src/sync.ts`, `src/snapshots.ts`, `src/hooks.ts`, `src/settings.ts`, `src/managed-settings.ts` | change target writes, markers, merge behavior, rollback, or managed ownership | Run mixed managed/unmanaged fixtures twice plus atomic-write and rollback failure tests |
| CLI | `src/cli/` | change operations, lifecycle verbs, browse semantics, output, or error envelopes | Run CLI tests and exercise representative commands against a temporary config home |
| Desktop app | `packages/desktop/` | change library APIs, IPC routers, serialized types, browse results, or mutation behavior | Run desktop typecheck/unit tests and targeted Playwright flows |
| Discovery and registries | `src/browse.ts`, `src/discovery/`, `src/registry.ts`, `src/projects.ts`, `src/setlist.ts` | change search, marketplace filters, optional adapters, or project reads | Compare library/CLI/desktop results and test missing optional dependencies |
| Public package surface | `src/index.ts`, `package.json`, generated types | add, remove, or rename an export consumed by another app | Build the package, typecheck a consumer fixture, and sweep controlled consumers such as Chorus |

## Cross-cutting edges (the silent ones)

- A schema change ripples into config persistence, operations types, CLI parsing,
  desktop IPC serialization, package exports, and downstream consumers.
- A mutation-verb change must land across operations, lifecycle dispatch, CLI, desktop,
  tests, exports, and Chorus in one coordination window.
- `browse.ts` is shared by the CLI and desktop Registry; search or filter drift in either
  adapter means the two products no longer describe the same library.

## The sweep

- Did `npm test`, typecheck, and the relevant desktop checks pass?
- Did managed/unmanaged sync fixtures and rollback behavior remain intact?
- Did CLI, desktop IPC, package exports, and controlled consumers receive API changes?
- Did optional integrations still degrade cleanly when absent?
