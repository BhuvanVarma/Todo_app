const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const isProduction = process.env.NODE_ENV === 'production';

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function setCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Check for existing email (after normalizeEmail has lowercased it)
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        errors: [{ field: 'email', message: 'Email already in use' }],
      });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name.trim(), email, password_hash]
    );

    const user = rows[0];
    const token = signToken(user.id);
    setCookie(res, token);

    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, createdAt: user.created_at } });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({
        errors: [{ message: 'Invalid email or password' }],
      });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({
        errors: [{ message: 'Invalid email or password' }],
      });
    }

    const token = signToken(user.id);
    setCookie(res, token);

    res.json({ user: { id: user.id, name: user.name, email: user.email, createdAt: user.created_at } });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });
  res.json({ message: 'Logged out' });
}

async function me(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.userId]
    );
    if (rows.length === 0) {
      return res.status(401).json({ errors: [{ message: 'User not found' }] });
    }
    const user = rows[0];
    res.json({ user: { id: user.id, name: user.name, email: user.email, createdAt: user.created_at } });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me };

