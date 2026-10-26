// Installs every registry item that has a src/<name>.usage-check.tsx into a
// throwaway `shadcn init -b radix` project, copies the usage-checks next to
// them and runs tsc. This repo's own tsc covers Base UI through packages/ui;
// this covers the Radix half of the drop-in contract.
// Run `pnpm registry:build` first: items install from the built public/r.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webDir = fileURLToPath(new URL("..", import.meta.url));
const shadcn = path.join(webDir, "node_modules/.bin/shadcn");
const project = "smoke-radix";

const registry = JSON.parse(
  await readFile(path.join(webDir, "registry.json"), "utf-8")
);
const items = registry.items
  .map(({ name }) => name)
  .filter((name) =>
    existsSync(path.join(webDir, `src/${name}.usage-check.tsx`))
  );

const run = (command, args, cwd) =>
  execFileSync(command, args, { cwd, stdio: "inherit" });

const workDir = await mkdtemp(path.join(tmpdir(), "registry-radix-"));

try {
  run(
    shadcn,
    [
      "init",
      "-t",
      "vite",
      "-b",
      "radix",
      "-p",
      "nova",
      "-n",
      project,
      "--no-monorepo",
      "--yes",
    ],
    workDir
  );
  const projectDir = path.join(workDir, project);

  for (const name of items) {
    run(
      shadcn,
      [
        "add",
        path.join(webDir, `public/r/${name}.json`),
        "--cwd",
        projectDir,
        "--overwrite",
        "--yes",
      ],
      projectDir
    );
  }

  await Promise.all(
    items.map(async (name) => {
      const check = await readFile(
        path.join(webDir, `src/${name}.usage-check.tsx`),
        "utf-8"
      );
      await writeFile(
        path.join(projectDir, `src/components/ui/${name}-usage-check.tsx`),
        check.replaceAll(`"@portfolio/ui/components/${name}"`, `"./${name}"`)
      );
    })
  );

  run("npx", ["tsc", "--noEmit", "-p", "tsconfig.app.json"], projectDir);
  console.log(`Radix: ${items.join(", ")} install and typecheck.`);
} finally {
  await rm(workDir, { force: true, recursive: true });
}
