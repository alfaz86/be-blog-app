const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getFormattedImagePath } = require('../utils/imageHelper');
const ApiResponse = require('../utils/ApiResponse');

// Registrasi
exports.register = async (req, res) => {
  const { name, email, username, password } = req.body;

  // Validasi input
  if (!name || !email || !username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Periksa apakah email atau username sudah terdaftar
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUser.length > 0) {
      return ApiResponse.validationResponse(res, { email: 'Email or username already registered' }, 'Validation errors', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan pengguna
    const [result] = await db.query(
      'INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)',
      [name, email, username, hashedPassword]
    );

    return ApiResponse.successResponse(
      res,
      { id: result.insertId, name, email, username }
      , 'User registered successfully',
      201
    );
  } catch (err) {
    return ApiResponse.errorResponse(res, err.message, 500);
  }
};

// Login
exports.login = async (req, res) => {
  const { identifier, password } = req.body; // identifier: email atau username

  try {
    // Cari pengguna berdasarkan email atau username
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1',
      [identifier, identifier]
    );

    if (users.length === 0) {
      return ApiResponse.errorResponse(res, 'User not found.', 404);
    }

    const user = users[0];

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return ApiResponse.unauthorizedResponse(res, 'Invalid credentials');
    }

    // Buat token JWT
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        profile_image: getFormattedImagePath(user.profile_image),
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_TTL || '1h' }
    );

    return ApiResponse.successResponse(
      res,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          profile_image: getFormattedImagePath(user.profile_image)
        }
      },
      'Login successful',
      200
    );
  } catch (error) {
    return ApiResponse.errorResponse(res, error.message, 500);
  }
};

// Profile
exports.profile = async (req, res) => {
  const { user } = req;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [user.id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userData = users[0];
    delete userData.password;
    userData.profile_image = getFormattedImagePath(userData.profile_image);

    return ApiResponse.successResponse(
      res,
      userData,
      'User profile',
      200
    );
  } catch (error) {
    return ApiResponse.errorResponse(res, error.message, 500);
  }
};
