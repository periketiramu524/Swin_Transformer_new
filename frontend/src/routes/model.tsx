import { Cpu, Box, Database, TrendingUp, Layers, Wind, Activity, Maximize, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const specifications = [
  { label: 'Architecture', value: 'Swin-Tiny · Patch4 · Window7 · 224' },
  { label: 'Input Resolution', value: '224 × 224' },
  { label: 'Dataset', value: 'NIH ChestX-ray14' },
  { label: 'Classes', value: '15' },
  { label: 'Classification', value: 'Multi-label' },
  { label: 'Activation', value: 'Sigmoid' },
  { label: 'Metric', value: 'Macro AUROC 0.8386' },
  { label: 'Framework', value: 'PyTorch • timm' },
];

const findings = [
  { name: 'Effusion', desc: 'Fluid accumulation pattern label', icon: Wind, color: 'text-violet-500', bg: 'bg-violet-50' },
  { name: 'Pneumonia', desc: 'Infective opacity label', icon: Box, color: 'text-amber-700', bg: 'bg-amber-50' },
  { name: 'Atelectasis', desc: 'Volume-loss pattern label', icon: Layers, color: 'text-teal-600', bg: 'bg-teal-50' },
  { name: 'Infiltration', desc: 'Diffuse opacity label', icon: Wind, color: 'text-blue-500', bg: 'bg-blue-50' },
  { name: 'Cardiomegaly', desc: 'Cardiac silhouette label', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50' },
  { name: 'Consolidation', desc: 'Dense airspace label', icon: Box, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { name: 'Edema', desc: 'Interstitial fluid label', icon: Wind, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { name: 'Nodule', desc: 'Small focal lesion label', icon: Box, color: 'text-purple-500', bg: 'bg-purple-50' },
  { name: 'Mass', desc: 'Larger focal lesion label', icon: Box, color: 'text-amber-600', bg: 'bg-amber-50' },
  { name: 'Pleural Thickening', desc: 'Pleural surface label', icon: Layers, color: 'text-slate-600', bg: 'bg-slate-100' },
  { name: 'Emphysema', desc: 'Hyperinflation label', icon: Wind, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { name: 'Fibrosis', desc: 'Reticular pattern label', icon: Activity, color: 'text-fuchsia-500', bg: 'bg-fuchsia-50' },
  { name: 'Pneumothorax', desc: 'Pleural air label', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
  { name: 'Hernia', desc: 'Diaphragmatic label', icon: Box, color: 'text-blue-400', bg: 'bg-blue-50' },
  { name: 'No Finding', desc: 'Absence-of-label class', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

export default function ModelTab() {
  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-deep-navy dark:text-slate-100">AI Model</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Informational overview of the classification model used for analysis.</p>
      </div>

      {/* Hero Banner */}
      <div className="bg-[#0b5c92] rounded-3xl p-10 text-white shadow-xl relative overflow-hidden mb-6">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-6 border border-white/20">
            <Cpu size={14} /> Ready
          </div>
          <h2 className="text-4xl font-display font-bold mb-2">Swin Transformer</h2>
          <p className="text-blue-100/80 text-lg">NIH ChestX-ray14 Multi-Label Classification</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card-surface p-6">
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <Layers size={16} />
          </div>
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Classes</div>
          <div className="text-2xl font-bold text-deep-navy dark:text-slate-100">15</div>
        </div>
        <div className="card-surface p-6">
          <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
            <Maximize size={16} />
          </div>
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Input</div>
          <div className="text-2xl font-bold text-deep-navy dark:text-slate-100">224 × 224</div>
        </div>
        <div className="card-surface p-6">
          <div className="w-8 h-8 rounded-full bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
            <Database size={16} />
          </div>
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Dataset</div>
          <div className="text-xl font-bold text-deep-navy dark:text-slate-100">NIH ChestX-ray14</div>
        </div>
        <div className="card-surface p-6">
          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <TrendingUp size={16} />
          </div>
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Macro AUROC</div>
          <div className="text-2xl font-bold text-deep-navy dark:text-slate-100">0.8386</div>
        </div>
      </div>

      {/* Specification */}
      <div className="card-surface p-8 mb-8">
        <h3 className="text-xl font-display font-bold text-deep-navy dark:text-slate-100 mb-1">Model Specification</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Configuration reported for this build.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specifications.map((spec, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-850">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{spec.label}</span>
              <span className="text-sm font-semibold text-deep-navy dark:text-slate-200">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Findings */}
      <div className="card-surface p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-display font-bold text-deep-navy dark:text-slate-100 mb-1">15 Findings</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Label set produced by the multi-label classifier.</p>
          </div>
          <div className="bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-violet-200/50 dark:border-violet-800/50">
            <Layers size={14} /> Label taxonomy
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {findings.map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-[#0b5c92]/30 dark:hover:border-blue-500/30 transition-colors bg-white dark:bg-slate-850 shadow-sm">
              <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center shrink-0 dark:bg-opacity-20", item.bg, item.color)}>
                <item.icon size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-deep-navy dark:text-slate-100">{item.name}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
