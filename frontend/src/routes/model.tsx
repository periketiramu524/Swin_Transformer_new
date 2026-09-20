import { Cpu, Box, Database, TrendingUp, Layers, Wind, Activity, Maximize, AlertCircle, Eye } from 'lucide-react';
import clsx from 'clsx';

const specifications = [
  { label: 'Architecture', value: 'Swin-Tiny · Patch4 · Window7 · 224' },
  { label: 'Input Resolution', value: '224 × 224 pixels (3 channels RGB)' },
  { label: 'Dataset', value: 'NIH ChestX-ray14 (112,120 Frontal CXRs)' },
  { label: 'Classes', value: '15 Multi-Label Thoracic Pathologies' },
  { label: 'Classification Type', value: 'Multi-Label Binary Cross Entropy' },
  { label: 'Activation Function', value: 'Independent Sigmoid per Class' },
  { label: 'Evaluation Metric', value: 'Macro AUROC 0.8386' },
  { label: 'Framework & Engine', value: 'PyTorch 2.x • timm • CUDA/CPU' },
];

const findings = [
  { name: 'Effusion', desc: 'Fluid accumulation in the pleural cavity', icon: Wind, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/50', border: 'border-violet-200 dark:border-violet-800/60' },
  { name: 'Pneumonia', desc: 'Infective consolidation and exudation', icon: Box, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50', border: 'border-amber-200 dark:border-amber-800/60' },
  { name: 'Atelectasis', desc: 'Subsegmental volume-loss & alveolar collapse', icon: Layers, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/50', border: 'border-teal-200 dark:border-teal-800/60' },
  { name: 'Infiltration', desc: 'Diffuse parenchymal opacities & interstitial haziness', icon: Wind, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/50', border: 'border-blue-200 dark:border-blue-800/60' },
  { name: 'Cardiomegaly', desc: 'Enlarged cardiac silhouette (CTR > 0.50)', icon: Activity, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/50', border: 'border-rose-200 dark:border-rose-800/60' },
  { name: 'Consolidation', desc: 'Dense alveolar filling with air bronchograms', icon: Box, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/50', border: 'border-indigo-200 dark:border-indigo-800/60' },
  { name: 'Edema', desc: 'Hydrostatic pulmonary interstitial congestion', icon: Wind, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/50', border: 'border-cyan-200 dark:border-cyan-800/60' },
  { name: 'Nodule', desc: 'Focal parenchymal lesion <= 3 cm diameter', icon: Box, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/50', border: 'border-purple-200 dark:border-purple-800/60' },
  { name: 'Mass', desc: 'Solitary or multiple focal lesion > 3 cm', icon: Box, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/50', border: 'border-amber-200 dark:border-amber-800/60' },
  { name: 'Pleural Thickening', desc: 'Chronic fibrocalcific pleural reaction', icon: Layers, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800/80', border: 'border-slate-300 dark:border-slate-700' },
  { name: 'Emphysema', desc: 'Bilateral hyperinflation & flattened diaphragms', icon: Wind, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50', border: 'border-emerald-200 dark:border-emerald-800/60' },
  { name: 'Fibrosis', desc: 'Chronic reticular scarring & structural distortion', icon: Activity, color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/50', border: 'border-fuchsia-200 dark:border-fuchsia-800/60' },
  { name: 'Pneumothorax', desc: 'Visceral pleural line with absent peripheral lung markings', icon: AlertCircle, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/50', border: 'border-orange-200 dark:border-orange-800/60' },
  { name: 'Hernia', desc: 'Diaphragmatic displacement of abdominal viscera', icon: Box, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/50', border: 'border-sky-200 dark:border-sky-800/60' },
  { name: 'No Finding', desc: 'Normal aerated parenchyma without focal abnormality', icon: Activity, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50', border: 'border-emerald-200 dark:border-emerald-800/60' },
];

export default function ModelTab() {
  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">AI Model Architecture & Benchmarks</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-1">
          Detailed technical specifications and 15-class diagnostic label taxonomy.
        </p>
      </div>

      {/* Hero Banner */}
      <div className="bg-[#0b5c92] dark:bg-gradient-to-r dark:from-[#0b5c92] dark:to-[#0f3b5c] rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden mb-8 border border-white/10 dark:border-blue-500/20">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-6 border border-white/20 text-white">
            <Cpu size={14} className="text-sky-300" />
            <span>Swin Transformer Checkpoint Loaded & Verified</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-2">Swin Transformer</h2>
          <p className="text-blue-100/90 text-sm sm:text-base max-w-2xl">
            Shifted Window Self-Attention network for chest radiograph multi-label pathology classification.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Layers size={18} />
          </div>
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Target Classes</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">15 Pathologies</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
            <Maximize size={18} />
          </div>
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Input Resolution</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">224 × 224</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3">
            <Database size={18} />
          </div>
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Training Corpus</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white truncate" title="NIH ChestX-ray14">NIH ChestX-ray14</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <TrendingUp size={18} />
          </div>
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Macro AUROC</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">0.8386</div>
        </div>
      </div>

      {/* Specification Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 mb-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Cpu size={20} className="text-[#0b5c92] dark:text-sky-400" />
          Model Specification & Hyperparameters
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Execution profile reported by the active inference engine.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {specifications.map((spec, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700/80 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{spec.label}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white font-mono">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 15 Findings Taxonomy */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Eye size={20} className="text-[#0b5c92] dark:text-sky-400" />
              15 Thoracic Findings Taxonomy
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Radiological definitions of the multi-label classes detected by the vision transformer.</p>
          </div>
          <div className="bg-violet-50 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-violet-200/60 dark:border-violet-800/60">
            <Layers size={14} /> 15 Multi-Label Targets
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {findings.map((item, i) => (
            <div 
              key={i} 
              className="flex items-center gap-3.5 p-4 border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-xs"
            >
              <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", item.bg, item.color, item.border)}>
                <item.icon size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.name}</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
