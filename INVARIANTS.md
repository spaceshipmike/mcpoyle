# INVARIANTS — what must stay true

> Part of this project's agent-model (see `CLAUDE.md` → "Agent-Model & the
> prototype-driven loop"). Structured "what must be true" register — guardrails, not
> implementation. _What_ must hold, never _how_ it's done (that's the agent's domain).
>
> Each invariant is tagged:
>
> - **ENFORCED** — a test / check / CI gate proves it. Cannot silently rot.
> - **PROSE** — relied on but unguarded. A candidate to _graduate_ into an enforced
>   check.
>
> The `/close` loop's standing job is to move invariants PROSE → ENFORCED. A rising
> enforced ratio is the signal the model is earning its keep.
>
> **Authority precedence** (see `PROTOTYPE-DRIVEN.md §1a` for the full rationale — the
> prototype is the oracle for _how it behaves_, not for _what must be true_):
>
> 1. Legal / security / privacy obligations
> 2. ENFORCED invariants (this file, tagged ENFORCED)
> 3. Reviewer consensus on risky changes
> 4. Running-prototype behavior
> 5. Recalled lessons / decisions
> 6. Generated / derived views (PROSE invariants sit on this rung)
>
> **Reconciled only against code and lived experience — never against itself.** If an
> entry here contradicts the running product on a rung-4 question, the product wins and
> this file is wrong.

## Architecture

- **Keep mutations in the pure library core.** Every mutation remains an immutable
  `(config, params) → { config, result }` operation with no direct I/O or hidden state;
  the CLI and desktop stay thin presentation layers over library operations and sync. —
  **PROSE** (cycle 0; migrated from legacy spec). _Graduate to ENFORCED:_ add an AST
  boundary test that rejects filesystem/write APIs and config load/save calls in
  `src/operations.ts`, and requires CLI and desktop mutation handlers to delegate
  through `operations.ts` or `lifecycle.ts`.

- **Keep schema and type ownership unified.** `src/schemas.ts` is the single source of
  truth for the data model: resource shapes are Zod schemas, TypeScript types are
  inferred from them, and schemas remain exported for library consumers. — **PROSE**
  (cycle 0; migrated from legacy spec). _Graduate to ENFORCED:_ add a static export test
  pairing every resource `*Schema` with a `z.infer` type, verify the `./schemas` package
  export, and type-check a consumer fixture that imports both.

- **Keep optional integrations isolated and read-only.** Project-registry and Setlist
  integrations remain optional and read-only; a missing package, database, or connection
  degrades to disabled, empty, or null results without breaking Ensemble's core library.
  — **PROSE** (cycle 0; migrated from legacy spec). _Graduate to ENFORCED:_ force
  `better-sqlite3` and `@setlist/core` loads to fail in isolated tests, assert graceful
  fallback, and verify the adapters open/query without write methods.

## Sync safety

- **Managed sync stays inside Ensemble's ownership boundary.** Sync is additive and
  idempotent: Ensemble changes only entries marked `__ensemble: true`, markdown carrying
  `ensemble: managed`, and settings keys explicitly placed under management; unmarked
  entries and unmanaged settings remain untouched. — **PROSE** (cycle 0; migrated from
  legacy spec). _Graduate to ENFORCED:_ run sync twice against mixed managed/unmanaged
  JSON, markdown, hooks, and settings fixtures and assert identical output plus
  byte-identical unmanaged values.

- **Every sync write is atomic, snapshotted, and reversibly restored.** Before touching
  a target, sync completes a pre-write snapshot of every affected file; writers validate
  temporary content before atomic rename, while rollback creates a new immutable
  forward-restore snapshot and preserves the newer state it replaced. — **PROSE** (cycle
  0; migrated from legacy spec). _Graduate to ENFORCED:_ add failure-injection tests
  proving snapshot completion precedes mutation, invalid writes leave originals
  untouched, and rollback restores exact bytes while retaining both states.

## Secrets / configuration

- **Secrets use references at rest and unconditional redaction outbound.** `op://` is
  the canonical stored form; plaintext credentials trigger doctor findings, and exports,
  telemetry, remote sync, and displayed snippets redact secret values and references
  without an include-secrets bypass. — **PROSE** (cycle 0; migrated from legacy spec).
  _Graduate to ENFORCED:_ cover plaintext and `op://` fixtures in scanner and serializer
  tests, assert reports never expose full values, and assert the CLI has no
  secret-inclusion override.

## Surfaces and propagation

- **Discovery has one cross-surface engine.** The exported `browse.ts` library primitive
  owns fuzzy search and marketplace-filter semantics for both the plain-text CLI and
  desktop Registry, with no presentation code in the engine. — **PROSE** (cycle 0;
  migrated from legacy spec). _Graduate to ENFORCED:_ feed identical fixtures through
  the library export, CLI command, and desktop procedure and assert identical matching,
  filtering, and ordering.

- **Public API breaks propagate in one coordinated sweep.** A mutation-verb change
  updates the operations implementation, package exports, public types, CLI callers,
  desktop IPC handlers, tests, and controlled Chorus consumer before release so no
  surface ships against mixed semantics. — **PROSE** (cycle 0; migrated from legacy
  spec). _Graduate to ENFORCED:_ validate the public export manifest, search Ensemble
  and Chorus for retired verbs, and require both repositories' typechecks and targeted
  contract tests.

## Open tensions (NOT invariants — tracked drift to resolve)

- Cross-repository release gating with Chorus is still procedural; it should become an
  explicit machine-checked coordination contract.
