// backend/database/schedulesDb.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'schedules.json');

// Ensure the file exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([], null, 2), 'utf-8');
}

export const getAllSchedules = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to read schedules DB', e);
    return [];
  }
};

export const getUserSchedules = (userId) => {
  const all = getAllSchedules();
  return all.filter(s => s.userId === userId);
};

export const addSchedule = (scheduleObj) => {
  const all = getAllSchedules();
  all.push(scheduleObj);
  fs.writeFileSync(dbPath, JSON.stringify(all, null, 2), 'utf-8');
  return scheduleObj;
};
