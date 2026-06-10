export type Paths = {
  root: string;
  apiHost: string;
  apiPort: number;
  configDir: string;
  dataDir: string;
  runtimeDir: string;
  logsDir: string;
  tmpDir: string;
  uiDistDir: string;
  envFile: string;
  configFile: string;
  caddyFile: string;
  judge0File: string;
};

export type Logger = {
  info: (message: string) => void;
  error: (message: string) => void;
};
