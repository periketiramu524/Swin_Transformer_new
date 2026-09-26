import { useState } from 'react';
import { Download, FileText, CheckCircle2, Maximize2, Droplets, Wind, Layers, Activity, Eye } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentPatient } from '../services/historyService';

// Explicit palette mapping for all 15 ChestX-ray14 classes
const DISEASE_PALETTE: Record<string, { hex: string; lightBg: string; textColor: string }> = {
  'Effusion': { hex: '#8b5cf6', lightBg: '#ede9fe', textColor: '#7c3aed' },
  'Cardiomegaly': { hex: '#ea580c', lightBg: '#ffedd5', textColor: '#c2410c' },
  'Atelectasis': { hex: '#0d9488', lightBg: '#ccfbf1', textColor: '#0f766e' },
  'Infiltration': { hex: '#2563eb', lightBg: '#dbeafe', textColor: '#1d4ed8' },
  'Pleural_Thickening': { hex: '#e11d48', lightBg: '#ffe4e6', textColor: '#be123c' },
  'Nodule': { hex: '#0284c7', lightBg: '#e0f2fe', textColor: '#0369a1' },
  'Consolidation': { hex: '#10b981', lightBg: '#d1fae5', textColor: '#047857' },
  'Edema': { hex: '#a855f7', lightBg: '#f3e8ff', textColor: '#9333ea' },
  'Mass': { hex: '#d97706', lightBg: '#fef3c7', textColor: '#b45309' },
  'No Finding': { hex: '#3b82f6', lightBg: '#eff6ff', textColor: '#2563eb' },
  'Pneumonia': { hex: '#dc2626', lightBg: '#fee2e2', textColor: '#b91c1c' },
  'Pneumothorax': { hex: '#eab308', lightBg: '#fef9c3', textColor: '#a16207' },
  'Emphysema': { hex: '#059669', lightBg: '#ecfdf5', textColor: '#047857' },
  'Fibrosis': { hex: '#6366f1', lightBg: '#e0e7ff', textColor: '#4338ca' },
  'Hernia': { hex: '#ec4899', lightBg: '#fce7f3', textColor: '#db2777' },
};

const FALLBACK_PALETTE = [
  { hex: '#8b5cf6', lightBg: '#ede9fe', textColor: '#7c3aed' },
  { hex: '#2563eb', lightBg: '#dbeafe', textColor: '#1d4ed8' },
  { hex: '#0d9488', lightBg: '#ccfbf1', textColor: '#0f766e' },
  { hex: '#ea580c', lightBg: '#ffedd5', textColor: '#c2410c' },
  { hex: '#10b981', lightBg: '#d1fae5', textColor: '#047857' },
];

function getFallbackColor(index: number) {
  return FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
}

export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Default to categorical (multi-color)
  const [imageZoomed, setImageZoomed] = useState(false);
  const [colorMode, setColorMode] = useState<'severity' | 'categorical'>(() => {
    return (localStorage.getItem('predictionColorMode') as any) || 'categorical';
  });
  
  // Persistent active patient from history / localStorage
  const activePatient = getCurrentPatient();

  let results = location.state?.results;
  let clinicalText = location.state?.clinicalText;
  
  if (!results && sessionStorage.getItem('recentResults')) {
    try {
      results = JSON.parse(sessionStorage.getItem('recentResults') || '{}');
    } catch (e) {
      console.error("Failed to parse recent results");
    }
  }
  if (!clinicalText) {
    clinicalText = sessionStorage.getItem('recentClinicalText') || activePatient.clinicalText || '';
  }

  const imagePreview = location.state?.imagePreview || sessionStorage.getItem('recentImagePreview') || activePatient.imagePreview;
  const findingsRaw = results?.findings || activePatient.findings;
  const reportData = results?.report || activePatient.report;
  const recordId = location.state?.recordId || activePatient.id;
  const recordDate = location.state?.date || activePatient.date;
  
  // Sort by probability descending
  const sortedFindings = [...findingsRaw].sort((a, b) => b.probability - a.probability);
  
  const allPredictions = sortedFindings.map((f, i) => {
    const probPercent = parseFloat((f.probability * 100).toFixed(1));
    const palette = DISEASE_PALETTE[f.disease] || getFallbackColor(i);
    
    let level: 'High' | 'Moderate' | 'Low' = 'Low';
    let severityGradient = 'linear-gradient(90deg, #64748b 0%, #475569 100%)';
    let severityBadge = 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700';

    if (f.probability >= 0.5) {
      level = 'High';
      severityGradient = 'linear-gradient(90deg, #f97316 0%, #ef4444 100%)';
      severityBadge = 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 font-bold';
    } else if (f.probability >= 0.2) {
      level = 'Moderate';
      severityGradient = 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)';
      severityBadge = 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 font-semibold';
    }

    // Categorical gradient: vibrant and distinct for each disease
    const categoricalGradient = `linear-gradient(90deg, ${palette.hex} 0%, ${palette.hex}dd 100%)`;
    
    const activeGradient = colorMode === 'severity' ? severityGradient : categoricalGradient;
    const activeIndicatorColor = colorMode === 'severity' 
      ? (level === 'High' ? '#ef4444' : level === 'Moderate' ? '#3b82f6' : '#94a3b8')
      : palette.hex;

    return {
      label: f.disease,
      prob: probPercent,
      level,
      rawProb: f.probability,
      palette,
      activeGradient,
      activeIndicatorColor,
      severityBadge,
      ccm: f.ccm || null,
    };
  });

  const topFindings = allPredictions.slice(0, 3).map((f, i) => {
    const icons = [Droplets, Wind, Layers, Activity];
    const icon = icons[i % icons.length];
    
    return {
      ...f,
      icon,
    };
  });

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-deep-navy dark:text-slate-100">AI Analysis Results</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Model output for the submitted chest radiograph with clinical context.</p>
      </div>

      <div className="bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={14} /> Analysis Complete
          </div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{recordId} • {recordDate}</span>
          <span className="text-sm text-slate-400 hidden lg:block border-l border-slate-200 dark:border-slate-700 pl-4">Swin Transformer multi-label output • sigmoid probabilities</span>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download size={16} /> Export
          </button>
          <button 
            onClick={() => navigate('/explainability', { state: { imagePreview, findings: findingsRaw }})}
            className="px-4 py-2 border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye size={16} /> Explain with ScoreCAM
          </button>
          <button 
            onClick={() => navigate('/report', { state: { reportText: reportData, recordId, date: recordDate }})}
            className="px-4 py-2 bg-[#0b5c92] hover:bg-blue-800 text-white rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileText size={16} /> Clinical Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column: Radiograph */}
        <div className="card-surface p-8">
          <h3 className="text-lg font-display font-bold text-deep-navy dark:text-slate-100">Radiograph</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Patient chest radiograph ({recordId})</p>
          
          <div className="relative rounded-2xl overflow-hidden group mb-6 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 p-2">
            <div 
              onClick={() => imagePreview && setImageZoomed(true)}
              className="absolute top-4 right-4 w-8 h-8 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white cursor-pointer transition-colors z-10"
            >
              <Maximize2 size={16} />
            </div>
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt={`Radiograph ${recordId}`} 
                className="w-full h-auto object-contain max-h-[700px] mx-auto rounded-xl cursor-pointer" 
                onClick={() => setImageZoomed(true)}
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400">
                <span>No radiograph available</span>
              </div>
            )}
          </div>

          {/* Full-screen Lightbox */}
          {imageZoomed && imagePreview && (
            <div 
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 print:hidden"
              onClick={() => setImageZoomed(false)}
            >
              <button
                onClick={() => setImageZoomed(false)}
                className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white text-2xl transition-colors cursor-pointer z-50"
              >
                ✕
              </button>
              <img 
                src={imagePreview} 
                alt={`Radiograph ${recordId} - Full View`} 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Record ID</div>
              <div className="font-semibold text-deep-navy dark:text-slate-200">{recordId}</div>
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</div>
              <div className="font-semibold text-emerald-600 dark:text-emerald-400">Completed</div>
            </div>
          </div>
        </div>

        {/* Right Column: Top Findings & Context */}
        <div className="space-y-6 print:break-before-page" style={{ pageBreakBefore: "always", breakBefore: "page" }}>
          <div className="card-surface p-8">
            <h3 className="text-lg font-display font-bold text-deep-navy dark:text-slate-100">Top Findings</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Highest model probabilities for this patient.</p>
            
            <div className="space-y-4">
              {topFindings.map((finding) => (
                <div key={finding.label} className="border border-slate-100 dark:border-slate-800/80 rounded-xl p-5 hover:border-slate-200 dark:hover:border-slate-700 transition-colors shadow-sm bg-white dark:bg-slate-900/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedTaxonomy(finding.label)}>
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                        style={{ backgroundColor: finding.palette.lightBg, color: finding.palette.textColor }}
                      >
                        <finding.icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-deep-navy dark:text-slate-100 tracking-wide">{finding.label}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{finding.level} model probability</p>
                      </div>
                    </div>
                    <div className="text-2xl font-display font-bold text-deep-navy dark:text-white num">{finding.prob}%</div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/60">
                    <div 
                      className="rounded-full transition-all duration-1000 shadow-sm h-full" 
                      style={{ 
                        width: `${Math.max(finding.prob, 2)}%`,
                        backgroundColor: finding.activeIndicatorColor,
}}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-surface p-8">
            <h3 className="text-lg font-display font-bold text-deep-navy dark:text-slate-100">Clinical Context Overview</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Combined with imaging findings to generate the report.</p>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-5 mb-4">
              {clinicalText ? (
                <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {clinicalText.split('\n').map((line: string, i: number) => {
                    if (!line.trim()) return null;
                    const parts = line.split(':');
                    if (parts.length > 1) {
                      return (
                        <div key={i} className="mb-2 last:mb-0 flex">
                          <span className="font-bold text-slate-700 dark:text-slate-200 w-24 shrink-0">{parts[0].trim()}:</span>
                          <span className="text-slate-600 dark:text-slate-300 flex-1">{parts.slice(1).join(':').trim()}</span>
                        </div>
                      );
                    }
                    return <div key={i} className="mb-2">{line.trim()}</div>;
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">No clinical context recorded.</p>
              )}
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-xl text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
              <p><strong>Clinical Status:</strong> Full diagnostic findings and interpretation are ready for <strong>{recordId}</strong>. Click the <strong>Clinical Report</strong> button above to review complete impressions, differential considerations, and recommended next steps.</p>
            </div>
          </div>
        </div>
      </div>

      {/* All Predictions */}
      <div className="card-surface p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-xl font-display font-bold text-deep-navy dark:text-slate-100">All Model Predictions</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">All 15 ChestX-ray14 classes with sigmoid probabilities & color bars.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold self-start">
            <button
              onClick={() => {
                setColorMode('severity');
                localStorage.setItem('predictionColorMode', 'severity');
              }}
              className={clsx(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                colorMode === 'severity' ? "bg-white dark:bg-slate-700 text-deep-navy dark:text-white shadow-sm font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
              )}
            >
              Risk Severity
            </button>
            <button
              onClick={() => {
                setColorMode('categorical');
                localStorage.setItem('predictionColorMode', 'categorical');
              }}
              className={clsx(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                colorMode === 'categorical' ? "bg-white dark:bg-slate-700 text-deep-navy dark:text-white shadow-sm font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
              )}
            >
              Multi-Color
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {allPredictions.map((item) => (
            <div 
              key={item.label} 
              className="flex items-center gap-4 sm:gap-6 p-2 rounded-xl transition-all group hover:bg-slate-50 dark:hover:bg-slate-800/40"
            >
              <div className="w-40 sm:w-44 shrink-0 flex items-center gap-2.5">
                <div 
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm transition-transform group-hover:scale-125" 
                  style={{ backgroundColor: item.activeIndicatorColor }}
                />
                <span className="font-semibold text-deep-navy dark:text-slate-200 text-sm truncate">{item.label}</span>
              </div>
              
              <div className="flex-1 flex items-center gap-4">
                <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/60">
                  <div 
                    className="rounded-full transition-all duration-700 shadow-sm h-full"
                    style={{ 
                      width: `${Math.max(item.prob, item.prob > 0 ? 1.5 : 0)}%`,
                      backgroundColor: item.activeIndicatorColor 
                    }}
                  />
                </div>
                <div className="w-16 text-right font-bold text-deep-navy dark:text-white num text-sm sm:text-base">
                  {item.prob}%
                </div>
                <div className="w-20 shrink-0">
                  <span className={clsx(
                    "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded w-full inline-block text-center shadow-xs",
                    item.severityBadge
                  )}>
                    {item.level}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
