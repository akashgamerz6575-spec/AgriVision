import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.join(__dirname, 'crops.json');

// Core Seeding Array if file is missing
const initialSeed = [];

// Helper: Ensure Database File Exists
const ensureDbFile = () => {
  try {
    if (!fs.existsSync(dbFilePath)) {
      const dir = path.dirname(dbFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dbFilePath, JSON.stringify(initialSeed, null, 2), 'utf-8');
      console.log('🌾 Crops Database initialized.');
    }
  } catch (error) {
    console.error('Error ensuring crops database exists:', error);
  }
};

// Retrieve All Crops (optionally filtered by user)
export const getCrops = (userId = null) => {
  ensureDbFile();
  try {
    const data = fs.readFileSync(dbFilePath, 'utf-8');
    const allCrops = JSON.parse(data);
    if (userId) {
      return allCrops.filter(c => c.userId === userId);
    }
    return allCrops;
  } catch (error) {
    console.error('Error reading crops database:', error);
    return [];
  }
};

// Save All Crops
const saveCrops = (crops) => {
  ensureDbFile();
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(crops, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing crops database:', error);
    return false;
  }
};

// Insert New Crop Log
export const addCrop = (cropData, userId) => {
  const allCrops = getCrops(); // Get all crops to append
  const newCrop = {
    id: `crop_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    ...cropData,
    notes: cropData.notes || 'No additional logs recorded.',
    lastUpdated: new Date().toISOString()
  };
  allCrops.unshift(newCrop); // Add to top
  saveCrops(allCrops);
  return newCrop;
};

// Update Crop Condition & Notes
export const updateCrop = (id, condition, notes, irrigationTime, harvestTime, userId) => {
  const allCrops = getCrops();
  const index = allCrops.findIndex(c => c.id === id && c.userId === userId);
  if (index === -1) return null;

  if (condition) allCrops[index].condition = condition;
  if (notes !== null && notes !== undefined) allCrops[index].notes = notes;
  if (irrigationTime !== undefined) allCrops[index].irrigationTime = irrigationTime;
  if (harvestTime !== undefined) allCrops[index].harvestTime = harvestTime;
  
  allCrops[index].lastUpdated = new Date().toISOString();

  saveCrops(allCrops);
  return allCrops[index];
};

// Remove Crop Log
export const deleteCrop = (id, userId) => {
  const allCrops = getCrops();
  const index = allCrops.findIndex(c => c.id === id && c.userId === userId);
  if (index === -1) return null;

  const deleted = allCrops.splice(index, 1);
  saveCrops(allCrops);
  return deleted[0];
};
