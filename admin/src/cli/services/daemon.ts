import { existsSync } from "fs";
import { API_BASE, DEFAULT_DAEMON_BIN } from "../core/config";
import { exitWithError, logInfo } from "../core/logging";

export async function ensureDaemon() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (res.ok) return;
  } catch {}
  await startDaemon();
}

export async function startDaemon() {
  if (await daemonAlive()) {
    logInfo("pomelod is already running");
    return;
  }
  const daemonBin = process.env.POMELO_DAEMON_BIN ?? DEFAULT_DAEMON_BIN;
  if (!existsSync(daemonBin)) {
    exitWithError(`Daemon binary not found at ${daemonBin}`, 1);
  }
  logInfo("Starting daemon...");
  Bun.spawn({
    cmd: [daemonBin, "--daemon"],
    stdin: "ignore",
    stdout: "ignore",
    stderr: "ignore",
    env: { ...process.env },
  });
  await waitForDaemon();
}

async function daemonAlive() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}

async function waitForDaemon(timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await daemonAlive()) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  exitWithError("pomelod did not start", 2);
}
