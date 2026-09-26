import React, { useState } from 'react';
import { UploadCloud, User, Activity, FlaskConical, Stethoscope, Save, Zap, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { saveAnalysis } from '../services/historyService';

const ALL_SYMPTOMS = ['Cough', 'Fever', 'Shortness of Breath', 'Chest Pain', 'Fatigue', 'Wheezing', 'Night Sweats', 'Weight Loss'];

export default function NewAnalysis() {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [otherSymptom, setOtherSymptom] = useState("");
  const [temp, setTemp] = useState("");
  const [hr, setHr] = useState("");
  const [spo2, setSpo2] = useState("");
  const [wbc, setWbc] = useState("");
  const [crp, setCrp] = useState("");
  const [ddimer, setDdimer] = useState("");
  
  // UI State
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(f);
      setError("");
    }
  };

  const toggleSymptom = (sym: string) => {
    if (symptoms.includes(sym)) {
      setSymptoms(symptoms.filter(s => s !== sym));
    } else {
      setSymptoms([...symptoms, sym]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a Chest X-ray image first.");
      return;
    }

    const requireContext = localStorage.getItem('pref_requireClinicalContext') === 'true';
    const hasAnyContext = age || sex || symptoms.length > 0 || otherSymptom || temp || hr || spo2 || wbc || crp || ddimer;
    if (requireContext && !hasAnyContext) {
      setError("Settings requirement: Please provide patient symptoms or clinical vitals before running analysis.");
      return;
    }
    
    setIsProcessing(true);
    setError("");

    try {
      const clinicalText = `
        Patient: ${age || 'Unknown age'} ${sex || 'Unknown sex'}. 
        Symptoms: ${(symptoms.length > 0 || otherSymptom) ? [...symptoms, otherSymptom].filter(Boolean).join(', ') : 'None reported'}.
        Vitals: Temp ${temp || 'N/A'}, HR ${hr || 'N/A'}, SpO2 ${spo2 || 'N/A'}.
        Labs: WBC ${wbc || 'N/A'}, CRP ${crp || 'N/A'}, D-Dimer ${ddimer || 'N/A'}.
      `;

      const formData = new FormData();
      formData.append('image', file);
      formData.append('clinical_text', clinicalText.trim());
      // Send structured symptoms for CCM (Clinical Consistency Module)
      const allSymptoms = [...symptoms, otherSymptom].filter(Boolean);
      formData.append('symptoms_json', JSON.stringify(allSymptoms));

      const apiBase = (localStorage.getItem('apiBaseUrl') || 'http://localhost:8000').replace(/\/+$/, '');
      const response = await fetch(`${apiBase}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed. Server responded with ${response.status}`);
      }

      const data = await response.json();
      
      // Save image preview and analysis results to sessionStorage to avoid router state loss
      if (imagePreview) {
        sessionStorage.setItem('recentImagePreview', imagePreview);
      }
      sessionStorage.setItem('recentResults', JSON.stringify(data));
      sessionStorage.setItem('recentClinicalText', clinicalText);
      
      // Save into persistent analysis history for Dashboard, History, Results, and Report tabs
      let savedRecord: any = null;
      try {
        const findingsList = data?.findings || [];
        const sorted = [...findingsList].sort((a: any, b: any) => b.probability - a.probability);
        const top = sorted[0] || { disease: 'No Finding', probability: 0 };
        
        savedRecord = saveAnalysis({
          status: 'Completed',
          imagePreview: imagePreview || '',
          findings: data.findings || [],
          topFinding: {
            disease: top.disease,
            probability: parseFloat((top.probability * 100).toFixed(1)),
          },
          clinicalText: clinicalText.trim(),
          report: data.report
        });
      } catch (saveErr) {
        console.error('Failed to save to history:', saveErr);
      }

      // Navigate to results page and pass the complete active patient record
      navigate('/results', { 
        state: { 
          results: data, 
          clinicalText, 
          imagePreview: savedRecord?.imagePreview || imagePreview,
          recordId: savedRecord?.id || 'CXR-Latest',
          date: savedRecord?.date || new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        } 
      });

    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-deep-navy dark:text-slate-100">New Chest X-ray Analysis</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Upload an X-ray and provide clinical context for AI-assisted analysis.</p>
      </div>

      {/* Progress Pipeline */}
      <div className="flex items-center gap-2 mb-8 bg-white dark:bg-slate-900/90 p-3 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className={clsx("flex-1 rounded-2xl py-3 px-4 flex items-center gap-3 transition-colors", 
          (!file && !isProcessing) ? "bg-[#0b5c92] text-white" : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/60"
        )}>
          <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
            (!file && !isProcessing) ? "bg-white/20" : "bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100"
          )}>
            {file ? <CheckCircle size={12} /> : "01"}
          </div>
          <div>
            <div className="font-bold text-sm">Upload</div>
            <div className="text-[10px] uppercase tracking-wide opacity-80">
              {file ? "Complete" : "In progress"}
            </div>
          </div>
        </div>

        <div className={clsx("flex-1 rounded-2xl py-3 px-4 flex items-center gap-3 transition-colors border", 
          (file && !isProcessing) ? "bg-[#0b5c92] text-white border-[#0b5c92]" : 
          (isProcessing) ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/60" : 
          "bg-slate-50 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800"
        )}>
          <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm",
            (file && !isProcessing) ? "bg-white/20" : 
            (isProcessing) ? "bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100" : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300"
          )}>
            {isProcessing ? <CheckCircle size={12} /> : "02"}
          </div>
          <div>
            <div className={clsx("font-bold text-sm", (file && !isProcessing) ? "text-white" : isProcessing ? "text-emerald-700 dark:text-emerald-300" : "text-slate-600 dark:text-slate-300")}>Clinical Data</div>
            <div className="text-[10px] uppercase tracking-wide opacity-80">
              {file && !isProcessing ? "In progress" : isProcessing ? "Complete" : "Pending"}
            </div>
          </div>
        </div>

        <div className={clsx("flex-1 rounded-2xl py-3 px-4 flex items-center gap-3 transition-colors border", 
          (isProcessing) ? "bg-[#0b5c92] text-white border-[#0b5c92]" : "bg-slate-50 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800"
        )}>
          <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm",
            (isProcessing) ? "bg-white/20" : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300"
          )}>
            03
          </div>
          <div>
            <div className={clsx("font-bold text-sm", isProcessing ? "text-white" : "text-slate-600 dark:text-slate-300")}>AI Analysis</div>
            <div className="text-[10px] uppercase tracking-wide opacity-80">
              {isProcessing ? "Processing" : "Pending"}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 rounded-2xl py-3 px-4 flex items-center gap-3 border border-slate-100 dark:border-slate-800">
          <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold shadow-sm">04</div>
          <div>
            <div className="font-bold text-sm text-slate-600 dark:text-slate-300">Report</div>
            <div className="text-[10px] uppercase tracking-wide opacity-80">Pending</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <div className="card-surface mb-4 p-8">
        <h3 className="text-xl font-display font-bold text-deep-navy dark:text-slate-100 mb-1">Upload Chest X-ray</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Upload a chest radiograph for AI-assisted analysis.</p>

        <div className={clsx(
          "border-2 border-dashed rounded-3xl transition-colors cursor-pointer relative overflow-hidden group",
          imagePreview ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60" : "border-slate-300 dark:border-slate-700 bg-[#f4f7f9] dark:bg-slate-800/50 hover:bg-[#eef2f5] dark:hover:bg-slate-800/80"
        )}>
          <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" accept="image/*" onChange={handleFileChange} />
          
          <div className="p-16 flex flex-col items-center justify-center text-center">
            {imagePreview ? (
              <div className="relative w-64 h-64 rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">Change Image</span>
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-sm">
                  <UploadCloud size={32} />
                </div>
                <h4 className="text-lg font-bold text-deep-navy dark:text-slate-100 mb-1">Drag & drop your X-ray here</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">or browse from your device</p>
                <button className="bg-[#0b5c92] hover:bg-blue-800 text-white px-6 py-2 rounded-full font-semibold text-sm transition-colors shadow-sm relative z-10 pointer-events-none">
                  Choose X-ray
                </button>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 font-semibold uppercase tracking-wider">PNG, JPG, JPEG • Max 10 MB</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        {/* Patient Information */}
        <div className="card-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-display font-bold text-deep-navy dark:text-slate-100">Patient Information</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Basic demographics used as clinical context.</p>
            </div>
            <div className="text-slate-400 dark:text-slate-500"><User size={20} /></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Age</label>
              <input 
                type="text" 
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="e.g. 58" 
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-1.5 text-sm focus:ring-2 focus:ring-[#0b5c92]/20 focus:border-[#0b5c92] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Sex</label>
              <select 
                value={sex}
                onChange={e => setSex(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-1.5 text-sm focus:ring-2 focus:ring-[#0b5c92]/20 focus:border-[#0b5c92] outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">Select sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
        </div>

        {/* Symptoms */}
        <div className="card-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-display font-bold text-deep-navy dark:text-slate-100">Symptoms</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select all reported symptoms.</p>
            </div>
            <div className="text-slate-400 dark:text-slate-500"><Stethoscope size={20} /></div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {ALL_SYMPTOMS.map((sym) => {
              const isActive = symptoms.includes(sym);
              return (
                <button 
                  key={sym} 
                  onClick={() => toggleSymptom(sym)}
                  className={clsx(
                    "px-4 py-2 rounded-full text-sm font-semibold border transition-colors cursor-pointer",
                    isActive 
                      ? "bg-[#0b5c92] border-[#0b5c92] text-white" 
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  {sym}
                </button>
              )
            })}
          </div>
          <div className="mt-4">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Other</label>
            <input 
              type="text" 
              value={otherSymptom}
              onChange={e => setOtherSymptom(e.target.value)}
              placeholder="e.g. Nausea, dizziness (comma separated)" 
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#0b5c92]/20 focus:border-[#0b5c92] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" 
            />
          </div>
        </div>

        {/* Vital Signs */}
        <div className="card-surface p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-display font-bold text-deep-navy dark:text-slate-100">Vital Signs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Recorded at time of imaging.</p>
            </div>
            <div className="text-rose-400"><Activity size={20} /></div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Temperature</label>
              <input type="text" value={temp} onChange={e => setTemp(e.target.value)} placeholder="e.g. 38.2 °C" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0b5c92]/20 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Heart Rate</label>
              <input type="text" value={hr} onChange={e => setHr(e.target.value)} placeholder="e.g. 104 bpm" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0b5c92]/20 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">SpO2</label>
              <input type="text" value={spo2} onChange={e => setSpo2(e.target.value)} placeholder="e.g. 91%" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0b5c92]/20 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500" />
            </div>
          </div>
        </div>

        {/* Laboratory Data */}
        <div className="card-surface p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-display font-bold text-deep-navy dark:text-slate-100">Laboratory Data</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Optional values improve clinical context.</p>
            </div>
            <div className="text-violet-400"><FlaskConical size={20} /></div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">WBC</label>
              <input type="text" value={wbc} onChange={e => setWbc(e.target.value)} placeholder="e.g. 12.4 x10³/L" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0b5c92]/20 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">CRP</label>
              <input type="text" value={crp} onChange={e => setCrp(e.target.value)} placeholder="e.g. 48 mg/L" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0b5c92]/20 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">D-Dimer</label>
              <input type="text" value={ddimer} onChange={e => setDdimer(e.target.value)} placeholder="e.g. 0.6 µg/mL" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0b5c92]/20 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="card-surface p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 shadow-xl border-blue-100 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-deep-navy dark:text-slate-100">Ready to run inference</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">The interface will forward the image and clinical context to your backend.</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-6 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <Save size={16} /> Save Draft
          </button>
          <button 
            onClick={handleAnalyze}
            disabled={isProcessing}
            className={clsx(
              "flex-1 sm:flex-none px-6 py-1.5 rounded-xl text-white text-sm font-bold shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer",
              isProcessing ? "bg-slate-400 cursor-not-allowed" : "bg-[#0b5c92] hover:bg-blue-800"
            )}
          >
            {isProcessing ? (
              <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
            ) : (
              <><Zap size={16} /> Analyze Chest X-ray</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
