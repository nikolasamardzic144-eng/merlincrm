import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

export function getPool(): Pool {
  if (!global._pgPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL nije podesen. Postavi env varijablu DATABASE_URL na istu Postgres bazu koju koristi n8n."
      );
    }
    global._pgPool = new Pool({
      connectionString,
      ssl: connectionString.includes("railway")
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }
  return global._pgPool;
}
