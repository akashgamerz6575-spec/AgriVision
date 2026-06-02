import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sprout } from 'lucide-react';

export default function Login() {
  const { t, login, register, lang, setLang } = useApp();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(mobile, password);
      } else {
        await register(name, mobile, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf8] dark:bg-agri-dark-obsidian text-slate-800 dark:text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-agri-dark-moss border border-slate-100 dark:border-agri-dark-border rounded-2xl shadow-premium p-8">
        
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-agri-green-700 dark:text-agri-dark-sprout rounded-2xl border border-emerald-100/50 mb-4">
            <Sprout className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-agri-green-800 dark:text-slate-100">
            {t.appName || 'AgriShield'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-agri-dark-text-secondary mt-1">
            {isLogin ? (t.loginSubtitle || 'Welcome back to your farm') : (t.registerSubtitle || 'Create a new farm account')}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-sm font-medium border border-rose-100/50 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                {t.nameLabel || 'Full Name'}
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-agri-dark-obsidian border border-slate-200 dark:border-agri-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={t.namePlaceholder || 'e.g. Ramesh Kumar'}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              {t.mobileLabel || 'Mobile Number'}
            </label>
            <input 
              type="text" 
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-agri-dark-obsidian border border-slate-200 dark:border-agri-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 9876543210"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              {t.passwordLabel || 'Password'}
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-agri-dark-obsidian border border-slate-200 dark:border-agri-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-agri-green-700 hover:bg-agri-green-800 dark:bg-agri-green-600 dark:hover:bg-agri-green-700 text-white font-bold py-3.5 rounded-xl transition-colors mt-2"
          >
            {loading ? (t.loading || 'Please wait...') : (isLogin ? (t.loginButton || 'Login') : (t.registerButton || 'Create Account'))}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-agri-dark-text-secondary">
          {isLogin ? (t.noAccount || "Don't have an account?") : (t.hasAccount || "Already have an account?")}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {isLogin ? (t.createAccount || 'Register here') : (t.loginHere || 'Login here')}
          </button>
        </div>

        {/* Quick Language Switcher */}
        <div className="mt-8 flex justify-center">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-400 focus:outline-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="ta">தமிழ்</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
      </div>
    </div>
  );
}
