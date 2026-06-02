import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { findUserByMobile, createUser } from '../database/usersDb.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretdev';

export const register = async (req, res) => {
  try {
    const { name, mobile, password } = req.body;
    
    if (!name || !mobile || !password) {
      return res.status(400).json({ success: false, message: 'Name, mobile, and password are required' });
    }

    const user = await createUser(name, mobile, password);
    const token = jwt.sign({ id: user.id, name: user.name, mobile: user.mobile }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user, token }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ success: false, message: 'Mobile and password are required' });
    }

    const user = findUserByMobile(mobile);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = jwt.sign({ id: user.id, name: user.name, mobile: user.mobile }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: userWithoutPassword, token }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};
