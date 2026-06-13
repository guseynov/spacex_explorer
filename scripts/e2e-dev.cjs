/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn } = require("child_process");

const API_BASE_URL = "http://127.0.0.1:3100/api/mock-launch-library/2.3.0";

const child = spawn("npm", ["run", "dev"], {
  env: {
    ...process.env,
    LAUNCH_LIBRARY_API_BASE_URL: API_BASE_URL,
    PORT: "3100",
    HOSTNAME: "127.0.0.1",
  },
  stdio: "inherit",
});

const shutdown = () => {
  child.kill("SIGTERM");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
