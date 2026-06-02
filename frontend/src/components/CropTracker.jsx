import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  PlusCircle, 
  Calendar, 
  Tag, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Droplet, 
  Trash2,
  Sprout,
  Activity,
  History,
  Clock
} from 'lucide-react';

const CropTracker = () => {
  const { crops, addCrop, updateCropStatus, deleteCrop, t } = useApp();

  // Form State
  const [cropType, setCropType] = useState('Tomato (Arka Rakshak)');
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);
  const [condition, setCondition] = useState('Healthy');
  const [notes, setNotes] = useState('');
  const [irrigationTime, setIrrigationTime] = useState('');
  const [harvestTime, setHarvestTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common crop options for easy drop-down select
  const cropOptions = [
    'Tomato (Arka Rakshak)',
    'Paddy (IR64 Rice)',
    'Cotton (Bt Cotton)',
    'Wheat (HD 2967)',
    'Maize (Ganga 11)',
    'Mustard (Pusa Bold)',
    'Chilli (Guntur Red)'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cropType || !plantingDate) return;

    setIsSubmitting(true);
    const success = await addCrop({
      cropType,
      plantingDate,
      condition,
      notes: notes || 'No visual logs entered yet.',
      irrigationTime: irrigationTime || null,
      harvestTime: harvestTime || null
    });

    if (success) {
      setNotes('');
      setIrrigationTime('');
      setHarvestTime('');
      // Show dynamic notification/banner (can use basic alert or state-driven overlay)
    }
    setIsSubmitting(false);
  };

  const getConditionStyles = (status) => {
    switch (status) {
      case 'Healthy':
        return {
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40',
          dot: 'bg-emerald-500'
        };
      case 'Needs Attention':
        return {
          badge: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40',
          dot: 'bg-rose-500'
        };
      case 'Water Scheduled':
        return {
          badge: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/40',
          dot: 'bg-blue-500'
        };
      default:
        return {
          badge: 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800/40',
          dot: 'bg-slate-500'
        };
    }
  };

  const getLocalizedCondition = (status) => {
    if (status === 'Healthy') return t.healthyFields;
    if (status === 'Needs Attention') return t.attentionFields;
    if (status === 'Water Scheduled') return t.waterScheduled;
    return status;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* LEFT: Registration Form */}
      <div className="lg:col-span-5 bg-white dark:bg-agri-dark-moss border border-slate-100 dark:border-agri-dark-border rounded-2xl p-6 shadow-premium dark:shadow-premium-dark transition-all duration-300">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-agri-dark-border">
          <Sprout className="w-5 h-5 text-agri-green-700 dark:text-agri-dark-sprout" />
          <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100 font-sans tracking-tight">
            {t.logCropHeader}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Crop Type Select */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              {t.selectCrop}
            </label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-agri-dark-border bg-slate-50/50 hover:bg-slate-50 dark:bg-agri-dark-obsidian dark:text-slate-100 px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-agri-green-500 transition-colors"
            >
              {cropOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {t.plantingDate}
            </label>
            <input
              type="date"
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-agri-dark-border bg-slate-50/50 hover:bg-slate-50 dark:bg-agri-dark-obsidian dark:text-slate-100 px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-agri-green-500 transition-colors"
              required
            />
          </div>

          {/* Condition Radio Toggle */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              {t.conditionLabel}
            </label>
            
            <div className="grid grid-cols-3 gap-2">
              {['Healthy', 'Needs Attention', 'Water Scheduled'].map(cond => {
                const styles = getConditionStyles(cond);
                const isSelected = condition === cond;
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setCondition(cond)}
                    className={`flex flex-col items-center justify-center p-2.5 border rounded-xl transition-all duration-200 cursor-pointer
                      ${isSelected 
                        ? 'border-agri-green-600 bg-agri-green-50/30 text-agri-green-800 dark:border-agri-dark-sprout dark:bg-emerald-950/20 dark:text-agri-dark-sprout' 
                        : 'border-slate-100 dark:border-agri-dark-border bg-slate-50/20 text-slate-500 hover:bg-slate-50 dark:bg-agri-dark-obsidian/30 dark:hover:bg-agri-dark-obsidian/60'
                      }`}
                  >
                    <span className={`w-2 h-2 rounded-full mb-1.5 ${styles.dot}`}></span>
                    <span className="text-[10px] font-bold text-center tracking-tight leading-none whitespace-pre-line">
                      {getLocalizedCondition(cond)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Droplet className="w-3.5 h-3.5 text-blue-400" />
                Schedule Irrigation
              </label>
              <input
                type="datetime-local"
                value={irrigationTime}
                onChange={(e) => setIrrigationTime(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-agri-dark-border bg-slate-50/50 hover:bg-slate-50 dark:bg-agri-dark-obsidian dark:text-slate-100 px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-agri-green-500 transition-colors"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Schedule Harvest
              </label>
              <input
                type="datetime-local"
                value={harvestTime}
                onChange={(e) => setHarvestTime(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-agri-dark-border bg-slate-50/50 hover:bg-slate-50 dark:bg-agri-dark-obsidian dark:text-slate-100 px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-agri-green-500 transition-colors"
              />
            </div>
          </div>

          {/* Notes TextArea */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              {t.notesLabel}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Added rich nitrogen compost. Soil humidity sensors read optimal..."
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-agri-dark-border bg-slate-50/50 hover:bg-slate-50 dark:bg-agri-dark-obsidian dark:text-slate-100 px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-agri-green-500 transition-colors placeholder:text-slate-400/80 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-3 rounded-xl bg-agri-green-700 hover:bg-agri-green-800 dark:bg-agri-green-600 dark:hover:bg-agri-green-700 text-white text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            {t.submitCrop}
          </button>
        </form>
      </div>

      {/* RIGHT: Active Crop Fields List */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* List Header */}
        <div className="bg-white dark:bg-agri-dark-moss border border-slate-100 dark:border-agri-dark-border rounded-2xl p-4 sm:p-5 shadow-premium dark:shadow-premium-dark flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 font-sans tracking-tight">
              {t.myFieldsHeader}
            </h3>
            <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-agri-dark-obsidian text-slate-600 dark:text-slate-300 font-bold rounded-full">
              {crops.length}
            </span>
          </div>
        </div>

        {/* Crops Stack */}
        {crops.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-agri-dark-moss border border-slate-100 dark:border-agri-dark-border rounded-2xl p-10 shadow-premium dark:shadow-premium-dark text-center min-h-[300px] flex flex-col items-center justify-center transition-all duration-300">
            <div className="p-4 bg-emerald-50 dark:bg-agri-dark-obsidian rounded-full text-agri-green-700 dark:text-agri-dark-sprout shadow-sm border border-slate-100/40 dark:border-agri-dark-border">
              <Sprout className="w-10 h-10" />
            </div>
            <h4 className="mt-5 text-base font-bold text-slate-800 dark:text-slate-200 font-sans">
              {t.emptyCrops}
            </h4>
            <p className="mt-1.5 text-xs text-slate-400 dark:text-agri-dark-text-secondary max-w-sm mx-auto leading-relaxed">
              {t.emptyCropsDesc}
            </p>
          </div>
        ) : (
          /* Populated List */
          <div className="space-y-4">
            {crops.map((crop) => {
              const styles = getConditionStyles(crop.condition);
              const formattedDate = new Date(crop.plantingDate).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              return (
                <div 
                  key={crop.id}
                  className="bg-white dark:bg-agri-dark-moss border border-slate-100 dark:border-agri-dark-border rounded-2xl p-5 shadow-premium dark:shadow-premium-dark hover:border-slate-200 dark:hover:border-emerald-900/50 transition-all duration-200 group"
                >
                  {/* Card Top Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                    <div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
                        {crop.cropType}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                        <span>Sown:</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {formattedDate}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-xs font-bold border ${styles.badge}`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${styles.dot}`}></span>
                      {getLocalizedCondition(crop.condition)}
                    </span>
                  </div>

                  {/* Notes / Logs Content */}
                  <div className="mt-3.5 bg-slate-50/50 dark:bg-agri-dark-obsidian/40 border border-slate-100/50 dark:border-agri-dark-border rounded-xl p-3.5">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-agri-dark-text-secondary leading-relaxed font-sans font-medium whitespace-pre-wrap">
                      {crop.notes}
                    </p>
                  </div>

                  {/* Action Toolbar */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-agri-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Last Updated Timestamp */}
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      <History className="w-3 h-3 text-slate-300" />
                      <span>Updated: {new Date(crop.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Quick status updates */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => updateCropStatus(crop.id, 'Water Scheduled')}
                        title={t.markWatered}
                        className="p-2 rounded-xl bg-blue-50/50 hover:bg-blue-100/80 text-blue-600 dark:bg-blue-950/20 dark:hover:bg-blue-950/45 dark:text-blue-400 border border-blue-100/30 cursor-pointer transition-colors"
                      >
                        <Droplet className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => updateCropStatus(crop.id, 'Needs Attention')}
                        title={t.markAttention}
                        className="p-2 rounded-xl bg-rose-50/50 hover:bg-rose-100/80 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/45 dark:text-rose-400 border border-rose-100/30 cursor-pointer transition-colors"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => updateCropStatus(crop.id, 'Healthy')}
                        title={t.markHealthy}
                        className="p-2 rounded-xl bg-emerald-50/50 hover:bg-emerald-100/80 text-emerald-600 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/45 dark:text-emerald-400 border border-emerald-100/30 cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <span className="w-px h-5 bg-slate-200 dark:bg-agri-dark-border mx-1"></span>

                      <button
                        onClick={() => deleteCrop(crop.id)}
                        title={t.deleteCrop}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:bg-agri-dark-obsidian dark:hover:bg-rose-950/20 dark:hover:text-rose-400 border border-slate-100 dark:border-agri-dark-border cursor-pointer transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};

export default CropTracker;
