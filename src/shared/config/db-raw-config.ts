import { Pool, PoolClient, PoolConfig } from 'pg';

export function getPgConfig(): PoolConfig {

  const ssl =
    (process.env.DB_SSL ?? 'false').toLowerCase() === 'true'
      ? { rejectUnauthorized: false }
      : undefined;

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    database: process.env.DB_NAME ,
    user: process.env.DB_USER ,
    password: process.env.DB_PASS,
    ssl,
    max: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_MS ?? '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONN_MS ?? '5000', 10),
  };
}

export async function withPgTransaction<T>(
  pool: Pool,
  work: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export function createPgPool(): Pool {
  const pool = new Pool(getPgConfig());
  pool.on('error', (err) => {
    console.error('[pg] idle client error', err);
  });
  return pool;
}
