const { mysqlDB, sqliteDB } = require('../config/db');
const { getFormattedImagePath } = require('../utils/imageHelper');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

exports.getAllArticles = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.per_page) || 10;

  try {
    const offset = (page - 1) * perPage;

    const [totalResult] = await mysqlDB.query('SELECT COUNT(*) AS total FROM articles');
    const totalArticles = totalResult[0].total;

    const [articles] = await mysqlDB.query(
      `
      SELECT 
        articles.*, 
        users.id AS user_id, 
        users.name,
        users.username,
        users.email,
        users.profile_image
      FROM articles
      LEFT JOIN users ON articles.user_id = users.id
      LIMIT ? OFFSET ?
      `,
      [perPage, offset]
    );

    const formattedArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      path: article.path,
      url: article.url,
      description: article.description,
      cover_image: getFormattedImagePath(article.cover_image),
      body_html: article.body_html,
      tags: JSON.parse(article.tags),
      created_at: article.created_at,
      updated_at: article.updated_at,
      user: {
        id: article.user_id,
        name: article.name,
        username: article.username,
        email: article.email,
        profile_image: getFormattedImagePath(article.profile_image),
      },
    }));

    const totalPages = Math.ceil(totalArticles / perPage);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const nextPageUrl = hasNextPage
      ? `${req.protocol}://${req.get('host')}${req.baseUrl}?page=${page + 1}&per_page=${perPage}`
      : null;
    const prevPageUrl = hasPrevPage
      ? `${req.protocol}://${req.get('host')}${req.baseUrl}?page=${page - 1}&per_page=${perPage}`
      : null;

    res.status(200).json(
      formattedArticles
      // {
      //   data: formattedArticles,
      //   meta: {
      //     total: totalArticles,
      //     per_page: perPage,
      //     current_page: page,
      //     total_pages: totalPages,
      //     next_page: nextPageUrl,
      //     prev_page: prevPageUrl,
      //   }
      // }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createArticle = async (req, res) => {
  const { title, description, body_html, tags } = req.body;
  const coverImage = req.file ? req.file.filename : null;
  const user = req.user;

  // Validasi input
  if (!title || !description || !body_html || !tags) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Membuat artikel baru
  const newArticle = {
    title,
    description,
    body_html,
    tags: JSON.stringify(tags),
    cover_image: coverImage ? `/${coverImage}` : "/cover-image.png",
    user_id: user.id,
  };

  try {
    // Menggunakan connection pool untuk menjalankan query
    const [result] = await mysqlDB.query('INSERT INTO articles SET ?', [newArticle]);

    // Mengambil artikel yang baru dibuat
    const createdArticle = {
      id: result.insertId,
      title,
      description,
      body_html,
      tags: newArticle.tags,
      cover_image: newArticle.cover_image,
      user_id: user.id,
    };

    res.status(201).json({
      message: 'Article created successfully',
      article: createdArticle,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

// Middleware upload untuk menangani file gambar
exports.uploadCoverImage = (req, res, next) => {
  upload.single('cover_image')(req, res, (err) => {
    if (err) {
      console.error('Error in multer middleware:', err);
      return res.status(500).json({ error: 'File upload error' });
    }
    console.log('Multer File:', req.file);
    next();
  });
};

exports.getArticleById = async (req, res) => {
  const { id } = req.params;
  try {
    const [article] = await mysqlDB.query(
      `
      SELECT 
        articles.*, 
        users.id AS user_id, 
        users.name,
        users.username,
        users.email,
        users.profile_image
      FROM articles
      LEFT JOIN users ON articles.user_id = users.id
      WHERE articles.id = ?
      `,
      [id]
    );

    if (article.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const formattedArticle = {
      id: article[0].id,
      title: article[0].title,
      slug: article[0].slug,
      path: article[0].path,
      url: article[0].url,
      description: article[0].description,
      cover_image: getFormattedImagePath(article[0].cover_image),
      body_html: article[0].body_html,
      tags: JSON.parse(article[0].tags),
      created_at: article[0].created_at,
      updated_at: article[0].updated_at,
      user: {
        id: article[0].user_id,
        name: article[0].name,
        username: article[0].username,
        email: article[0].email,
        profile_image: getFormattedImagePath(article[0].profile_image),
      },
    };

    res.status(200).json(formattedArticle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
