const db = require('../config/db');

exports.getAllArticles = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.per_page) || 10;

  try {
    const offset = (page - 1) * perPage;

    const [totalResult] = await db.promise().query('SELECT COUNT(*) AS total FROM articles');
    const totalArticles = totalResult[0].total;

    const [articles] = await db.promise().query(
      'SELECT * FROM articles LIMIT ? OFFSET ?',
      [perPage, offset]
    );

    const totalPages = Math.ceil(totalArticles / perPage);

    res.status(200).json({
      data: articles,
      meta: {
        total: totalArticles,
        per_page: perPage,
        current_page: page,
        total_pages: totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.createArticle = (req, res) => {
  const { title, content, userId } = req.body;
  db.query('INSERT INTO articles (title, content, user_id) VALUES (?, ?, ?)', [title, content, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: results.insertId, title, content, userId });
  });
};

exports.getArticleById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM articles WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Article not found' });
    res.json(results[0]);
  });
};