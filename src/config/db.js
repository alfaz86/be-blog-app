const mysql = require('mysql2');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const sqliteDbPath = path.resolve(__dirname, '../../tmp/database.sqlite');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.on('connection', (connection) => {
  console.log(`A new connection has been established with ID: ${connection.threadId}`);
});

pool.on('enqueue', () => {
  console.log('Waiting for available connection slot...');
});

pool.on('error', (err) => {
  console.error('Error in the connection pool: ', err);
});

const mysqlDB = pool.promise();

const sqliteDB = new sqlite3.Database(sqliteDbPath, (err) => {
  if (err) {
    console.error('Failed to open SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

module.exports = { mysqlDB, sqliteDB };
