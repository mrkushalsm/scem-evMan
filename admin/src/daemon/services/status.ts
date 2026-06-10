import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { dockerAvailable, runCompose } from "./compose";
import { ComposeCommand } from "./compose-command";
import { getOperationState } from "./operations";
import { run } from "../core/run";
import type { Paths } from "../core/types";

export async function getStatus(paths: Paths) {
  let current = "unknown";
  try {
    const manifestPathRoot = join(paths.root, "manifest.json");
    const manifestPathApp = join(paths.root, "app", "manifest.json");
    
    if (existsSync(manifestPathRoot)) {
      const manifest = JSON.parse(readFileSync(manifestPathRoot, "utf-8"));
      current = manifest.version || "unknown";
    } else if (existsSync(manifestPathApp)) {
      const manifest = JSON.parse(readFileSync(manifestPathApp, "utf-8"));
      current = manifest.version || "unknown";
    } else {
      const pkgUrl = new URL("../../../../package.json", import.meta.url);
      const pkg = JSON.parse(readFileSync(pkgUrl, "utf-8"));
      current = pkg.version || "unknown";
    }
  } catch (e) {
    // fallback if both are missing
  }
  const dockerOk = await dockerAvailable();
  let containers: any[] = [];

  const res = await runCompose(ComposeCommand.from(paths).ps());
  if (res.code === 0 && res.stdout.trim()) {
    try {
      const stdout = res.stdout.trim();
      if (stdout.startsWith("[")) {
        containers = JSON.parse(stdout);
      } else {
        containers = stdout
          .split(/\r?\n/)
          .filter(Boolean)
          .map((line) => JSON.parse(line));
      }
    } catch {
      containers = [];
    }
  }

  return {
    currentVersion: current,
    dockerAvailable: dockerOk,
    releases: [],
    containers,
    operation: getOperationState(),
  };
}

export async function getStorageUsage(paths: Paths) {
  const targets = {
    database: join(paths.dataDir, "database"),
    uploads: join(paths.dataDir, "uploads"),
    backups: join(paths.dataDir, "backups"),
  };
  const usage: Record<string, { bytes: number }> = {};
  for (const [key, dir] of Object.entries(targets)) {
    usage[key] = await diskUsage(dir);
  }
  return usage;
}

async function diskUsage(path: string) {
  if (!existsSync(path)) return { bytes: 0 };
  const res = await run("du", ["-sk", path]);
  if (res.code !== 0 || !res.stdout.trim()) return { bytes: 0 };
  const sizeKb = Number(res.stdout.trim().split(/\s+/)[0]);
  return { bytes: sizeKb * 1024 };
}
