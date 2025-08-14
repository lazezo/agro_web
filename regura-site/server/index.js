import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getDb, init as initDb } from './db.js';
import { authRequired, roleRequired } from './auth.js';

const app = express();
const db = getDb();
initDb();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

// Replace with a real email service in production
async function sendEmail(to, subject, text) {
  console.log(`
[DEV email]
To: ${to}
Subject: ${subject}
${text}
`);
}

function signUser(user){
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Healthcheck
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Sign up (creates unverified user and emails verification link)
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const hash = await bcrypt.hash(password, 12);
    const token = crypto.randomBytes(24).toString('hex');
    const stmt = db.prepare('INSERT INTO users (name, email, password_hash, verification_token) VALUES (?, ?, ?, ?)');
    stmt.run(name, email.toLowerCase(), hash, token);
    const verifyUrl = `${process.env.PUBLIC_BASE_URL || 'http://localhost:8080'}/api/verify?token=${token}`;
    await sendEmail(email, 'Verify your Regura account', `Click to verify: ${verifyUrl}`);
    res.json({ message: 'Sign up successful. Check your email to verify your account.' });
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Email verification
app.get('/api/verify', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Missing token' });
  const row = db.prepare('SELECT id, name, email, role FROM users WHERE verification_token = ?').get(token);
  if (!row) return res.status(400).json({ error: 'Invalid token' });
  db.prepare('UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?').run(row.id);
  const jwtToken = signUser(row);
  res.cookie('token', jwtToken, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ user: row, message: 'Email verified' });
});

// Log in (require verified email)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!row) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  if (!row.email_verified) return res.status(403).json({ error: 'Email not verified' });
  const user = { id: row.id, name: row.name, email: row.email, role: row.role };
  const token = signUser(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ user });
});

// Log out
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

// Current user
app.get('/api/me', authRequired, (req, res) => {
  res.json({ user: req.user });
});

// Request password reset
app.post('/api/request-password-reset', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  const row = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email.toLowerCase());
  if (row) {
    const token = crypto.randomBytes(24).toString('hex');
    const expires = Date.now() + 1000 * 60 * 30; // 30 minutes
    db.prepare('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?').run(token, expires, row.id);
    const resetUrl = `${process.env.PUBLIC_BASE_URL || 'http://localhost:8080'}/api/reset-password?token=${token}`;
    sendEmail(email, 'Reset your Regura password', `Reset link (30m): ${resetUrl}`);
  }
  // Respond success even if email not found
  res.json({ message: 'If the email exists, a reset link has been sent.' });
});

// Reset password
app.post('/api/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Missing fields' });
  const row = db.prepare('SELECT id FROM users WHERE reset_token = ? AND reset_expires > ?').get(token, Date.now());
  if (!row) return res.status(400).json({ error: 'Invalid or expired token' });
  const hash = await bcrypt.hash(password, 12);
  db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?').run(hash, row.id);
  res.json({ message: 'Password updated. You can now log in.' });
});

// Protected endpoints that surface your GUI/API URLs
app.get('/api/protected/gui-url', authRequired, (req, res) => {
  res.json({ url: process.env.GUI_URL });
});

app.get('/api/protected/api-url', authRequired, (req, res) => {
  res.json({ url: process.env.API_URL });
});

// Example admin-only route
app.get('/api/admin/users', authRequired, roleRequired('admin'), (req, res) => {
  const rows = db.prepare('SELECT id, name, email, role, email_verified, created_at FROM users ORDER BY id DESC').all();
  res.json({ users: rows });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));