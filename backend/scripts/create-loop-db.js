const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'admin',
  });
  await conn.query(
    'CREATE DATABASE IF NOT EXISTS loop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
  );
  const [rows] = await conn.query('SHOW DATABASES LIKE ?', ['loop_db']);
  console.log('DB_OK', rows);
  await conn.end();
})().catch((e) => {
  console.error('FAIL', e.code || e.message);
  process.exit(1);
});
