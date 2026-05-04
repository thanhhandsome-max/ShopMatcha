// src/lib/db.ts
import 'dotenv/config';
import sql from 'mssql';

const config: sql.config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT || 1433),
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true' || false,
        trustServerCertificate: true,
    },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

let pool: sql.ConnectionPool | null = null;

export async function getPool() {
    if (pool && pool.connected) return pool;
    pool = await new sql.ConnectionPool(config).connect();
    return pool;
}

export async function query<T = any>(sqlText: string, params?: Record<string, any>) {
    try {
        const p = await getPool();
        const req = p.request();
        if (params) {
            for (const k of Object.keys(params)) {
                req.input(k, params[k]);
            }
        }
        const result = await req.query(sqlText);
        return result.recordset as T[];
    } catch (err) {
        console.error('DB query error', err);
        throw err;
    }
}

export async function closePool() {
    if (pool) {
        await pool.close();
        pool = null;
    }
}
