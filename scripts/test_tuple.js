import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function run() {
  const db = await open({
    filename: ':memory:',
    driver: sqlite3.Database
  });

  await db.exec('CREATE TABLE test (id INTEGER, a INTEGER, b INTEGER)');
  await db.exec('INSERT INTO test VALUES (1, 10, 20), (2, 10, 15), (3, 5, 100), (4, 10, 20)');

  const rows = await db.all('SELECT * FROM test WHERE (a, b, id) < (?, ?, ?) ORDER BY a DESC, b DESC, id DESC', [10, 20, 4]);
  console.log(rows);
}
run();
