import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DATABASE_URL
      ?? "postgresql://postgres:postgres@localhost:5432/eonet_explorer?schema=public",
  },
  migrations: {
    path: "prisma/migrations",
  },
});
