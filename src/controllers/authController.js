const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registrasi
exports.register = async (req, res) => {
  const { name, email, username, password } = req.body;

  // Validasi input
  if (!name || !email || !username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Periksa apakah email atau username sudah terdaftar
    const [existingUser] = await db.promise().query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email or username already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan pengguna
    const [result] = await db.promise().query(
      'INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)',
      [name, email, username, hashedPassword]
    );

    res.status(201).json({ id: result.insertId, name, email, username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { identifier, password } = req.body; // identifier: email atau username

  try {
    // Cari pengguna berdasarkan email atau username
    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1',
      [identifier, identifier]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = users[0];

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Buat token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_TTL || '1h' }
    );

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        profile_image: user.profile_image
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

// Profile
exports.profile = async (req, res) => {
  const { user } = req;

  try {
    const [users] = await db.promise().query('SELECT * FROM users WHERE id = ?', [user.id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userData = users[0];
    delete userData.password;

    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};
