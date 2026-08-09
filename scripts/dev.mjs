#!/usr/bin/env node
// Cross-platform replacement for bash `trap 'pnpm dev:down' EXIT INT TERM` (Windows has no trap)
import { spawn, spawnSync } from "node:child_process";

const shell = true;

let torndown = false;
function teardown() {
  if (torndown) return;
  torndown = true;
  spawnSync("pnpm", ["dev:down"], { stdio: "inherit", shell });
}
process.on("exit", teardown);

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: "inherit", shell });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

run("pnpm", ["dev:infra"]);
run("pnpm", ["--filter", "@pomelo/code-gen", "build"]);

const child = spawn("pnpm", ["exec", "turbo", "run", "dev"], { stdio: "inherit", shell });

// No-op signal handlers prevent premature exit before the exit listener fires; Ctrl+C still broadcasts to child
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => {});

child.on("exit", (code) => process.exit(code ?? 0));
