const express = require('express');
const { createComment, getCommentsByArticleId } = require('../controllers/commentsController');
const router = express.Router();

router.get('/', getCommentsByArticleId);
router.post('/', createComment);

module.exports = router;
