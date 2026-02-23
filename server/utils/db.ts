import mysql from 'mysql2/promise';

let pool: mysql.Pool;

export const useDB = () => {
    if (!pool) {
        console.log('HARDCODED POOL INIT');
        pool = mysql.createPool({
            host: '172.20.0.3',
            port: 3306,
            user: 'root',
            password: 'root',
            database: 'tudexgames',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }
    return pool;
};
