import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Thermometer, 
  Droplets, 
  CloudRain, 
  Wind, 
  Gauge, 
  MapPin, 
  RefreshCw, 
  Activity 
} from 'lucide-react';

const WeatherWidget = () => {
  const { weather, locationLoading, simulateLocationFetch, t } = useApp();

  if (!weather) return null;

  const getAqiColor = (status) => {
    switch (status) {
      case 'Good':
      case 'Good / उत्तम / நல்ல / ಉತ್ತಮ':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/60';
      case 'Moderate':
      case 'Moderate / मध्यम / மிதமானது / ಮಧ್ಯಮ':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/60';
      case 'Poor':
      case 'Poor / खराब / மோசம் / ಕಳಪೆ':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/60';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/60';
    }
  };

  const getLocalizedAqi = (status) => {
    if (status === 'Good') return t.aqiGood;
    if (status === 'Moderate') return t.aqiMod;
    if (status === 'Poor') return t.aqiPoor;
    return status;
  };

  return (
    <div className="bg-white dark:bg-agri-dark-moss border border-slate-100 dark:border-agri-dark-border rounded-2xl p-6 shadow-premium dark:shadow-premium-dark transition-all duration-300">
      
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-agri-dark-border">
        <div>
          <span className="text-xs font-semibold tracking-wider text-agri-green-700 dark:text-agri-dark-sprout uppercase">
            {t.weatherTitle}
          </span>
          <div className="flex items-center gap-1.5 mt-1 text-slate-700 dark:text-slate-200">
            <MapPin className="w-4 h-4 text-agri-earth-700 dark:text-agri-dark-clay" />
            <h3 className="font-semibold text-base sm:text-lg font-sans tracking-tight leading-snug">
              {weather.location}
            </h3>
          </div>
        </div>

        <button
          onClick={simulateLocationFetch}
          disabled={locationLoading}
          className="flex items-center justify-center gap-2 self-start sm:self-center px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-agri-dark-border text-slate-700 dark:text-slate-200 bg-slate-50/50 hover:bg-slate-100/80 dark:bg-agri-dark-obsidian dark:hover:bg-slate-900/50 disabled:opacity-50 transition-all duration-200 cursor-pointer shadow-inner-soft"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-agri-green-600 dark:text-agri-dark-sprout ${locationLoading ? 'animate-spin' : ''}`} />
          {locationLoading ? t.gpsActive : t.gpsButton}
        </button>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-b border-slate-100 dark:border-agri-dark-border">
        
        {/* Temperature */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-agri-dark-text-secondary">{t.temp}</p>
            <p className="text-2xl font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100 mt-0.5">
              {weather.temp}°C
            </p>
          </div>
        </div>

        {/* Humidity */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-agri-dark-text-secondary">{t.humidity}</p>
            <p className="text-2xl font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100 mt-0.5">
              {weather.humidity}%
            </p>
          </div>
        </div>

        {/* Rain Probability */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-agri-dark-text-secondary">{t.rainProb}</p>
            <p className="text-2xl font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100 mt-0.5">
              {weather.rainProbability}%
            </p>
          </div>
        </div>

        {/* Soil Moisture */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-agri-dark-text-secondary">{t.soilMoisture}</p>
            <p className="text-2xl font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100 mt-0.5">
              {weather.soilMoisture}%
            </p>
          </div>
        </div>

      </div>

      {/* Secondary Details & AQI */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-5">
        
        {/* AQI Panel */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 dark:bg-agri-dark-obsidian rounded-lg border border-slate-100 dark:border-agri-dark-border text-slate-500 dark:text-slate-400">
            <Gauge className="w-4.5 h-4.5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600 dark:text-agri-dark-text-secondary">
              {t.aqi}:
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {weather.aqi.value}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getAqiColor(weather.aqi.status)}`}>
              {getLocalizedAqi(weather.aqi.status)}
            </span>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-agri-dark-text-secondary">
          <Wind className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span>{t.windSpeed}:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {weather.windSpeed} km/h
          </span>
        </div>

      </div>

    </div>
  );
};

export default WeatherWidget;
