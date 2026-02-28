import mysql from 'mysql2/promise';

async function run() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'tudexgames'
        });
        console.log("Connected to DB!");
        await connection.end();
    } catch (e) {
        console.error("DB connection failed:", e.message);
    }
}
run();
