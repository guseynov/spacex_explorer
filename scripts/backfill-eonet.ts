import { loadEnvConfig } from "@next/env";
import { syncBackfill } from "@/lib/eonet/sync-service";

loadEnvConfig(process.cwd());

async function main() {
  const startDate = process.env.EONET_BACKFILL_START ?? "2018-01-01";
  const endDate = new Date().toISOString().slice(0, 10);
  const summary = await syncBackfill({
    startDate,
    endDate,
  });

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
