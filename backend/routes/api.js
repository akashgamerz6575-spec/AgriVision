import { Router } from 'express';
import { expressjwt as jwt } from 'express-jwt';
import { getCrops, addCrop, updateCrop, deleteCrop } from '../database/jsonDb.js';
import { login, register } from '../controllers/authController.js';
import { getGeminiChatResponse, analyzeCropImage } from '../services/geminiService.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretdev';

// Middleware to protect routes
const requireAuth = jwt({
  secret: JWT_SECRET,
  algorithms: ['HS256']
});

// ==========================================
// 1. Authentication Routes
// ==========================================
router.post('/auth/register', register);
router.post('/auth/login', login);

// ==========================================
// 2. Weather Simulation Route
// ==========================================
router.get('/weather/simulate', async (req, res) => {
  const lat = req.query.lat ? parseFloat(req.query.lat) : 15.4589;
  const lng = req.query.lng ? parseFloat(req.query.lng) : 75.0078;

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi`;
    const aqiRes = await fetch(aqiUrl);
    const aqiData = await aqiRes.json();

    if (weatherData && weatherData.current) {
      const cur = weatherData.current;
      const aqiVal = aqiData?.current?.us_aqi ? Math.round(aqiData.current.us_aqi) : 45;

      let aqiStatus = 'Good';
      if (aqiVal > 100) aqiStatus = 'Poor';
      else if (aqiVal > 50) aqiStatus = 'Moderate';

      let locationName = `Field Coordinates (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`;
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`, {
          headers: { 'User-Agent': 'AgriShield/1.0' }
        });
        const geoData = await geoRes.json();
        if (geoData && geoData.address) {
          const city = geoData.address.city || geoData.address.town || geoData.address.county || geoData.address.state;
          if (city) locationName = `${city}, ${geoData.address.country_code.toUpperCase()}`;
        }
      } catch (err) {
        console.warn('Nominatim failed, using coordinates');
      }

      const liveWeather = {
        location: locationName,
        temp: Math.round(cur.temperature_2m),
        humidity: Math.round(cur.relative_humidity_2m),
        rainProbability: cur.precipitation > 0 ? 90 : 15,
        aqi: { value: aqiVal, status: aqiStatus },
        windSpeed: Math.round(cur.wind_speed_10m),
        soilMoisture: Math.round(35 + (cur.relative_humidity_2m * 0.4) + (cur.precipitation > 0 ? 30 : 0))
      };

      return res.json({ success: true, data: liveWeather });
    }
  } catch (error) {
    console.warn('⚠️ Open-Meteo API connection failed. Generating coordinate-fallback.');
  }

  // Fallback
  const seed = (Math.abs(lat) + Math.abs(lng)) % 10;
  const aqiVal = Math.round(35 + (seed * 8));
  const backupWeather = {
    location: `Field Zone (Coordinates: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`,
    temp: Math.round(26 + (seed % 6)),
    humidity: Math.round(60 + (seed * 3)),
    rainProbability: Math.round(15 + (seed * 7)),
    aqi: { value: aqiVal, status: aqiVal > 100 ? 'Poor' : aqiVal > 50 ? 'Moderate' : 'Good' },
    windSpeed: Math.round(9 + (seed % 4)),
    soilMoisture: Math.round(40 + (seed * 4))
  };

  res.json({ success: true, data: backupWeather });
});

// ==========================================
// 3. Gemini Vision AI Crop Advisor
// ==========================================
router.post('/advisor/diagnose', async (req, res) => {
  const { imageBase64, mimeType } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ success: false, message: 'Image data is required' });
  }

  try {
    const analysis = await analyzeCropImage(imageBase64, mimeType);

    if (!analysis.isCrop) {
      return res.status(422).json({
        success: false,
        code: 'NON_CROP_IMAGE',
        message: 'No crops or plants found in the image, upload a new one.'
      });
    }

    const result = {
      ...analysis.data,
      diagnosisId: `diag_${Math.random().toString(36).substr(2, 9)}`,
      diagnosedAt: new Date().toISOString(),
      recommendations: analysis.data.treatment
    };

    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'AI Analysis failed or no API Key provided. Please set GEMINI_API_KEY.' });
  }
});

// ==========================================
// 4. Gemini AI Chatbot
// ==========================================
router.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  try {
    const response = await getGeminiChatResponse(message);
    res.json({ success: true, data: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'AI Chat Assistant failed or no API Key provided.' });
  }
});

// ==========================================
// 5. Protected Crop Tracker Operations
// ==========================================

router.get('/crops', requireAuth, (req, res) => {
  const userId = req.auth.id;
  const crops = getCrops(userId);
  res.json({ success: true, data: crops });
});

router.post('/crops', requireAuth, (req, res) => {
  const userId = req.auth.id;
  const { cropType, plantingDate, condition, notes, irrigationTime, harvestTime } = req.body;
  
  if (!cropType || !plantingDate || !condition) {
    return res.status(400).json({
      success: false,
      message: 'Missing required parameters: cropType, plantingDate, condition'
    });
  }

  const created = addCrop({ cropType, plantingDate, condition, notes, irrigationTime, harvestTime }, userId);
  res.status(201).json({ success: true, data: created });
});

router.patch('/crops/:id', requireAuth, (req, res) => {
  const userId = req.auth.id;
  const { id } = req.params;
  const { condition, notes, irrigationTime, harvestTime } = req.body;
  
  const updated = updateCrop(id, condition, notes, irrigationTime, harvestTime, userId);
  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'Crop not found or unauthorized'
    });
  }

  res.json({ success: true, data: updated });
});

router.delete('/crops/:id', requireAuth, (req, res) => {
  const userId = req.auth.id;
  const { id } = req.params;
  
  const deleted = deleteCrop(id, userId);
  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Crop not found or unauthorized'
    });
  }

  res.json({
    success: true,
    message: 'Crop log deleted successfully',
    data: deleted
  });
});

export default router;
