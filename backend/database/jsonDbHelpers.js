import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- Users DB ----------
const usersFilePath = path.join(__dirname, 'users.json');

const ensureUsersFile = () => {
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([], null, 2), 'utf-8');
  }
};

export const getUsers = () => {
  ensureUsersFile();
  const data = fs.readFileSync(usersFilePath, 'utf-8');
  return JSON.parse(data);
};

export const addUser = (user) => {
  const users = getUsers();
  users.push(user);
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
  return user;
};

export const findUserByUsername = (username) => {
  const users = getUsers();
  return users.find(u => u.username === username || u.mobile === username);
};

// ---------- Schedules DB ----------
const schedulesFilePath = path.join(__dirname, 'schedules.json');

const ensureSchedulesFile = () => {
  if (!fs.existsSync(schedulesFilePath)) {
    fs.writeFileSync(schedulesFilePath, JSON.stringify([], null, 2), 'utf-8');
  }
};

export const getSchedules = () => {
  ensureSchedulesFile();
  const data = fs.readFileSync(schedulesFilePath, 'utf-8');
  return JSON.parse(data);
};

export const addSchedule = (schedule) => {
  const schedules = getSchedules();
  schedules.unshift(schedule);
  fs.writeFileSync(schedulesFilePath, JSON.stringify(schedules, null, 2), 'utf-8');
  return schedule;
};

export const updateSchedule = (id, updates) => {
  const schedules = getSchedules();
  const idx = schedules.findIndex(s => s.id === id);
  if (idx === -1) return null;
  schedules[idx] = { ...schedules[idx], ...updates };
  fs.writeFileSync(schedulesFilePath, JSON.stringify(schedules, null, 2), 'utf-8');
  return schedules[idx];
};

export const deleteSchedule = (id) => {
  const schedules = getSchedules();
  const idx = schedules.findIndex(s => s.id === id);
  if (idx === -1) return null;
  const [removed] = schedules.splice(idx, 1);
  fs.writeFileSync(schedulesFilePath, JSON.stringify(schedules, null, 2), 'utf-8');
  return removed;
};
