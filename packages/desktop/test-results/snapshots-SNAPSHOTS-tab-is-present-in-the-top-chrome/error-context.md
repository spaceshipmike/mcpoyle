# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: snapshots.spec.ts >> SNAPSHOTS tab is present in the top chrome
- Location: e2e/snapshots.spec.ts:86:1

# Error details

```
"beforeAll" hook timeout of 30000ms exceeded.
```

# Test source

```ts
  1   | import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
  2   | import { tmpdir } from "node:os";
  3   | import { dirname, join } from "node:path";
  4   | import { fileURLToPath } from "node:url";
  5   | import { type ElectronApplication, type Page, expect, test } from "@playwright/test";
  6   | import { _electron as electron } from "playwright";
  7   | 
  8   | const __dirname = dirname(fileURLToPath(import.meta.url));
  9   | 
  10  | let app: ElectronApplication;
  11  | let page: Page;
  12  | let configDir: string;
  13  | let snapshotsDir: string;
  14  | 
> 15  | test.beforeAll(async () => {
      |      ^ "beforeAll" hook timeout of 30000ms exceeded.
  16  |   configDir = mkdtempSync(join(tmpdir(), "ensemble-snaps-"));
  17  |   mkdirSync(join(configDir, "ensemble"), { recursive: true });
  18  |   writeFileSync(
  19  |     join(configDir, "ensemble", "config.json"),
  20  |     JSON.stringify({
  21  |       servers: [],
  22  |       groups: [],
  23  |       skills: [],
  24  |       plugins: [],
  25  |       clients: [],
  26  |       marketplaces: [],
  27  |       rules: [],
  28  |       settings: {},
  29  |       profiles: {},
  30  |       agents: [],
  31  |       commands: [],
  32  |     }),
  33  |   );
  34  | 
  35  |   // Seed a snapshot so the SnapshotsView has something to render.
  36  |   snapshotsDir = join(configDir, "ensemble", "snapshots");
  37  |   const snapId = "2026-04-18T10-00-00.000Z-abc123";
  38  |   const snapDir = join(snapshotsDir, snapId);
  39  |   mkdirSync(join(snapDir, "files"), { recursive: true });
  40  |   const capturedPath = join(configDir, "captured.txt");
  41  |   writeFileSync(capturedPath, "pre-sync content\n", "utf-8");
  42  |   writeFileSync(join(snapDir, "files", "abc123__captured.txt"), "pre-sync content\n", "utf-8");
  43  |   writeFileSync(
  44  |     join(snapDir, "manifest.json"),
  45  |     JSON.stringify(
  46  |       {
  47  |         id: snapId,
  48  |         createdAt: "2026-04-18T10:00:00.000Z",
  49  |         syncContext: "sync claude-code",
  50  |         files: [
  51  |           {
  52  |             path: capturedPath,
  53  |             state: "existing",
  54  |             preContentPath: "files/abc123__captured.txt",
  55  |           },
  56  |           {
  57  |             path: join(configDir, "brand-new.txt"),
  58  |             state: "new-file",
  59  |           },
  60  |         ],
  61  |       },
  62  |       null,
  63  |       2,
  64  |     ),
  65  |     "utf-8",
  66  |   );
  67  | 
  68  |   app = await electron.launch({
  69  |     args: [join(__dirname, "../out/main/index.js")],
  70  |     env: {
  71  |       ...process.env,
  72  |       ENSEMBLE_CONFIG_DIR: join(configDir, "ensemble"),
  73  |       ENSEMBLE_SNAPSHOTS_DIR: snapshotsDir,
  74  |       NODE_ENV: "test",
  75  |     },
  76  |   });
  77  | 
  78  |   page = await app.firstWindow();
  79  |   await page.waitForLoadState("domcontentloaded");
  80  | });
  81  | 
  82  | test.afterAll(async () => {
  83  |   await app?.close();
  84  | });
  85  | 
  86  | test("SNAPSHOTS tab is present in the top chrome", async () => {
  87  |   await expect(page.getByRole("button", { name: "SNAPSHOTS" })).toBeVisible();
  88  | });
  89  | 
  90  | test("SNAPSHOTS view lists captured snapshots in reverse-chronological order", async () => {
  91  |   await page.getByRole("button", { name: "SNAPSHOTS" }).click();
  92  |   // Left rail shows the seeded snapshot.
  93  |   await expect(page.getByTestId("snapshot-item-2026-04-18T10-00-00.000Z-abc123")).toBeVisible();
  94  |   // Right pane shows the snapshot id.
  95  |   await expect(page.getByText("2026-04-18T10-00-00.000Z-abc123")).toBeVisible();
  96  |   // And the sync context metadata.
  97  |   await expect(page.getByText("sync claude-code")).toBeVisible();
  98  | });
  99  | 
  100 | test("file manifest expands on click and shows per-file state", async () => {
  101 |   await page.getByRole("button", { name: "SNAPSHOTS" }).click();
  102 |   await page.getByTestId("files-toggle").click();
  103 |   // The captured file appears with its state tag.
  104 |   await expect(page.getByText("captured.txt", { exact: false })).toBeVisible();
  105 |   await expect(page.getByText("brand-new.txt", { exact: false })).toBeVisible();
  106 | });
  107 | 
  108 | test("restore dialog shows the CLI-mirror warning copy", async () => {
  109 |   await page.getByRole("button", { name: "SNAPSHOTS" }).click();
  110 |   await page.getByTestId("restore-button").click();
  111 |   const dialog = page.getByTestId("restore-dialog");
  112 |   await expect(dialog).toBeVisible();
  113 |   const msg = page.getByTestId("restore-dialog-message");
  114 |   await expect(msg).toContainText(/Restore snapshot from/);
  115 |   await expect(msg).toContainText(/overwrite 1 file/);
```