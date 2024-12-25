const express = require('express');
const { register, login, profile } = require('../controllers/authController');
const { jwtVerify } = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', jwtVerify, profile);

module.exports = router;
