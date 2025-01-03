const { mysqlDB, sqliteDB } = require('../config/db');

exports.getAllUsers = (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.createUser = (req, res) => {
  const { name, email } = req.body;
  db.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: results.insertId, name, email });
  });
};
