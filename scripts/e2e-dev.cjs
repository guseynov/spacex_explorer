/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn } = require("child_process");

const API_BASE_URL = "http://127.0.0.1:3000/api/mock-spacex/v4";

const child = spawn("npm", ["run", "dev"], {
  env: {
    ...process.env,
    NEXT_PUBLIC_SPACEX_API_BASE_URL: API_BASE_URL,
    SPACEX_API_BASE_URL: API_BASE_URL,
    PORT: "3000",
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
