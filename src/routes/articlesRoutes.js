const express = require('express');
const { getAllArticles, createArticle, getArticleById } = require('../controllers/articlesController');
const { jwtVerify } = require('../middleware/auth');
const router = express.Router();

router.get('/', getAllArticles);
router.get('/:id', getArticleById);
router.post('/', jwtVerify, createArticle);

module.exports = router;
