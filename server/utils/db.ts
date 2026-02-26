import mysql from 'mysql2/promise';

let pool: mysql.Pool;

export const useDB = () => {
    if (!pool) {
        const config = useRuntimeConfig();
        const dbConfig = config.database;

        console.log('Initializing DB Pool with RuntimeConfig');

        pool = mysql.createPool({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.pass,
            database: dbConfig.name,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            // Enable named placeholders if needed, but we use positional
            namedPlaceholders: false
        });
    }
    return pool;
};
