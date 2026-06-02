import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.join(__dirname, 'users.json');

const ensureDbFile = () => {
  try {
    if (!fs.existsSync(dbFilePath)) {
      const dir = path.dirname(dbFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dbFilePath, JSON.stringify([], null, 2), 'utf-8');
      console.log('🧑 Users Database initialized.');
    }
  } catch (error) {
    console.error('Error ensuring users database exists:', error);
  }
};

const getUsers = () => {
  ensureDbFile();
  try {
    const data = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users database:', error);
    return [];
  }
};

const saveUsers = (users) => {
  ensureDbFile();
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing users database:', error);
    return false;
  }
};

export const findUserByMobile = (mobile) => {
  const users = getUsers();
  return users.find(u => u.mobile === mobile);
};

export const findUserById = (id) => {
  const users = getUsers();
  return users.find(u => u.id === id);
};

export const createUser = async (name, mobile, password) => {
  const users = getUsers();
  if (users.find(u => u.mobile === mobile)) {
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    id: `user_${Math.random().toString(36).substr(2, 9)}`,
    name,
    mobile,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  // Exclude password from returned user object
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};
