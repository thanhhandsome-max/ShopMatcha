// src/lib/db.ts
import 'dotenv/config';
import sql from 'mssql';

const dbUser = process.env.DB_USER?.trim();
const dbPassword = process.env.DB_PASSWORD?.trim();
const dbServer = process.env.DB_SERVER?.trim() || 'localhost';
const dbDatabase = process.env.DB_DATABASE?.trim();
const dbPort = Number(process.env.DB_PORT || 1433);
const dbEncrypt = process.env.DB_ENCRYPT === 'true';

if (!dbUser || !dbPassword || !dbDatabase) {
    throw new Error(
        'Database connection is not configured. Please set DB_USER, DB_PASSWORD, and DB_DATABASE in .env.'
    );
}

const config: sql.config = {
    user: dbUser,
    password: dbPassword,
    server: dbServer,
    database: dbDatabase,
    port: dbPort,
    options: {
        encrypt: dbEncrypt,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

let pool: sql.ConnectionPool | null = null;

export async function getPool() {
    console.log("Đang kết nối tới:", process.env.DB_SERVER, "với User:", process.env.DB_USER);
    if (pool && pool.connected) return pool;
    try {
        pool = await new sql.ConnectionPool(config).connect();
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err);
        throw new Error(
            'Không thể kết nối tới cơ sở dữ liệu. Vui lòng kiểm tra DB_USER, DB_PASSWORD, DB_SERVER và DB_DATABASE trong .env.'
        );
    }
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
