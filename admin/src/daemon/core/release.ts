import { join } from "path";
import type { Paths } from "./types";

export function getCurrentReleaseDir(paths: Paths) {
  return join(paths.root, "app");
}
