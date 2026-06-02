import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Login from './components/Login';
import WeatherWidget from './components/WeatherWidget';
import AIAdvisor from './components/AIAdvisor';
import CropTracker from './components/CropTracker';
import AIChatbot from './components/AIChatbot';
import { requestNotificationPermission, startAlertPolling, stopAlertPolling } from './services/AlertService';
import { 
  Sprout, Sparkles, Activity, Languages, Sun, Moon, Compass, 
  ShieldCheck, AlertTriangle, Droplet, ArrowRight, LogOut, Bell, Clock, TrendingUp,
  Users, Settings, BadgeCheck
} from 'lucide-react';

function DashboardLayout() {
  const { 
    user, lang, setLang, theme, toggleTheme, activeTab, setActiveTab, crops, logout, t 
  } = useApp();

  const safeCrops = crops || [];
  const healthyCount = safeCrops.filter(c => c.condition === 'Healthy').length;
  const attentionCount = safeCrops.filter(c => c.condition === 'Needs Attention').length;
  const waterCount = safeCrops.filter(c => c.condition === 'Water Scheduled').length;

  useEffect(() => {
    if (user) {
      requestNotificationPermission();
      startAlertPolling(safeCrops);
      return () => stopAlertPolling();
    }
  }, [user, safeCrops]);

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-[#fbfaf8] dark:bg-agri-dark-obsidian text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="hidden md:flex flex-col justify-between w-72 bg-white dark:bg-agri-dark-moss border-r border-slate-100 dark:border-agri-dark-border py-7 px-5 shrink-0 transition-colors duration-300">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-agri-green-700 dark:text-agri-dark-sprout rounded-xl border border-emerald-100/50 shadow-sm">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-agri-green-800 dark:text-slate-100">
                {t.appName || 'AgriShield'}
              </h1>
              <span className="text-[10px] font-semibold text-slate-400 block mt-1">AgriTech MVP</span>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: t.dashboard || 'Dashboard', icon: Compass },
              { id: 'advisor', label: t.aiAdvisor || 'AI Advisor', icon: Sparkles },
              { id: 'tracker', label: t.cropTracker || 'Crop Tracker', icon: Activity },
              { id: 'community', label: t.community || 'Community Forum', icon: Users, disabled: true },
              { id: 'settings', label: t.settings || 'Settings', icon: Settings, disabled: true },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer
                    ${isActive 
                      ? 'bg-agri-green-50 text-agri-green-800 dark:bg-emerald-950/20 dark:text-agri-dark-sprout border-l-4 border-agri-green-700 font-bold' 
                      : 'text-slate-500 hover:bg-slate-50 dark:text-agri-dark-text-secondary dark:hover:bg-agri-dark-obsidian/40'
                    } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-agri-green-700' : 'text-slate-400'}`} />
                    {tab.label}
                  </div>
                  {tab.disabled && <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Soon</span>}
                </button>
              );
            })}
          </nav>

          <div className="p-4 bg-[#fdfdfc] dark:bg-agri-dark-obsidian/30 border border-slate-100 dark:border-agri-dark-border rounded-2xl">
            <h4 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-3">{t.quickStats || 'QUICK STATS'}</h4>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />{t.healthyFields || 'Healthy'}</span>
                <span className="text-xs font-bold text-slate-700 bg-emerald-50 px-2 rounded border border-emerald-100">{healthyCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium"><AlertTriangle className="w-3.5 h-3.5 text-rose-500" />{t.attentionFields || 'Attention'}</span>
                <span className="text-xs font-bold text-slate-700 bg-rose-50 px-2 rounded border border-rose-100">{attentionCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium"><Droplet className="w-3.5 h-3.5 text-blue-500" />{t.waterScheduled || 'Watering'}</span>
                <span className="text-xs font-bold text-slate-700 bg-blue-50 px-2 rounded border border-blue-100">{waterCount}</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border border-dashed border-slate-200 dark:border-agri-dark-border rounded-2xl">
             <h4 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-3">{t.recentActivity || 'RECENT ACTIVITY'}</h4>
             <ul className="space-y-3 relative before:absolute before:inset-y-0 before:left-[7px] before:w-px before:bg-slate-200 dark:before:bg-agri-dark-border">
               {safeCrops.slice(0,2).map(c => (
                 <li key={`act-${c.id}`} className="relative flex gap-3 text-xs">
                   <div className="w-4 h-4 bg-white dark:bg-agri-dark-moss border-2 border-agri-green-500 rounded-full z-10 shrink-0"></div>
                   <div>
                     <p className="text-slate-600 dark:text-slate-300">Added <span className="font-bold text-slate-800 dark:text-slate-100">{c.cropType}</span></p>
                     <p className="text-[9px] text-slate-400">{new Date(c.plantingDate).toLocaleDateString()}</p>
                   </div>
                 </li>
               ))}
             </ul>
          </div>
        </div>

        <div className="px-2 space-y-4 pt-4">
          <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-agri-dark-obsidian rounded-xl border border-slate-100 dark:border-agri-dark-border relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-400 text-[8px] font-bold text-amber-900 px-1.5 py-0.5 rounded-bl-lg">PRO</div>
            <div className="w-8 h-8 rounded-full bg-agri-green-100 dark:bg-agri-green-900 text-agri-green-800 flex items-center justify-center font-bold shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate flex items-center gap-1">{user?.name || 'User'} <BadgeCheck className="w-3 h-3 text-blue-500"/></p>
              <p className="text-[10px] text-slate-400 truncate">{user?.mobile}</p>
            </div>
          </div>
          
          <button onClick={logout} className="flex items-center justify-center gap-2 w-full py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTAINER AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-white dark:bg-agri-dark-moss border-b border-slate-100 dark:border-agri-dark-border px-4 sm:px-6 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2 md:hidden">
            <div className="p-1.5 bg-emerald-50 text-agri-green-700 rounded-lg"><Sprout className="w-4.5 h-4.5" /></div>
            <h1 className="font-bold text-sm tracking-tight text-agri-green-800">{t.appName || 'AgriShield'}</h1>
          </div>

          <div className="hidden md:block">
            <h2 className="text-sm font-bold text-slate-400 tracking-wider uppercase font-sans">
              {activeTab === 'dashboard' ? (t.dashboard || 'Dashboard') : activeTab === 'advisor' ? (t.aiAdvisor || 'AI Advisor') : (t.cropTracker || 'Crop Tracker')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex items-center gap-1.5 bg-slate-50 dark:bg-agri-dark-obsidian px-2.5 py-1.5 rounded-xl border border-slate-200">
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer pr-1 appearance-none dark:text-slate-100">
                <option value="en" className="text-slate-800 dark:bg-agri-dark-obsidian dark:text-slate-100">EN</option>
                <option value="kn" className="text-slate-800 dark:bg-agri-dark-obsidian dark:text-slate-100">KN</option>
                <option value="ta" className="text-slate-800 dark:bg-agri-dark-obsidian dark:text-slate-100">TA</option>
                <option value="hi" className="text-slate-800 dark:bg-agri-dark-obsidian dark:text-slate-100">HI</option>
              </select>
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-agri-dark-obsidian border border-slate-200 text-slate-600 transition-colors">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button onClick={logout} className="md:hidden p-2 rounded-xl bg-rose-50 text-rose-500 border border-rose-100">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              <div className="p-6 bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-950/20 dark:to-agri-dark-moss border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-agri-green-800 text-xs font-bold rounded-full border border-emerald-100">
                    Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.protectFarms || 'Protecting Farms, Improving Yields.'}</h3>
                  <p className="text-xs text-slate-500 dark:text-agri-dark-text-secondary max-w-lg">
                    {t.checkAlerts || 'Check your alerts, monitor upcoming irrigation schedules, and consult the AI for any new plant symptoms.'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setActiveTab('advisor')} className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-agri-green-700 text-white text-xs font-semibold shadow-sm animate-pulse">
                    {t.diagnoseSpecimen || 'Diagnose Specimen'} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <WeatherWidget />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Reminders & Alerts */}
                <div className="bg-white dark:bg-agri-dark-moss border border-slate-100 dark:border-agri-dark-border rounded-2xl p-5 shadow-sm col-span-1 lg:col-span-2 flex flex-col">
                  <div className="flex items-center gap-2 mb-4 text-agri-earth-700">
                    <Bell className="w-5 h-5" /><h4 className="font-bold">{t.upcomingSchedules || 'Upcoming Schedules & Alerts'}</h4>
                  </div>
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
                    {safeCrops.filter(c => c.irrigationTime || c.harvestTime).length === 0 ? (
                      <p className="text-xs text-slate-400">{t.noSchedules || 'No upcoming schedules.'}</p>
                    ) : (
                      safeCrops.map(c => {
                        const items = [];
                        if (c.irrigationTime) {
                          items.push(
                            <div key={`irr-${c.id}`} className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg text-blue-600 dark:text-blue-400"><Droplet className="w-4 h-4"/></div>
                                <div><p className="text-xs font-bold text-slate-700 dark:text-slate-200">Irrigate {c.cropType}</p><p className="text-[10px] text-slate-500">Scheduled Task</p></div>
                              </div>
                              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/50 px-2 py-1 rounded">{new Date(c.irrigationTime).toLocaleString()}</span>
                            </div>
                          );
                        }
                        if (c.harvestTime) {
                          items.push(
                            <div key={`har-${c.id}`} className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-800/30 rounded-lg text-amber-600 dark:text-amber-400"><Sprout className="w-4 h-4"/></div>
                                <div><p className="text-xs font-bold text-slate-700 dark:text-slate-200">Harvest {c.cropType}</p><p className="text-[10px] text-slate-500">Scheduled Task</p></div>
                              </div>
                              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/50 px-2 py-1 rounded">{new Date(c.harvestTime).toLocaleString()}</span>
                            </div>
                          );
                        }
                        return items;
                      })
                    )}
                  </div>
                </div>

                {/* 2. Market Prices / Info */}
                <div className="bg-white dark:bg-agri-dark-moss border border-slate-100 dark:border-agri-dark-border rounded-2xl p-5 shadow-sm flex flex-col">
                  <div className="flex items-center gap-2 mb-4 text-emerald-600">
                    <TrendingUp className="w-5 h-5" /><h4 className="font-bold">{t.marketPrices || 'Market Prices (Mock)'}</h4>
                  </div>
                  <div className="space-y-3">
                    {['Tomato: ₹40/kg', 'Paddy: ₹2200/qtl', 'Cotton: ₹7500/qtl', 'Wheat: ₹2500/qtl'].map(item => (
                      <div key={item} className="flex items-center justify-between bg-slate-50 dark:bg-agri-dark-obsidian p-2.5 rounded-lg border border-slate-100">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.split(':')[0]}</span>
                        <span className="text-xs font-bold text-emerald-600">{item.split(':')[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'advisor' && <AIAdvisor />}
          {activeTab === 'tracker' && <CropTracker />}
        </main>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-agri-dark-moss border-t border-slate-200 flex items-center justify-around px-2 z-40 shadow-lg">
        {[
          { id: 'dashboard', label: t.dashboard || 'Dashboard', icon: Compass },
          { id: 'advisor', label: t.aiAdvisor || 'AI Advisor', icon: Sparkles },
          { id: 'tracker', label: t.cropTracker || 'Crop Tracker', icon: Activity },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl ${activeTab === tab.id ? 'text-agri-green-700 font-bold' : 'text-slate-400'}`}>
            <tab.icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{tab.label?.split(' ')[0] || tab.id}</span>
          </button>
        ))}
      </div>

      <AIChatbot />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<DashboardLayout />} />
    </Routes>
  );
}
