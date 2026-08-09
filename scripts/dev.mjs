#!/usr/bin/env node
import { spawn, spawnSync, execSync } from "node:child_process";

const isWindows = process.platform === "win32";
const shell = true;

const required = [
  { cmd: "docker", args: ["info"],      name: "Docker",   hint: isWindows ? "Install Docker Desktop: https://www.docker.com/products/docker-desktop" : "Install Docker: https://docs.docker.com/engine/install" },
  { cmd: "bun",    args: ["--version"], name: "Bun",      hint: isWindows ? "winget install Oven-sh.Bun  or  https://bun.sh" : "curl -fsSL https://bun.sh/install | bash" },
  { cmd: "pnpm",   args: ["--version"], name: "pnpm",     hint: "npm install -g pnpm" },
  { cmd: "node",   args: ["--version"], name: "Node.js",  hint: "https://nodejs.org" },
];

let missing = false;
for (const tool of required) {
  const res = spawnSync(tool.cmd, tool.args, { stdio: "pipe", shell: true });
  if (res.status !== 0 || res.error) {
    console.error(`\x1b[31m✖ ${tool.name} is not available or not running.\x1b[0m`);
    console.error(`  → ${tool.hint}\n`);
    missing = true;
  } else {
    const version = res.stdout?.toString().trim().split("\n")[0] ?? "";
    console.log(`\x1b[32m✔ ${tool.name}\x1b[0m${version ? `  (${version})` : ""}`);
  }
}

if (missing) {
  console.error("\n\x1b[31mOne or more required tools are missing. Please install them and try again.\x1b[0m");
  process.exit(1);
}

console.log("");

let torndown = false;
function teardown() {
  if (torndown) return;
  torndown = true;
  console.log("\n\x1b[33mStopping dev infrastructure…\x1b[0m");
  if (isWindows && child?.pid) {
    try { execSync(`taskkill /F /T /PID ${child.pid}`, { stdio: "pipe" }); } catch {}
  }
  spawnSync("pnpm", ["dev:down"], { stdio: "inherit", shell });
}

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: "inherit", shell });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

run("pnpm", ["dev:infra"]);
run("pnpm", ["--filter", "@pomelo/code-gen", "build"]);

let child = spawn("pnpm", ["exec", "turbo", "run", "dev"], { stdio: "inherit", shell, detached: false });

if (isWindows) {
  process.on("SIGINT", () => { teardown(); process.exit(0); });
  process.on("SIGTERM", () => { teardown(); process.exit(0); });
} else {
  for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => {});
}

process.on("exit", teardown);
child.on("exit", (code) => process.exit(code ?? 0));
