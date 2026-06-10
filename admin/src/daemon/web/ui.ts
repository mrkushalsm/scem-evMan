import { existsSync, lstatSync } from "fs";
import { join } from "path";
import type { Paths } from "../core/types";

export function serveUi(paths: Paths, pathname: string) {
  const dist = paths.uiDistDir;
  if (!existsSync(dist)) {
    return new Response("UI build not found", { status: 404 });
  }

  const requested = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = join(dist, requested);
  if (existsSync(filePath) && !lstatSync(filePath).isDirectory()) {
    return new Response(Bun.file(filePath));
  }

  const indexPath = join(dist, "index.html");
  if (existsSync(indexPath)) {
    return new Response(Bun.file(indexPath));
  }

  return new Response("UI not available", { status: 404 });
}
