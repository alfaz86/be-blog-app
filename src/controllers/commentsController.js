const { mysqlDB, sqliteDB } = require('../config/db');

exports.getAllComments = (req, res) => {
  db.query('SELECT * FROM comments', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.createComment = (req, res) => {
  const { content, userId, articleId } = req.body;
  db.query('INSERT INTO comments (content, user_id, article_id) VALUES (?, ?, ?)', [content, userId, articleId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: results.insertId, content, userId, articleId });
  });
};
