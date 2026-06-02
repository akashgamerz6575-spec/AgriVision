import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
export const getGeminiChatResponse = async (message) => {
  const apiKey = process.env.GEMINI_API_KEY || 'PLACEHOLDER_KEY';
  const isMock = apiKey === 'PLACEHOLDER_KEY' || !apiKey;
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    if (isMock) throw new Error('Mock Mode Triggered');
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are AgriShield, an AI agricultural advisor. Respond to this user query about farming, crops, or diseases in a helpful, concise way. Keep formatting clean. User Query: ${message}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return {
      reply: text,
      suggestions: ["How to manage pests organically?", "Best irrigation practices", "Soil health tips"]
    };
  } catch (error) {
    console.warn("Gemini Chat API fallback used.");
    console.error("DEBUG CHAT ERROR:", error.message || error);
    await new Promise(r => setTimeout(r, 1500));
    return {
      reply: "I am currently in mock mode. Please configure a valid GEMINI_API_KEY to receive real AI responses.",
      suggestions: ["Configure API Key", "Retry Connection"]
    };
  }
};

export const analyzeCropImage = async (base64Image, mimeType) => {
  const apiKey = process.env.GEMINI_API_KEY || 'PLACEHOLDER_KEY';
  const isMock = apiKey === 'PLACEHOLDER_KEY' || !apiKey;
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    if (isMock) throw new Error('Mock Mode Triggered');

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `Analyze this image for crop diseases. 
First, VERIFY if this image contains a plant, leaf, or crop. If it DOES NOT contain any plant or crop (e.g. it's a dog, human, car, keyboard), your EXACT output MUST be: 'NON_CROP_IMAGE'.
If it IS a crop/plant, identify any diseases or health issues. Return the output strictly as a JSON object with this structure:
{
  "cropType": "Identified Plant/Crop Name",
  "diseaseName": "Name of disease or 'Healthy'",
  "confidence": 95,
  "treatment": ["treatment 1", "treatment 2"],
  "prevention": ["prevention 1", "prevention 2"]
}`;

    const imageParts = [{ inlineData: { data: base64Image, mimeType } }];
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    if (text.includes('NON_CROP_IMAGE')) return { isCrop: false };

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return { isCrop: true, data: JSON.parse(jsonMatch[0]) };
    } else {
       throw new Error('Failed to parse AI response format.');
    }
  } catch (error) {
    console.warn("Gemini Vision API fallback used.");
    console.error("DEBUG ACTUAL ERROR:", error.message || error);
    await new Promise(r => setTimeout(r, 2000));
    
    // We will alternate between returning a "mock success" and a "mock non-crop" 
    // to let the user see the non-crop validation.
    // For now, let's just return a generic mock disease success so the UI populates.
    return { 
      isCrop: true, 
      data: {
        cropType: "Mock Tomato Plant (No API Key)",
        diseaseName: "Early Blight (Simulated)",
        confidence: 98,
        treatment: ["Apply copper-based fungicide", "Remove affected lower leaves immediately"],
        prevention: ["Ensure proper spacing for air circulation", "Avoid overhead watering"]
      } 
    };
  }
};
