import mysql from 'mysql2/promise';

let pool: mysql.Pool;

export const useDB = () => {
    if (!pool) {
        const config = useRuntimeConfig();
        const dbConfig = config.database;

        pool = mysql.createPool({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.pass,
            database: dbConfig.name,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            // Use positional placeholders
            namedPlaceholders: false
        });
    }
    return pool;
};
