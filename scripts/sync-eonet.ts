import { loadEnvConfig } from "@next/env";
import { syncRecentEvents } from "@/lib/eonet/sync-service";

loadEnvConfig(process.cwd());

async function main() {
  const summary = await syncRecentEvents();
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
