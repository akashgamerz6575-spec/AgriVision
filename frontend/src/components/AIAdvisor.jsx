import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Upload, 
  Camera, 
  Leaf, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  RotateCcw,
  PlusCircle,
  FileImage,
  ShieldAlert
} from 'lucide-react';

const AIAdvisor = () => {
  const { 
    diagLoading, 
    activeDiagnosis, 
    diagError,
    setDiagError,
    runAIDiagnosis, 
    setActiveDiagnosis, 
    addCrop, 
    t 
  } = useApp();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraCountdown, setCameraCountdown] = useState(0);

  // File Drag & Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFileName(file.name);
      runAIDiagnosis(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      runAIDiagnosis(file);
    }
  };

  // Camera Capture Shutter Simulator
  const simulateCameraClick = () => {
    setCameraActive(true);
    setCameraCountdown(3);
    
    const interval = setInterval(() => {
      setCameraCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCameraActive(false);
          setSelectedFileName('CAM_SPECIMEN_092.jpg');
          runAIDiagnosis({ name: 'camera_capture' }, false);
          return 0;
        }
        return prev - 1;
      });
    }, 800);
  };

  // Add the diagnosed pathology crop straight into My Fields list
  const logDiagnosedCrop = () => {
    if (!activeDiagnosis) return;
    const cropData = {
      cropType: `${activeDiagnosis.cropType} (${activeDiagnosis.diseaseName.split(' ')[0]})`,
      plantingDate: new Date().toISOString().split('T')[0],
      condition: 'Needs Attention',
      notes: `DIAGNOSIS ALERT: Identified ${activeDiagnosis.diseaseName} with ${activeDiagnosis.confidence}% confidence. Treatment recommended: ${activeDiagnosis.recommendations[0]}`
    };
    addCrop(cropData);
    alert('Crop added successfully! Check it in the Smart Crop Tracker tab.');
  };

  const clearDiagnosticBay = () => {
    setActiveDiagnosis(null);
    setDiagError(null);
    setSelectedFileName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Advisor Header Card */}
      <div className="bg-white dark:bg-agri-dark-moss border border-slate-100 dark:border-agri-dark-border rounded-2xl p-6 shadow-premium dark:shadow-premium-dark transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-agri-green-700 dark:text-agri-dark-sprout rounded-2xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-sans text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
              {t.aiAdvisor}
            </h2>
            <p className="text-slate-600 dark:text-agri-dark-text-secondary text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed">
              {t.advisorDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Main Area: Upload or Loading or Result or Error */}
      {!diagLoading && !activeDiagnosis && !diagError && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeIn_0.2s_ease-out]">
          
          {/* Large Interactive Upload Zone */}
          <div className="lg:col-span-2">
            <form 
              onDragEnter={handleDrag} 
              onDragOver={handleDrag} 
              onDragLeave={handleDrag} 
              onDrop={handleDrop}
              className="h-full"
            >
              <input 
                id="file-upload-input"
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
              <label 
                htmlFor="file-upload-input"
                className={`relative flex flex-col items-center justify-center h-80 px-6 border-2 border-dashed rounded-2xl text-center transition-all duration-200 cursor-pointer shadow-inner-soft group
                  ${dragActive 
                    ? 'border-agri-green-500 bg-agri-green-50/20 dark:bg-agri-green-950/10' 
                    : 'border-slate-200 dark:border-agri-dark-border bg-white dark:bg-agri-dark-moss hover:border-agri-green-500/80 dark:hover:border-agri-dark-sprout'
                  }`}
              >
                <div className="p-4 bg-emerald-50/60 dark:bg-agri-dark-obsidian rounded-2xl group-hover:scale-105 transition-transform duration-200 text-agri-green-700 dark:text-agri-dark-sprout shadow-sm border border-slate-100/50 dark:border-agri-dark-border">
                  <Upload className="w-8 h-8" />
                </div>
                
                <h4 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200 max-w-sm px-4">
                  {t.uploadZone}
                </h4>
                <p className="mt-1.5 text-xs text-slate-400 dark:text-agri-dark-text-secondary">
                  PNG, JPG, or WEBP (Max 8MB)
                </p>

                {selectedFileName && (
                  <div className="mt-4 flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-agri-dark-obsidian border border-slate-200 dark:border-agri-dark-border px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300">
                    <FileImage className="w-3.5 h-3.5" />
                    <span className="font-medium truncate max-w-xs">{selectedFileName}</span>
                  </div>
                )}
              </label>
            </form>
          </div>

          {/* Quick Simulation Panel */}
          <div className="flex flex-col justify-between p-6 bg-white dark:bg-agri-dark-moss border border-slate-100 dark:border-agri-dark-border rounded-2xl shadow-premium dark:shadow-premium-dark transition-all duration-300">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-agri-dark-border">
                <Camera className="w-4 h-4 text-agri-earth-600 dark:text-agri-dark-clay" />
                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200 font-sans tracking-tight">
                  Hackathon Demonstrator
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-agri-dark-text-secondary mt-3 leading-relaxed">
                Since we are developing in a sandbox environment, use these triggers to test live crop diagnoses or toggle validation filters for non-crop objects.
              </p>
            </div>

            <div className="space-y-2.5 mt-6">
              {/* Camera Simulation Trigger */}
              <button
                type="button"
                onClick={simulateCameraClick}
                disabled={cameraActive}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-agri-earth-50 hover:bg-agri-earth-100/80 dark:bg-agri-earth-950/20 dark:hover:bg-agri-earth-950/35 border border-agri-earth-200 dark:border-agri-earth-950 text-agri-earth-700 dark:text-agri-dark-clay text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer shadow-inner-soft"
              >
                <Camera className="w-4 h-4" />
                {cameraActive ? `CAPTURING IN ${cameraCountdown}s...` : t.cameraButton}
              </button>

              {/* One-click Demo Leaf */}
              <button
                type="button"
                onClick={() => {
                  setSelectedFileName('SAMPLE_RUST_LEAF.jpg');
                  runAIDiagnosis({ name: 'sample_rust' }, false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-agri-green-50 hover:bg-agri-green-100/80 dark:bg-agri-green-950/20 dark:hover:bg-agri-green-950/35 border border-agri-green-200 dark:border-agri-green-950 text-agri-green-700 dark:text-agri-dark-sprout text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer shadow-inner-soft"
              >
                <Leaf className="w-4 h-4" />
                SIMULATE INFECTED CROP
              </button>

              {/* One-click Non-Crop Error Simulator (New Feedback Feature) */}
              <button
                type="button"
                onClick={() => {
                  setSelectedFileName('NON_CROP_DOG.jpg');
                  runAIDiagnosis({ name: 'non_crop_specimen' }, true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/20 dark:hover:bg-rose-950/35 border border-rose-200 dark:border-rose-950 text-rose-700 dark:text-rose-400 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer shadow-inner-soft"
              >
                <ShieldAlert className="w-4 h-4" />
                SIMULATE NON-CROP (ERROR)
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Elegant Leaf Glow Skeleton Loader */}
      {diagLoading && (
        <div className="bg-white dark:bg-agri-dark-moss border border-slate-100 dark:border-agri-dark-border rounded-2xl p-8 shadow-premium dark:shadow-premium-dark flex flex-col items-center justify-center min-h-[350px] transition-all duration-300">
          <div className="relative leaf-glow-animation p-6 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-full text-agri-green-600 dark:text-agri-dark-sprout">
            <Leaf className="w-16 h-16 animate-pulse" />
            <div className="absolute inset-0 border-2 border-emerald-500/20 dark:border-emerald-400/20 rounded-full animate-ping"></div>
          </div>
          
          <h3 className="mt-6 text-base font-bold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
            {t.analyzingState}
          </h3>
          <p className="mt-1 text-xs text-slate-400 dark:text-agri-dark-text-secondary">
            AI Diagnosis Pipeline processing leaf geometry and lesion patterns...
          </p>

          <div className="w-56 h-1.5 bg-slate-100 dark:bg-agri-dark-obsidian rounded-full overflow-hidden mt-6 border border-slate-200/40 dark:border-agri-dark-border">
            <div className="h-full bg-agri-green-600 dark:bg-agri-dark-sprout rounded-full animate-[loading_1.5s_infinite_ease-in-out]" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}

      {/* NEW: Specimen Validation Failure Screen */}
      {!diagLoading && diagError && (
        <div className="bg-white dark:bg-agri-dark-moss border border-rose-200 dark:border-rose-950 rounded-2xl p-8 shadow-premium dark:shadow-premium-dark flex flex-col items-center justify-center min-h-[350px] transition-all duration-300 animate-[fadeIn_0.3s_ease-out]">
          <div className="p-5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-full border border-rose-100 dark:border-rose-900/40">
            <ShieldAlert className="w-12 h-12" />
          </div>
          
          <h3 className="mt-6 text-lg sm:text-xl font-extrabold text-rose-700 dark:text-rose-400 font-sans tracking-tight leading-snug">
            {t.validationErrorTitle}
          </h3>
          
          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-agri-dark-text-secondary max-w-md text-center leading-relaxed font-medium font-sans">
            {diagError}
          </p>
          
          <p className="mt-2.5 text-xs text-slate-400 dark:text-slate-500 italic max-w-sm text-center">
            {t.validationInstruction}
          </p>

          <button
            onClick={clearDiagnosticBay}
            className="mt-8 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-agri-dark-border bg-slate-50 hover:bg-slate-100 dark:bg-agri-dark-obsidian dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-200 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer shadow-inner-soft"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t.resetButton}
          </button>
        </div>
      )}

      {/* Populated Results Layout */}
      {!diagLoading && activeDiagnosis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeIn_0.3s_ease-out]">
          
          {/* Summary Sheet */}
          <div className="lg:col-span-1 bg-white dark:bg-agri-dark-moss border border-slate-100 dark:border-agri-dark-border rounded-2xl p-6 shadow-premium dark:shadow-premium-dark flex flex-col justify-between transition-all duration-300">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-agri-dark-border">
                <span className="text-xs font-semibold uppercase tracking-wider text-agri-green-700 dark:text-agri-dark-sprout">
                  {t.diagnosisResult}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/50">
                  <CheckCircle2 className="w-3 h-3" /> Secure AI
                </span>
              </div>

              {/* Diagnosis Details */}
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-agri-dark-text-secondary">
                    {t.cropType}
                  </label>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100 font-sans mt-0.5">
                    {activeDiagnosis.cropType}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-agri-dark-text-secondary">
                    {t.diseaseDetected}
                  </label>
                  <p className="text-base font-bold text-rose-600 dark:text-rose-400 font-sans mt-0.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    {activeDiagnosis.diseaseName}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-agri-dark-text-secondary">
                    {t.confidenceScore}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 h-2 bg-slate-100 dark:bg-agri-dark-obsidian rounded-full overflow-hidden border border-slate-200/40 dark:border-agri-dark-border">
                      <div 
                        className="h-full bg-agri-green-600 dark:bg-agri-dark-sprout rounded-full" 
                        style={{ width: `${activeDiagnosis.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {activeDiagnosis.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 space-y-3 pt-4 border-t border-slate-100 dark:border-agri-dark-border">
              <button
                onClick={logDiagnosedCrop}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-agri-green-700 hover:bg-agri-green-800 dark:bg-agri-green-600 dark:hover:bg-agri-green-700 text-white text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Track Infected Field
              </button>

              <button
                onClick={clearDiagnosticBay}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-agri-dark-border bg-slate-50/50 hover:bg-slate-100 dark:bg-agri-dark-obsidian dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-200 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer shadow-inner-soft"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t.resetButton}
              </button>
            </div>

          </div>

          {/* Treatment Details Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Immediate Treatments Card */}
            <div className="bg-white dark:bg-agri-dark-moss border border-slate-100 dark:border-agri-dark-border rounded-2xl p-6 shadow-premium dark:shadow-premium-dark transition-all duration-300">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-agri-dark-border">
                <div className="p-1.5 bg-amber-50 dark:bg-amber-950/20 text-agri-earth-700 dark:text-agri-dark-sprout rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 font-sans tracking-tight">
                  {t.treatmentTitle}
                </h3>
              </div>
              <ul className="mt-4 space-y-3.5">
                {activeDiagnosis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-agri-green-700 dark:text-agri-dark-sprout border border-emerald-100 dark:border-emerald-900/40 font-mono text-[10px] font-bold mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-agri-dark-text-secondary leading-relaxed font-sans">
                      {rec}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preventive Measures Card */}
            <div className="bg-white dark:bg-agri-dark-moss border border-slate-100 dark:border-agri-dark-border rounded-2xl p-6 shadow-premium dark:shadow-premium-dark transition-all duration-300">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-agri-dark-border">
                <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-agri-green-700 dark:text-agri-dark-sprout rounded-lg">
                  <Leaf className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 font-sans tracking-tight">
                  {t.preventionTitle}
                </h3>
              </div>
              <ul className="mt-4 space-y-3.5">
                {activeDiagnosis.prevention.map((prev, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 font-mono text-[10px] font-bold mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-agri-dark-text-secondary leading-relaxed font-sans">
                      {prev}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default AIAdvisor;
