import { existsSync, readFileSync } from "fs";
import { join } from "path";
import YAML from "yaml";

export const APP_ROOT = process.env.POMELO_ROOT ?? "/opt/pomelo";
export const DEFAULT_DAEMON_BIN = `${APP_ROOT}/app/admin/bin/pomelod`;

function resolveApiBase(): string {
  if (process.env.POMELO_API_URL) return process.env.POMELO_API_URL;
  try {
    const configFile = join(APP_ROOT, "config", "config.yaml");
    if (existsSync(configFile)) {
      const cfg = YAML.parse(readFileSync(configFile, "utf8"));
      const port = cfg?.ports?.admin;
      if (port && Number.isInteger(Number(port))) {
        return `http://127.0.0.1:${port}`;
      }
    }
  } catch {}
  return "http://127.0.0.1:8462";
}

export const API_BASE = resolveApiBase();
