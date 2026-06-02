// backend/routes/auth.js
import { Router } from 'express';
import crypto from 'crypto';
import { addUser, findUserByIdentifier, getAllUsers } from '../database/usersDb.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretdev';
const JWT_EXPIRES_IN = '7d'; // token validity

// Simple JWT generation (no external library)
function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  const [header, body, signature] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  if (expectedSig !== signature) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
  return payload;
}

// Register new user
router.post('/register', (req, res) => {
  const { name, identifier, password } = req.body; // identifier can be username or mobile
  if (!name || !identifier || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  const existing = findUserByIdentifier(identifier);
  if (existing) {
    return res.status(409).json({ success: false, message: 'User already exists' });
  }
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  const newUser = {
    id: `user_${Date.now()}`,
    name,
    username: identifier.includes('@') ? identifier : undefined,
    mobile: identifier.match(/^\d{10,}$/) ? identifier : undefined,
    passwordHash
  };
  addUser(newUser);
  const token = generateToken({ userId: newUser.id, name: newUser.name });
  return res.status(201).json({ success: true, token, user: { id: newUser.id, name: newUser.name } });
});

// Login endpoint
router.post('/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Missing identifier or password' });
  }
  const user = findUserByIdentifier(identifier);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  if (user.passwordHash !== passwordHash) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const token = generateToken({ userId: user.id, name: user.name });
  return res.json({ success: true, token, user: { id: user.id, name: user.name } });
});

// Protected route to get current user info
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ success: false, message: 'Invalid token' });
  const allUsers = getAllUsers();
  const user = allUsers.find(u => u.id === payload.userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, user: { id: user.id, name: user.name } });
});

export default router;
