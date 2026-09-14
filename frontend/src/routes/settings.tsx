import { useState, useEffect } from 'react';
import { 
  Sun, Moon, Bell, Sliders, ShieldCheck, Info, CheckCircle2, 
  RefreshCw, Server, RotateCcw, Save
} from 'lucide-react';
import clsx from 'clsx';

interface BackendStatus {
  online: boolean;
  latency: number;
  model: string;
  device: string;
  checkpoint: string;
  details: string;
}

export default function Settings() {
  // Appearance
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('app_theme') === 'light' ? 'light' : 'dark';
  });
  const [density, setDensity] = useState<string>(() => {
    return localStorage.getItem('app_density') || 'Comfortable';
  });
  const [colorMode, setColorMode] = useState<'severity' | 'categorical'>(() => {
    return (localStorage.getItem('predictionColorMode') as 'severity' | 'categorical') || 'categorical';
  });

  // Notifications
  const [notifyAnalysis, setNotifyAnalysis] = useState<boolean>(() => {
    return localStorage.getItem('pref_notifyAnalysis') !== 'false';
  });
  const [notifyReport, setNotifyReport] = useState<boolean>(() => {
    return localStorage.getItem('pref_notifyReport') !== 'false';
  });
  const [notifyWeekly, setNotifyWeekly] = useState<boolean>(() => {
    return localStorage.getItem('pref_notifyWeekly') === 'true';
  });

  // Analysis Preferences
  const [showAllPredictions, setShowAllPredictions] = useState<boolean>(() => {
    return localStorage.getItem('pref_showAllPredictions') !== 'false';
  });
  const [highlightHighRisk, setHighlightHighRisk] = useState<boolean>(() => {
    return localStorage.getItem('pref_highlightHighRisk') !== 'false';
  });
  const [requireClinicalContext, setRequireClinicalContext] = useState<boolean>(() => {
    return localStorage.getItem('pref_requireClinicalContext') === 'true';
  });

  // Report Preferences
  const [includeProbTable, setIncludeProbTable] = useState<boolean>(() => {
    return localStorage.getItem('pref_includeProbTable') !== 'false';
  });
  const [includeLimitations, setIncludeLimitations] = useState<boolean>(() => {
    return localStorage.getItem('pref_includeLimitations') !== 'false';
  });
  const [includeHeader, setIncludeHeader] = useState<boolean>(() => {
    return localStorage.getItem('pref_includeHeader') === 'true';
  });

  // Privacy
  const [anonymizeFilenames, setAnonymizeFilenames] = useState<boolean>(() => {
    return localStorage.getItem('pref_anonymizeFilenames') !== 'false';
  });
  const [storeHistory, setStoreHistory] = useState<boolean>(() => {
    return localStorage.getItem('pref_storeHistory') !== 'false';
  });
  const [allowTelemetry, setAllowTelemetry] = useState<boolean>(() => {
    return localStorage.getItem('pref_allowTelemetry') === 'true';
  });

  // Backend Connectivity
  const [apiUrl, setApiUrl] = useState<string>(() => {
    return localStorage.getItem('apiBaseUrl') || 'http://localhost:8000';
  });
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    online: false,
    latency: 0,
    model: 'Swin Tiny Patch4 Window7 224',
    device: 'Loading...',
    checkpoint: 'best_swin_chestxray14.pth',
    details: 'Checking connection...'
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const checkBackendHealth = async (urlToCheck = apiUrl) => {
    setIsChecking(true);
    const start = performance.now();
    try {
      const cleanUrl = urlToCheck.replace(/\/+$/, '');
      const response = await fetch(`${cleanUrl}/api/health`, { method: 'GET' });
      const elapsed = Math.round(performance.now() - start);

      if (response.ok) {
        const data = await response.json();
        setBackendStatus({
          online: true,
          latency: elapsed,
          model: data.model || 'Swin Tiny Patch4 Window7 224',
          device: (data.device || 'CPU').toUpperCase(),
          checkpoint: data.checkpoint || 'best_swin_chestxray14.pth',
          details: 'Connected & Models Active'
        });
      } else {
        throw new Error(`Status ${response.status}`);
      }
    } catch (err) {
      try {
        const cleanUrl = urlToCheck.replace(/\/+$/, '');
        const res2 = await fetch(`${cleanUrl}/`, { method: 'GET' });
        const elapsed = Math.round(performance.now() - start);
        if (res2.ok) {
          setBackendStatus({
            online: true,
            latency: elapsed,
            model: 'Swin Tiny Patch4 Window7 224',
            device: 'CPU',
            checkpoint: 'best_swin_chestxray14.pth',
            details: 'FastAPI Backend Live'
          });
          return;
        }
      } catch (err2) {}

      setBackendStatus({
        online: false,
        latency: 0,
        model: 'Swin Tiny Patch4 Window7 224',
        device: 'Offline',
        checkpoint: 'best_swin_chestxray14.pth',
        details: 'Server unreachable at ' + urlToCheck
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();

    const handleThemeEvent = () => {
      const current = localStorage.getItem('app_theme');
      setTheme(current === 'light' ? 'light' : 'dark');
    };

    window.addEventListener('storage', handleThemeEvent);
    window.addEventListener('themeChange', handleThemeEvent);
    return () => {
      window.removeEventListener('storage', handleThemeEvent);
      window.removeEventListener('themeChange', handleThemeEvent);
    };
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('app_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new Event('themeChange'));
    showToast(`Theme updated to ${newTheme === 'dark' ? 'Dark Reading' : 'Light Clinical'}`);
  };

  const handleDensityChange = (newDensity: string) => {
    setDensity(newDensity);
    localStorage.setItem('app_density', newDensity);
    if (newDensity === 'Compact') {
      document.body.classList.add('density-compact');
    } else {
      document.body.classList.remove('density-compact');
    }
    showToast(`Interface density set to ${newDensity}`);
  };

  const handleColorModeChange = (mode: 'severity' | 'categorical') => {
    setColorMode(mode);
    localStorage.setItem('predictionColorMode', mode);
    showToast(`Prediction bar style: ${mode === 'severity' ? 'Risk Severity Gradient' : 'Multi-Color Categorical'}`);
  };

  const handleSaveApiUrl = () => {
    const clean = apiUrl.trim().replace(/\/+$/, '');
    localStorage.setItem('apiBaseUrl', clean);
    setApiUrl(clean);
    checkBackendHealth(clean);
    showToast('API Endpoint saved and pinged');
  };

  const handleToggle = (key: string, currentVal: boolean, setter: (val: boolean) => void, label: string) => {
    const newVal = !currentVal;
    setter(newVal);
    localStorage.setItem(key, String(newVal));
    showToast(`${label}: ${newVal ? 'Enabled' : 'Disabled'}`);
  };

  const handleResetDefaults = () => {
    handleThemeChange('light');
    handleDensityChange('Comfortable');
    handleColorModeChange('severity');
    
    setNotifyAnalysis(true);
    localStorage.setItem('pref_notifyAnalysis', 'true');
    setNotifyReport(true);
    localStorage.setItem('pref_notifyReport', 'true');
    setNotifyWeekly(false);
    localStorage.setItem('pref_notifyWeekly', 'false');

    setShowAllPredictions(true);
    localStorage.setItem('pref_showAllPredictions', 'true');
    setHighlightHighRisk(true);
    localStorage.setItem('pref_highlightHighRisk', 'true');
    setRequireClinicalContext(false);
    localStorage.setItem('pref_requireClinicalContext', 'false');

    setIncludeProbTable(true);
    localStorage.setItem('pref_includeProbTable', 'true');
    setIncludeLimitations(true);
    localStorage.setItem('pref_includeLimitations', 'true');
    setIncludeHeader(false);
    localStorage.setItem('pref_includeHeader', 'false');

    setAnonymizeFilenames(true);
    localStorage.setItem('pref_anonymizeFilenames', 'true');
    setStoreHistory(true);
    localStorage.setItem('pref_storeHistory', 'true');
    setAllowTelemetry(false);
    localStorage.setItem('pref_allowTelemetry', 'false');

    setApiUrl('http://localhost:8000');
    localStorage.setItem('apiBaseUrl', 'http://localhost:8000');
    checkBackendHealth('http://localhost:8000');

    showToast('All settings reset to defaults');
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 animate-in fade-in duration-500">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-deep-navy text-white dark:bg-slate-800 dark:text-slate-100 px-4 py-3 rounded-2xl shadow-xl border border-slate-700 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-deep-navy dark:text-slate-100">Settings & Configuration</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Personalise the interface, prediction visualizations, notifications, and API backend.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-2 px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw size={14} /> Reset Defaults
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Appearance */}
        <div className="card-surface p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-display font-bold text-deep-navy dark:text-slate-100">Appearance & Theme</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Control visual theme and display density.</p>
            </div>
            <div className="text-primary dark:text-blue-400"><Sun size={20} /></div>
          </div>
          
          <div className="flex gap-4 mb-6">
            <button 
              onClick={() => handleThemeChange('light')}
              className={clsx(
                "flex-1 p-4 rounded-2xl text-left border-2 transition-all cursor-pointer",
                theme === 'light' 
                  ? "border-primary bg-primary text-white shadow-md shadow-blue-900/10" 
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
              )}
            >
              <Sun size={20} className="mb-2" />
              <div className="font-bold text-sm">Light Clinical</div>
              <div className={clsx("text-[10px] font-semibold mt-1", theme === 'light' ? "text-blue-100" : "text-slate-400")}>Bright medical default</div>
            </button>
            <button 
              onClick={() => handleThemeChange('dark')}
              className={clsx(
                "flex-1 p-4 rounded-2xl text-left border-2 transition-all cursor-pointer",
                theme === 'dark' 
                  ? "border-primary bg-slate-900 text-white shadow-md shadow-slate-900/40" 
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
              )}
            >
              <Moon size={20} className="mb-2" />
              <div className="font-bold text-sm">Dark Reading</div>
              <div className={clsx("text-[10px] font-semibold mt-1", theme === 'dark' ? "text-slate-300" : "text-slate-400")}>High contrast radiology room</div>
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Interface Density</label>
            <select 
              value={density}
              onChange={(e) => handleDensityChange(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="Comfortable">Comfortable (Spacious clinical view)</option>
              <option value="Compact">Compact (Dense data view)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Default Prediction Bar Style</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleColorModeChange('severity')}
                className={clsx(
                  "p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer",
                  colorMode === 'severity' 
                    ? "border-primary bg-primary/10 text-primary dark:text-blue-300 font-bold" 
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                )}
              >
                <div className="h-2 w-full rounded-full bg-gradient-to-r from-amber-500 to-red-500 mb-2"></div>
                Risk Severity (Alerting)
              </button>
              <button
                type="button"
                onClick={() => handleColorModeChange('categorical')}
                className={clsx(
                  "p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer",
                  colorMode === 'categorical' 
                    ? "border-primary bg-primary/10 text-primary dark:text-blue-300 font-bold" 
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                )}
              >
                <div className="h-2 w-full rounded-full bg-gradient-to-r from-purple-500 via-teal-500 to-blue-500 mb-2"></div>
                Multi-Color Categorical
              </button>
            </div>
          </div>
        </div>

        {/* Backend & Live Connectivity */}
        <div className="card-surface p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-display font-bold text-deep-navy dark:text-slate-100">Backend & Connectivity</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">FastAPI inference engine & model server status.</p>
            </div>
            <div className="text-primary dark:text-blue-400"><Server size={20} /></div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Live Status</span>
              <div className="flex items-center gap-2">
                {backendStatus.online ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online ({backendStatus.latency}ms)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-800">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Offline
                  </span>
                )}
                <button
                  onClick={() => checkBackendHealth()}
                  disabled={isChecking}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Ping backend"
                >
                  <RefreshCw size={14} className={clsx(isChecking && "animate-spin text-primary")} />
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 mb-3 font-medium">
              {backendStatus.details}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Device</span>
                <span className="font-semibold text-deep-navy dark:text-slate-200">{backendStatus.device}</span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Model</span>
                <span className="font-semibold text-deep-navy dark:text-slate-200">Swin-T 224</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Backend API Base URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleSaveApiUrl}
                className="px-4 py-2.5 bg-[#0b5c92] hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Save size={14} /> Save & Test
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Default port is 8000. Changes apply immediately to new image analyses.</p>
          </div>
        </div>

        {/* Analysis Preferences */}
        <div className="card-surface p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-display font-bold text-deep-navy dark:text-slate-100">Analysis Preferences</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Defaults applied to new inference sessions.</p>
            </div>
            <div className="text-violet-500"><Sliders size={20} /></div>
          </div>
          
          <div className="space-y-4">
            <div 
              onClick={() => handleToggle('pref_showAllPredictions', showAllPredictions, setShowAllPredictions, 'Show all 15 predictions')}
              className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-all cursor-pointer select-none"
            >
              <div className="pr-4">
                <div className="font-bold text-sm text-deep-navy dark:text-slate-100">Show all 15 predictions</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Display the full ChestX-ray14 label set on the results page.</div>
              </div>
              <div className={clsx(
                "w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 shadow-inner",
                showAllPredictions ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
              )}>
                <div className={clsx(
                  "w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200",
                  showAllPredictions ? "translate-x-6" : "translate-x-0"
                )} />
              </div>
            </div>

            <div 
              onClick={() => handleToggle('pref_highlightHighRisk', highlightHighRisk, setHighlightHighRisk, 'Highlight labels above 50%')}
              className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-all cursor-pointer select-none"
            >
              <div className="pr-4">
                <div className="font-bold text-sm text-deep-navy dark:text-slate-100">Highlight labels above 50%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Emphasise higher-probability labels with warning accents.</div>
              </div>
              <div className={clsx(
                "w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 shadow-inner",
                highlightHighRisk ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
              )}>
                <div className={clsx(
                  "w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200",
                  highlightHighRisk ? "translate-x-6" : "translate-x-0"
                )} />
              </div>
            </div>

            <div 
              onClick={() => handleToggle('pref_requireClinicalContext', requireClinicalContext, setRequireClinicalContext, 'Require clinical context')}
              className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-all cursor-pointer select-none"
            >
              <div className="pr-4">
                <div className="font-bold text-sm text-deep-navy dark:text-slate-100">Require clinical context</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Prompt when patient symptoms or vitals are left empty.</div>
              </div>
              <div className={clsx(
                "w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 shadow-inner",
                requireClinicalContext ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
              )}>
                <div className={clsx(
                  "w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200",
                  requireClinicalContext ? "translate-x-6" : "translate-x-0"
                )} />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card-surface p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-display font-bold text-deep-navy dark:text-slate-100">Notifications & Alerts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Choose system cues and task completion alerts.</p>
            </div>
            <div className="text-slate-400"><Bell size={20} /></div>
          </div>
          
          <div className="space-y-4">
            <div 
              onClick={() => handleToggle('pref_notifyAnalysis', notifyAnalysis, setNotifyAnalysis, 'Analysis completed alert')}
              className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-all cursor-pointer select-none"
            >
              <div className="pr-4">
                <div className="font-bold text-sm text-deep-navy dark:text-slate-100">Analysis completed</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Notify when vision transformer inference finishes.</div>
              </div>
              <div className={clsx(
                "w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 shadow-inner",
                notifyAnalysis ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
              )}>
                <div className={clsx(
                  "w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200",
                  notifyAnalysis ? "translate-x-6" : "translate-x-0"
                )} />
              </div>
            </div>
            
            <div 
              onClick={() => handleToggle('pref_notifyReport', notifyReport, setNotifyReport, 'Report ready alert')}
              className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-all cursor-pointer select-none"
            >
              <div className="pr-4">
                <div className="font-bold text-sm text-deep-navy dark:text-slate-100">Report ready</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Notify when LLM clinical multimodal report is prepared.</div>
              </div>
              <div className={clsx(
                "w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 shadow-inner",
                notifyReport ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
              )}>
                <div className={clsx(
                  "w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200",
                  notifyReport ? "translate-x-6" : "translate-x-0"
                )} />
              </div>
            </div>

            <div 
              onClick={() => handleToggle('pref_notifyWeekly', notifyWeekly, setNotifyWeekly, 'Weekly summary')}
              className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-all cursor-pointer select-none"
            >
              <div className="pr-4">
                <div className="font-bold text-sm text-deep-navy dark:text-slate-100">Weekly summary</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Send a weekly activity digest and pathology statistics.</div>
              </div>
              <div className={clsx(
                "w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 shadow-inner",
                notifyWeekly ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
              )}>
                <div className={clsx(
                  "w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200",
                  notifyWeekly ? "translate-x-6" : "translate-x-0"
                )} />
              </div>
            </div>
          </div>
        </div>

        {/* Report Preferences */}
        <div className="card-surface p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-display font-bold text-deep-navy dark:text-slate-100">Report Preferences</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Formatting and layout of generated clinical reports.</p>
            </div>
            <div className="text-teal-500"><Sliders size={20} /></div>
          </div>
          
          <div className="space-y-4">
            <div 
              onClick={() => handleToggle('pref_includeProbTable', includeProbTable, setIncludeProbTable, 'Include probability table')}
              className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-all cursor-pointer select-none"
            >
              <div className="pr-4">
                <div className="font-bold text-sm text-deep-navy dark:text-slate-100">Include probability table</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Attach the full 15-class prediction table to the export.</div>
              </div>
              <div className={clsx(
                "w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 shadow-inner",
                includeProbTable ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
              )}>
                <div className={clsx(
                  "w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200",
                  includeProbTable ? "translate-x-6" : "translate-x-0"
                )} />
              </div>
            </div>
            
            <div 
              onClick={() => handleToggle('pref_includeLimitations', includeLimitations, setIncludeLimitations, 'Include limitations section')}
              className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-all cursor-pointer select-none"
            >
              <div className="pr-4">
                <div className="font-bold text-sm text-deep-navy dark:text-slate-100">Include limitations section</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Always append research limitations and AI disclaimer.</div>
              </div>
              <div className={clsx(
                "w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 shadow-inner",
                includeLimitations ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
              )}>
                <div className={clsx(
                  "w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200",
                  includeLimitations ? "translate-x-6" : "translate-x-0"
                )} />
              </div>
            </div>

            <div 
              onClick={() => handleToggle('pref_includeHeader', includeHeader, setIncludeHeader, 'Include institution header')}
              className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-all cursor-pointer select-none"
            >
              <div className="pr-4">
                <div className="font-bold text-sm text-deep-navy dark:text-slate-100">Include institution header</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Print hospital department header on PDF/print exports.</div>
              </div>
              <div className={clsx(
                "w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 shadow-inner",
                includeHeader ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
              )}>
                <div className={clsx(
                  "w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200",
                  includeHeader ? "translate-x-6" : "translate-x-0"
                )} />
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Governance */}
        <div className="card-surface p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-display font-bold text-deep-navy dark:text-slate-100">Privacy & Data Governance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">How submitted radiograph material is handled.</p>
            </div>
            <div className="text-slate-400"><ShieldCheck size={20} /></div>
          </div>
          
          <div className="space-y-4">
            <div 
              onClick={() => handleToggle('pref_anonymizeFilenames', anonymizeFilenames, setAnonymizeFilenames, 'Anonymise filenames')}
              className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-all cursor-pointer select-none"
            >
              <div className="pr-4">
                <div className="font-bold text-sm text-deep-navy dark:text-slate-100">Anonymise filenames</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Strip patient identifiers and metadata from uploaded files.</div>
              </div>
              <div className={clsx(
                "w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 shadow-inner",
                anonymizeFilenames ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
              )}>
                <div className={clsx(
                  "w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200",
                  anonymizeFilenames ? "translate-x-6" : "translate-x-0"
                )} />
              </div>
            </div>
            
            <div 
              onClick={() => handleToggle('pref_storeHistory', storeHistory, setStoreHistory, 'Store analysis history')}
              className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-all cursor-pointer select-none"
            >
              <div className="pr-4">
                <div className="font-bold text-sm text-deep-navy dark:text-slate-100">Store analysis history</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cache recent inference results in browser storage.</div>
              </div>
              <div className={clsx(
                "w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 shadow-inner",
                storeHistory ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
              )}>
                <div className={clsx(
                  "w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200",
                  storeHistory ? "translate-x-6" : "translate-x-0"
                )} />
              </div>
            </div>

            <div 
              onClick={() => handleToggle('pref_allowTelemetry', allowTelemetry, setAllowTelemetry, 'Research telemetry')}
              className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-all cursor-pointer select-none"
            >
              <div className="pr-4">
                <div className="font-bold text-sm text-deep-navy dark:text-slate-100">Allow research telemetry</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Share anonymous latency and model runtime metrics.</div>
              </div>
              <div className={clsx(
                "w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 shadow-inner",
                allowTelemetry ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
              )}>
                <div className={clsx(
                  "w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200",
                  allowTelemetry ? "translate-x-6" : "translate-x-0"
                )} />
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card-surface p-8 md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-display font-bold text-deep-navy dark:text-slate-100">About ClinicalFusionX</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Multimodal Swin Transformer AI Clinical Decision Support Platform.</p>
            </div>
            <div className="text-slate-400"><Info size={20} /></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-800/50">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Architecture</div>
              <div className="font-bold text-sm text-deep-navy dark:text-slate-200">Swin Tiny 224</div>
            </div>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-800/50">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dataset</div>
              <div className="font-bold text-sm text-deep-navy dark:text-slate-200">NIH ChestX-ray14</div>
            </div>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-800/50">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Classes</div>
              <div className="font-bold text-sm text-deep-navy dark:text-slate-200">15 Pathologies</div>
            </div>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-800/50">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">AUROC Metric</div>
              <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">0.8950 Micro</div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 rounded-full text-[10px] font-bold">
                NIH ChestX-ray14
              </span>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] font-bold">
                Validation Calibrated Thresholds
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Research Prototype • Decision Support Only • Not for Unsupervised Diagnosis
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
