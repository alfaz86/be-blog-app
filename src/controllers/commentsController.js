const { mysqlDB, sqliteDB } = require('../config/db');

exports.getAllComments = async (req, res) => {
  await mysqlDB.query('SELECT * FROM comments', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.createComment = async (req, res) => {
  const { content, userId, articleId } = req.body;
  await mysqlDB.query('INSERT INTO comments (content, user_id, article_id) VALUES (?, ?, ?)', [content, userId, articleId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: results.insertId, content, userId, articleId });
  });
};
