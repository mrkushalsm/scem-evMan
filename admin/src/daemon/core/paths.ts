import { mkdirSync } from "fs";
import { join } from "path";
import type { Paths } from "./types";

export function getPaths(): Paths {
  const root = process.env.POMELO_ROOT ?? "/opt/pomelo";
  const apiHost = process.env.POMELO_HOST ?? "127.0.0.1";
  const apiPort = Number(process.env.POMELO_PORT ?? "8462");
  const configDir = join(root, "config");
  const dataDir = join(root, "data");
  const runtimeDir = join(root, "runtime");
  const logsDir = join(runtimeDir, "logs");
  const tmpDir = join(runtimeDir, "tmp");
  const uiDistDir = join(root, "app", "admin", "dist");
  const envFile = join(configDir, "app.env");
  const configFile = join(configDir, "config.yaml");
  const caddyFile = join(configDir, "Caddyfile");
  const judge0File = join(configDir, "judge0.conf");

  return {
    root,
    apiHost,
    apiPort,
    configDir,
    dataDir,
    runtimeDir,
    logsDir,
    tmpDir,
    uiDistDir,
    envFile,
    configFile,
    caddyFile,
    judge0File,
  };
}

export function getComposeConfig() {
  return {
    app: process.env.POMELO_APP_COMPOSE ?? "docker/app/docker-compose.yaml",
    judge:
      process.env.POMELO_JUDGE0_COMPOSE ?? "docker/judge0/docker-compose.yaml",
    project: process.env.POMELO_DOCKER_PROJECT ?? "pomelo",
  };
}

export function ensureBase(paths: Paths) {
  mkdirSync(paths.configDir, { recursive: true });
  mkdirSync(paths.dataDir, { recursive: true });
  mkdirSync(paths.runtimeDir, { recursive: true });
  mkdirSync(paths.logsDir, { recursive: true });
  mkdirSync(paths.tmpDir, { recursive: true });
}
