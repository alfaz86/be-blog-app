const express = require('express');
const { getAllComments, createComment } = require('../controllers/commentsController');
const router = express.Router();

router.get('/', getAllComments);
router.post('/', createComment);

module.exports = router;
