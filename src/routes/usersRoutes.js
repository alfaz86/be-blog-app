const express = require('express');
const { getAllUsers, createUser } = require('../controllers/usersController');
const router = express.Router();

router.get('/', getAllUsers);
router.post('/', createUser);

module.exports = router;
