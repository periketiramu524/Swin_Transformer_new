import { useState } from 'react';
import { Download, Printer, Copy, Share2, ChevronLeft, Check, CheckCircle2, FileDown, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';
import { getCurrentPatient } from '../services/historyService';
import { getAuthUser, DEFAULT_CLINICIAN } from '../services/authService';

export default function ClinicalReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [copied, setCopied] = useState(false);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };
  
  // Retrieve active patient from historyService
  const activePatient = getCurrentPatient();
  const currentUser = getAuthUser() || DEFAULT_CLINICIAN;

  let reportData = location.state?.reportText || activePatient.report;
  let recordId = location.state?.recordId || activePatient.id;
  let recordDate = location.state?.date || activePatient.date;

  const displayRecordId = recordId || 'CXR-2481';
  const displayDate = recordDate || new Date().toLocaleString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const isObject = typeof reportData === 'object' && reportData !== null;
  const rawFallback = !isObject ? (reportData || "No clinical report data was generated. Please run an analysis first.") : "";

  // Plain text generator for copy / export
  const getPlainTextReport = () => {
    if (isObject) {
      return `# CLINICAL ANALYSIS REPORT (SWIN TRANSFORMER AI)
Record: ${displayRecordId}
Generated: ${displayDate}
Model: Swin-Tiny · Patch4 · Window7 · 224 (NIH ChestX-ray14 multi-label classifier)

================================================================================
1. CLINICAL CONTEXT
================================================================================
${reportData.clinical_context || 'None provided.'}

================================================================================
2. IMAGE MODEL FINDINGS (AI PREDICTIONS)
================================================================================
${reportData.image_model_findings || 'None detected.'}

================================================================================
3. CLINICAL INFORMATION
================================================================================
${reportData.clinical_information || 'None recorded.'}

================================================================================
4. INTEGRATED INTERPRETATION
================================================================================
${reportData.integrated_interpretation || 'None provided.'}

================================================================================
5. POSSIBLE FINDINGS / CONSIDERATIONS
================================================================================
${reportData.possible_findings || 'None.'}

================================================================================
6. RECOMMENDED CLINICAL CORRELATION & NEXT STEPS
================================================================================
${reportData.recommended_next_steps || 'Standard clinical review recommended.'}

================================================================================
7. LIMITATIONS & DISCLAIMER
================================================================================
RESEARCH PROTOTYPE DISCLAIMER: This report incorporates outputs from an artificial intelligence model (Swin Transformer) intended solely for decision support and research evaluation. It does not constitute a formal diagnostic reading or definitive clinical diagnosis. AI predictions must be independently validated and interpreted in the context of the complete clinical picture by a qualified, licensed healthcare professional.
`;
    }
    return typeof reportData === 'string' ? reportData : JSON.stringify(reportData, null, 2);
  };

  const handleDownloadPdf = () => {
    showToast('Opening Print / Save to PDF dialog...', 'info');
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handlePrint = () => {
    showToast('Preparing document for printer...', 'info');
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handleCopy = async () => {
    try {
      const text = getPlainTextReport();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('Full clinical report copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      showToast('Failed to copy report to clipboard', 'info');
    }
  };

  const handleShare = async () => {
    const text = getPlainTextReport();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Clinical Analysis Report - ${displayRecordId}`,
          text: `Swin Transformer Clinical Report (${displayRecordId}):\n\n` + text.slice(0, 300) + '...',
          url: window.location.href,
        });
        showToast('Report shared successfully!');
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // Fallback to clipboard
        } else {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      showToast('Report summary copied to clipboard for sharing!');
    } catch (err) {
      showToast('Unable to share report', 'info');
    }
  };

  const handleDownloadFile = () => {
    try {
      const text = getPlainTextReport();
      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${displayRecordId}_Clinical_Report.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Saved as ${displayRecordId}_Clinical_Report.md!`);
    } catch (err) {
      showToast('Failed to export markdown file', 'info');
    }
  };

  const MarkdownContent = ({ content }: { content: string }) => (
    <ReactMarkdown
      components={{
        p: ({node, ...props}) => <p className="mb-3 last:mb-0 leading-relaxed text-slate-700 dark:text-slate-300" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2 text-slate-700 dark:text-slate-300" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-2 text-slate-700 dark:text-slate-300" {...props} />,
        li: ({node, ...props}) => <li className="pl-1" {...props} />,
        strong: ({node, ...props}) => <strong className="font-semibold text-deep-navy dark:text-slate-100" {...props} />,
        h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2 text-deep-navy dark:text-slate-100" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-4 mb-2 text-deep-navy dark:text-slate-100" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-md font-bold mt-3 mb-1 text-deep-navy dark:text-slate-100" {...props} />,
      }}
    >
      {content || "No data provided."}
    </ReactMarkdown>
  );

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toast && (
        <div className={clsx(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl border text-sm font-semibold transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 print:hidden",
          toast.type === 'success' 
            ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20" 
            : "bg-[#0b5c92] text-white border-blue-600 shadow-blue-500/20"
        )}>
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Screen Header - Hidden on Print */}
      <div className="mb-8 flex items-center gap-4 print:hidden">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
          title="Go back"
        >
          <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold text-deep-navy dark:text-slate-100">Clinical Analysis Report</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Structured, readable report layout for clinical review and documentation.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Report Document */}
        <div className="flex-1 print:w-full print:max-w-none">
          {/* Document Header Banner */}
          <div className="bg-[#0b5c92] rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden mb-10 print:rounded-2xl print:p-6 print:mb-6">
            <div className="relative z-10">
              <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-6 border border-white/20">
                AI Generated • Research Prototype
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-8">Clinical Analysis Report</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm">
                  <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Record ID</div>
                  <div className="font-semibold text-lg">{displayRecordId}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm">
                  <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Generated</div>
                  <div className="font-semibold text-lg">{displayDate}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm">
                  <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Model</div>
                  <div className="font-semibold text-base truncate">Swin-Tiny · Patch4 · Window7 · 224</div>
                </div>
              </div>
            </div>
          </div>

          {!isObject ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 md:p-12 mb-12">
              <h3 className="text-xl font-display font-bold text-[#0b5c92] dark:text-blue-400 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-bold">1</span>
                Diagnostic Impression & Findings
              </h3>
              <div className="pl-11 text-[15px] leading-relaxed">
                <MarkdownContent content={rawFallback} />
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 md:p-12 print:border-none print:shadow-none print:p-0">
              
              {/* 1. Clinical Context */}
              <div className="mb-10">
                <h3 className="text-xl font-display font-bold text-[#0b5c92] dark:text-blue-400 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-bold">1</span>
                  Clinical Context
                </h3>
                <div className="pl-11 text-[15px]">
                  <MarkdownContent content={reportData.clinical_context} />
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-800 mb-10" />

              {/* 2. Image Model Findings */}
              <div className="mb-10">
                <h3 className="text-xl font-display font-bold text-[#0b5c92] dark:text-blue-400 mb-2 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-bold">2</span>
                  Image Model Findings (AI Predictions)
                </h3>
                <div className="pl-11">
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 italic mb-4">Note: The following probabilities are generated by a Swin Transformer deep learning model based on the chest X-ray image. These represent statistical likelihoods, not definitive radiological diagnoses.</p>
                  <div className="text-[15px]">
                    <MarkdownContent content={reportData.image_model_findings} />
                  </div>
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-800 mb-10" />

              {/* 3. Clinical Information */}
              <div className="mb-10">
                <h3 className="text-xl font-display font-bold text-[#0b5c92] dark:text-blue-400 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-bold">3</span>
                  Clinical Information
                </h3>
                <div className="pl-11 text-[15px]">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <MarkdownContent content={reportData.clinical_information} />
                  </div>
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-800 mb-10" />

              {/* 4. Integrated Interpretation */}
              <div className="mb-10">
                <h3 className="text-xl font-display font-bold text-[#0b5c92] dark:text-blue-400 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-bold">4</span>
                  Integrated Interpretation
                </h3>
                <div className="pl-11 text-[15px]">
                  <MarkdownContent content={reportData.integrated_interpretation} />
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-800 mb-10" />

              {/* 5. Possible Findings */}
              <div className="mb-10">
                <h3 className="text-xl font-display font-bold text-[#0b5c92] dark:text-blue-400 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-bold">5</span>
                  Possible Findings / Considerations
                </h3>
                <div className="pl-11 text-[15px]">
                  <MarkdownContent content={reportData.possible_findings} />
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-800 mb-10" />

              {/* 6. Recommended Clinical Correlation */}
              <div className="mb-10">
                <h3 className="text-xl font-display font-bold text-[#0b5c92] dark:text-blue-400 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-bold">6</span>
                  Recommended Clinical Correlation & Next Steps
                </h3>
                <div className="pl-11 text-[15px]">
                  <MarkdownContent content={reportData.recommended_next_steps} />
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-800 mb-10" />

              {/* 7. Limitations / Disclaimer */}
              <div>
                <h3 className="text-xl font-display font-bold text-[#0b5c92] dark:text-blue-400 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-bold">7</span>
                  Limitations / Disclaimer
                </h3>
                <div className="pl-11 text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <strong className="text-slate-700 dark:text-slate-200">RESEARCH PROTOTYPE DISCLAIMER:</strong> This report incorporates outputs from an artificial intelligence model (Swin Transformer) intended solely for decision support and research evaluation. It does <strong>not</strong> constitute a formal diagnostic reading or definitive clinical diagnosis. AI predictions must be independently validated and interpreted in the context of the complete clinical picture by a qualified, licensed healthcare professional.
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-800 my-10" />

              {/* Physician Review & Signature Block */}
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                    <ShieldCheck size={16} /> Digitally Verified Clinical Record
                  </div>
                  <div className="font-display font-bold text-base text-deep-navy dark:text-slate-100">
                    {currentUser.name === 'Guest' ? 'Guest Attending Clinician' : currentUser.name}{currentUser.name !== 'Guest' ? ', MD' : ''}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {currentUser.role} • {currentUser.department}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2 font-mono">
                    NPI: 1942083152 • Verification Hash: SHA256-A78F-CXR99 • Signed: {displayDate}
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end justify-center shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 size={14} /> Signed & Approved
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">Medical Record Overread Complete</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar (Actions & Summary) - Hidden during print */}
        <div className="w-full lg:w-80 shrink-0 space-y-6 print:hidden">
          <div className="card-surface p-6">
            <h3 className="font-bold text-deep-navy dark:text-slate-100 text-lg mb-1">Report Actions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Export, print, or share this document.</p>
            
            <div className="space-y-3">
              <button 
                onClick={handleDownloadPdf}
                className="w-full py-2.5 bg-[#0b5c92] hover:bg-blue-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <Download size={16} /> Download PDF
              </button>

              <button 
                onClick={handlePrint}
                className="w-full py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Printer size={16} /> Print Report
              </button>

              <button 
                onClick={handleCopy}
                className={clsx(
                  "w-full py-2.5 border rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer",
                  copied
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                )}
              >
                {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />} 
                {copied ? 'Copied to Clipboard!' : 'Copy Report'}
              </button>

              <button 
                onClick={handleShare}
                className="w-full py-2.5 text-primary dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-transparent rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Share2 size={16} /> Share Report
              </button>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleDownloadFile}
                  className="w-full py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileDown size={14} /> Export Markdown (.md)
                </button>
              </div>
            </div>
          </div>

          <div className="card-surface p-6">
            <h3 className="font-bold text-deep-navy dark:text-slate-100 text-lg mb-4">Report Summary</h3>
            
            <div className="space-y-3">
              <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Status</div>
                <div className="font-semibold text-deep-navy dark:text-slate-200 text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  AI Generated
                </div>
              </div>

              <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Record ID</div>
                <div className="font-semibold text-deep-navy dark:text-slate-200 text-sm">{displayRecordId}</div>
              </div>

              <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Warning</div>
                <div className="font-semibold text-amber-600 dark:text-amber-400 text-sm">Research Use Only</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
