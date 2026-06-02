import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';
import { useNavigate } from 'react-router-dom';

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  // 1. Auth State
  const [token, setToken] = useState(() => localStorage.getItem('agrishield_token') || null);
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('agrishield_user');
    return cached ? JSON.parse(cached) : null;
  });

  // 2. Initial Caches
  const [lang, setLang] = useState(() => localStorage.getItem('agrishield_lang') || 'en');
  const [theme, setTheme] = useState(() => localStorage.getItem('agrishield_theme') || 'light');
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('agrishield_tab') || 'dashboard');
  
  const [weather, setWeather] = useState(() => {
    const cached = localStorage.getItem('agrishield_weather');
    return cached ? JSON.parse(cached) : null;
  });

  const [locationLoading, setLocationLoading] = useState(false);
  const [crops, setCrops] = useState([]);
  
  const [activeDiagnosis, setActiveDiagnosis] = useState(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagError, setDiagError] = useState(null);

  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const t = translations[lang] || translations['en'];

  // Sync Caches
  useEffect(() => { localStorage.setItem('agrishield_lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('agrishield_tab', activeTab); }, [activeTab]);
  useEffect(() => { 
    if (weather) localStorage.setItem('agrishield_weather', JSON.stringify(weather)); 
  }, [weather]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('agrishield_theme', theme);
  }, [theme]);

  // Welcome Chat message
  useEffect(() => {
    setMessages([
      { sender: 'bot', text: t.chatbotWelcome, suggestions: [
        "How to cure Tomato Blight?",
        "Suggest organic fertilizers",
        "Optimal irrigation moisture"
      ]}
    ]);
  }, [lang, t.chatbotWelcome]);

  // Auth Functions
  const register = async (name, mobile, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mobile, password })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Registration failed');
    setToken(json.data.token);
    setUser(json.data.user);
    localStorage.setItem('agrishield_token', json.data.token);
    localStorage.setItem('agrishield_user', JSON.stringify(json.data.user));
  };

  const login = async (mobile, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, password })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Login failed');
    setToken(json.data.token);
    setUser(json.data.user);
    localStorage.setItem('agrishield_token', json.data.token);
    localStorage.setItem('agrishield_user', JSON.stringify(json.data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCrops([]);
    localStorage.removeItem('agrishield_token');
    localStorage.removeItem('agrishield_user');
    navigate('/login');
  };

  // Helper for auth headers
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  // Fetch Crops & Weather
  useEffect(() => {
    if (token) {
      fetchCrops();
      if (!weather) {
        simulateLocationFetch();
      }
    }
  }, [token]);

  const fetchCrops = async () => {
    try {
      const res = await fetch('/api/crops', { headers: getHeaders() });
      const json = await res.json();
      if (json.success) setCrops(json.data);
    } catch (err) {
      console.warn('API offline or error fetching crops.');
    }
  };

  const simulateLocationFetch = async () => {
    setLocationLoading(true);
    try {
      let lat = 15.4589;
      let lng = 75.0078;
      
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } catch (err) {
        console.warn('Geolocation failed, using default coordinates.');
      }

      const res = await fetch(`/api/weather/simulate?lat=${lat}&lng=${lng}`);
      const json = await res.json();
      if (json.success) setWeather(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLocationLoading(false);
    }
  };

  const runAIDiagnosis = async (fileObj = null, forceNonCrop = false) => {
    setDiagLoading(true);
    setActiveDiagnosis(null);
    setDiagError(null);

    try {
      if (!fileObj) throw new Error('Please upload an image.');
      
      const reader = new FileReader();
      reader.readAsDataURL(fileObj);
      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1];
        
        const res = await fetch('/api/advisor/diagnose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64Data, mimeType: fileObj.type })
        });
        const json = await res.json();
        
        if (!res.ok || !json.success) {
          setDiagError(json.message || 'An error occurred.');
        } else {
          setActiveDiagnosis(json.data);
        }
        setDiagLoading(false);
      };
    } catch (err) {
      setDiagError(err.message);
      setDiagLoading(false);
    }
  };

  const sendChatMessage = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const json = await res.json();
      if (json.success) {
        setMessages(prev => [...prev, { sender: 'bot', text: json.data.reply, suggestions: json.data.suggestions }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Error connecting to AI." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const addCrop = async (cropData) => {
    try {
      const res = await fetch('/api/crops', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(cropData)
      });
      const json = await res.json();
      if (json.success) {
        setCrops(prev => [json.data, ...prev]);
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const updateCropStatus = async (id, condition, notes, irrigationTime, harvestTime) => {
    try {
      const res = await fetch(`/api/crops/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ condition, notes, irrigationTime, harvestTime })
      });
      const json = await res.json();
      if (json.success) {
        setCrops(prev => prev.map(c => c.id === id ? json.data : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCrop = async (id) => {
    try {
      const res = await fetch(`/api/crops/${id}`, { method: 'DELETE', headers: getHeaders() });
      const json = await res.json();
      if (json.success) {
        setCrops(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <AppContext.Provider value={{
      lang, setLang, theme, toggleTheme, activeTab, setActiveTab,
      weather, locationLoading, simulateLocationFetch,
      crops, addCrop, updateCropStatus, deleteCrop,
      activeDiagnosis, setActiveDiagnosis, diagLoading, diagError, setDiagError, runAIDiagnosis,
      messages, chatLoading, sendChatMessage,
      user, token, login, register, logout,
      t
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
