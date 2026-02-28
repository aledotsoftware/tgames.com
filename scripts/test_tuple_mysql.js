import mysql from 'mysql2/promise';

async function run() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'tudexgames'
        });
        await connection.query('CREATE TEMPORARY TABLE test (id INT, a INT, b INT)');
        await connection.query('INSERT INTO test VALUES (1, 10, 20), (2, 10, 15), (3, 5, 100), (4, 10, 20)');
        const [rows] = await connection.query('SELECT * FROM test WHERE (a, b, id) < (?, ?, ?) ORDER BY a DESC, b DESC, id DESC', [10, 20, 4]);
        console.log(rows);
        await connection.end();
    } catch (e) {
        console.error("DB connection failed:", e.message);
    }
}
run();
