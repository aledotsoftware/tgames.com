import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function run() {
  const db = await open({
    filename: ':memory:',
    driver: sqlite3.Database
  });

  await db.exec('CREATE TABLE games (id INTEGER PRIMARY KEY, upvote INTEGER, views INTEGER, title TEXT, published INTEGER)');
  await db.exec('CREATE INDEX idx_games_sort ON games (published, upvote DESC, views DESC, id DESC)');

  console.log("Inserting data...");
  const stmt = await db.prepare('INSERT INTO games (id, upvote, views, title, published) VALUES (?, ?, ?, ?, 1)');
  for (let i = 1; i <= 20000; i++) {
    // Randomize upvote and views to simulate real data
    const upvote = Math.floor(Math.random() * 100);
    const views = Math.floor(Math.random() * 10000);
    await stmt.run(i, upvote, views, `Game ${i}`);
  }
  await stmt.finalize();

  console.log("Data inserted.");

  // Warmup
  await db.all('SELECT * FROM games WHERE published = 1 ORDER BY upvote DESC, views DESC, id DESC LIMIT 60 OFFSET 0');

  // Benchmark OFFSET
  const offsetStart = process.hrtime.bigint();
  for (let i = 0; i < 50; i++) {
    await db.all('SELECT * FROM games WHERE published = 1 ORDER BY upvote DESC, views DESC, id DESC LIMIT 60 OFFSET 15000');
  }
  const offsetEnd = process.hrtime.bigint();
  const offsetTime = Number(offsetEnd - offsetStart) / 1e6;

  // Get cursor for 15000th item
  const rows = await db.all('SELECT * FROM games WHERE published = 1 ORDER BY upvote DESC, views DESC, id DESC LIMIT 1 OFFSET 15000');
  const cursor = rows[0];

  // Benchmark CURSOR
  const cursorStart = process.hrtime.bigint();
  for (let i = 0; i < 50; i++) {
    await db.all('SELECT * FROM games WHERE published = 1 AND (upvote, views, id) < (?, ?, ?) ORDER BY upvote DESC, views DESC, id DESC LIMIT 60', [cursor.upvote, cursor.views, cursor.id]);
  }
  const cursorEnd = process.hrtime.bigint();
  const cursorTime = Number(cursorEnd - cursorStart) / 1e6;

  console.log(`OFFSET time (50 runs): ${offsetTime.toFixed(2)} ms`);
  console.log(`CURSOR time (50 runs): ${cursorTime.toFixed(2)} ms`);
  console.log(`Speedup: ${(offsetTime / cursorTime).toFixed(2)}x`);
}
run();
