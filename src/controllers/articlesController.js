const db = require('../config/db');
const { getFormattedImagePath } = require('../utils/imageHelper');
const upload = require('../middleware/uploadS3');
const ApiResponse = require('../utils/ApiResponse');
const { slugify } = require('../utils/articleHelper');

exports.getAllArticles = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.per_page) || 10;

  try {
    const offset = (page - 1) * perPage;

    const [totalResult] = await db.query('SELECT COUNT(*) AS total FROM articles');
    const totalArticles = totalResult[0].total;

    const [articles] = await db.query(
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
      ORDER BY articles.created_at DESC
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

    return ApiResponse.successResponse(
      res,
      formattedArticles,
      'Article list',
      200
    );
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
  } catch (error) {
    return ApiResponse.errorResponse(res, error.message, 500);
  }
};

exports.createArticle = async (req, res) => {
  const { title, description, body_html, tags } = req.body;
  const coverImage = req.file.location;
  const user = req.user;

  // Validasi input
  if (!title || !description || !body_html || !tags) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validasi tags
  if (!Array.isArray(tags)) {
    return res.status(400).json({ message: 'Tags must be an array' });
  }

  // Membuat artikel baru
  const newArticle = {
    title,
    slug: slugify(title),
    description,
    body_html,
    tags: JSON.stringify(tags),
    cover_image: coverImage,
    user_id: user.id,
  };

  try {
    // Menggunakan connection pool untuk menjalankan query
    const [result] = await db.query('INSERT INTO articles SET ?', [newArticle]);

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

    return ApiResponse.successResponse(
      res,
      createdArticle,
      'Article created successfully',
      201
    )
  } catch (err) {
    console.error(err);
    return ApiResponse.errorResponse(res, err.message, 500);
  }
};

exports.uploadCoverImage = upload.single('cover_image');

exports.getArticleById = async (req, res) => {
  const { id } = req.params;
  try {
    const [article] = await db.query(
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

    return ApiResponse.successResponse(
      res,
      formattedArticle,
      'Article detail',
      200
    );
  } catch (error) {
    return ApiResponse.errorResponse(res, error.message, 500);
  }
};
