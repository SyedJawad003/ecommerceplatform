import "temporal-polyfill/global";
import "server-only";
import { loadEnvConfig } from "@next/env";
import postgres from "@prisma/orm-postgres/runtime";
import { resolve } from "node:path";
import type { Contract } from "@/../prisma/contract";
import contractJson from "@/../prisma/contract.json" with { type: "json" };

// Use Next's own loader and anchor it at the project root (the cwd used by `next dev`).
const projectRoot = process.cwd();
loadEnvConfig(projectRoot);
const databaseUrl = process.env.DATABASE_URL;

const db = postgres<Contract>({
  contractJson,
  ...(databaseUrl ? { url: databaseUrl } : {}),
});

let connection: ReturnType<typeof db.connect> | undefined;

/** Connect once per server process before using the Prisma ORM or transaction facade. */
export async function connectDb() {
  if (!databaseUrl) {
    throw new Error(`DATABASE_URL is not configured in ${resolve(projectRoot, ".env")} or the process environment.`);
  }

  if (!connection) {
    const attempt = db.connect();
    connection = attempt;
    void attempt.catch(() => {
      if (connection === attempt) connection = undefined;
    });
  }

  await connection;
  return db;
}

export default db;
