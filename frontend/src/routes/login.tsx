import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Stethoscope, ArrowRight, ShieldCheck, X, Check } from 'lucide-react';
import clsx from 'clsx';
import { loginUser, loginWithGoogle, DEFAULT_CLINICIAN } from '../services/authService';

const GoogleIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleDoctorName, setGoogleDoctorName] = useState('');
  const [googleDoctorEmail, setGoogleDoctorEmail] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    if (!username.trim()) { setError('Please enter a username'); return; }
    setLoading(true);
    setTimeout(() => { loginUser(isSignUp ? fullName : username, role); setLoading(false); navigate('/'); }, 400);
  };

  const handleGuestLogin = () => {
    setLoading(true);
    setTimeout(() => { loginUser(DEFAULT_CLINICIAN.name, DEFAULT_CLINICIAN.role); setLoading(false); navigate('/'); }, 300);
  };

  const handleGoogleSignIn = (name: string, email: string) => {
    if (!name.trim()) return;
    setLoading(true);
    setShowGoogleModal(false);
    setTimeout(() => { loginWithGoogle(name, email); setLoading(false); navigate('/'); }, 400);
  };

  // Input row: shared compact styling
  const inputRow = "relative flex items-center rounded-xl bg-[#e8edf3] dark:bg-[#0d1424] shadow-[inset_2px_2px_5px_#c5cfdb,inset_-2px_-2px_5px_#ffffff] dark:shadow-[inset_2px_2px_5px_#060a12,inset_-2px_-2px_5px_#1a2640] px-3 border border-transparent transition-all";

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#e8edf3] dark:bg-[#0a0f1d] text-slate-800 dark:text-slate-100 selection:bg-sky-500 selection:text-white relative overflow-hidden font-sans">
      {/* Ambient glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-200/35 dark:bg-blue-900/12 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sky-200/35 dark:bg-sky-950/12 blur-[100px] pointer-events-none" />

      {/* ── Circular Disc ── */}
      {/* Sign-in mode: 500px circle. Sign-up mode: 600px to hold 2 extra fields evenly */}
      <div className={clsx(
        "relative rounded-full aspect-square bg-[#e8edf3] dark:bg-[#0d1424] transition-all duration-500",
        "shadow-[20px_20px_40px_#c3ccd8,-20px_-20px_40px_#ffffff] dark:shadow-[18px_18px_40px_#04070d,-18px_-18px_40px_#141f36]",
        "border border-white/60 dark:border-slate-800/60",
        "flex items-center justify-center",
        isSignUp
          ? "w-[min(94vw,600px)] h-[min(94vw,600px)]"
          : "w-[min(90vw,500px)] h-[min(90vw,500px)]"
      )}>
        {/* Inner concentric ring */}
        <div className="absolute inset-3 rounded-full pointer-events-none border border-white/45 dark:border-slate-700/20" />

        {/* Content — fixed width, vertically centered */}
        <div className={clsx(
          "relative z-10 flex flex-col items-center w-full px-10",
          isSignUp ? "max-w-[380px] gap-2" : "max-w-[340px] gap-2.5"
        )}>

          {/* ── Header ── */}
          <div className="text-center">
            <h1 className={clsx(
              "font-display font-extrabold tracking-tight text-[#2d3748] dark:text-slate-100",
              isSignUp ? "text-2xl" : "text-3xl"
            )}>
              {isSignUp ? 'Sign Up' : 'Login'}
            </h1>
            <p className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {isSignUp ? 'Create your clinical workstation profile' : 'Sign in to your account'}
            </p>
          </div>

          {/* ── Error Banner ── */}
          {error && (
            <div className="w-full p-2 rounded-xl text-[10.5px] font-semibold bg-rose-50 border border-rose-200 text-rose-700 text-center">
              {error}
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSignIn} className="w-full flex flex-col gap-2">

            {/* Sign-Up extra fields */}
            {isSignUp && (
              <>
                <div className={clsx(inputRow, "py-2 focus-within:border-sky-400/70")}>
                  <ShieldCheck size={14} className="text-[#0284c7] dark:text-sky-400 shrink-0 mr-2" />
                  <input type="text" placeholder="Full Name (Dr. Sarah Mitchell)" value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none font-medium py-2" />
                </div>
                <div className={clsx(inputRow, "py-2 focus-within:border-sky-400/70")}>
                  <Stethoscope size={14} className="text-slate-400 shrink-0 mr-2" />
                  <input type="text" placeholder="Clinical Role (e.g. Radiologist)" value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none font-medium py-2" />
                </div>
              </>
            )}

            {/* Username — always has blue border */}
            <div className={clsx(inputRow, "py-2 border-sky-400/80 dark:border-sky-500/60 focus-within:border-blue-500 ring-[1.5px] ring-sky-400/20")}>
              <User size={14} className="text-[#0284c7] dark:text-sky-400 shrink-0 mr-2" />
              <input type="text" placeholder="dr.mitchell" value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none font-medium py-2" />
            </div>

            {/* Password */}
            <div className={clsx(inputRow, "py-2 focus-within:border-slate-300 dark:focus-within:border-slate-600")}>
              <Lock size={14} className="text-slate-400 dark:text-slate-500 shrink-0 mr-2" />
              <input type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none font-medium py-2" />
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between text-[10.5px] px-0.5">
              <label onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-1.5 cursor-pointer select-none text-slate-500 dark:text-slate-400 font-medium">
                <div className="w-7 h-3.5 rounded-full p-0.5 flex items-center bg-[#e0e7ee] dark:bg-slate-800 shadow-[inset_1.5px_1.5px_3px_#c5cfdb,inset_-1.5px_-1.5px_3px_#ffffff] dark:shadow-[inset_1.5px_1.5px_3px_#05080f,inset_-1.5px_-1.5px_3px_#182338]">
                  <div className={clsx(
                    "w-2.5 h-2.5 rounded-full transition-transform duration-200 shadow-sm",
                    rememberMe ? "translate-x-3.5 bg-[#0284c7]" : "translate-x-0 bg-[#e8edf3] dark:bg-slate-300"
                  )} />
                </div>
                <span>Remember me</span>
              </label>
              <button type="button"
                onClick={() => alert('Contact the hospital IT or radiology administrator.')}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium">
                Forgot password?
              </button>
            </div>

            {/* Main CTA Button */}
            <button type="submit" disabled={loading}
              className={clsx(
                "w-full rounded-xl text-[10.5px] font-extrabold tracking-widest uppercase transition-all duration-200 cursor-pointer select-none",
                "py-2.5 bg-[#e8edf3] dark:bg-[#0d1424] text-slate-700 dark:text-slate-200",
                "shadow-[5px_5px_12px_#c3ccd8,-5px_-5px_12px_#ffffff] dark:shadow-[5px_5px_12px_#05080f,-5px_-5px_12px_#15203a]",
                "hover:shadow-[3px_3px_6px_#c3ccd8,-3px_-3px_6px_#ffffff] hover:text-slate-900 dark:hover:text-white",
                "active:shadow-[inset_2px_2px_5px_#c3ccd8,inset_-2px_-2px_5px_#ffffff] active:scale-[0.99]"
              )}>
              {loading ? 'SIGNING IN...' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </button>

            {/* Google Sign-In */}
            <button type="button" onClick={() => setShowGoogleModal(true)}
              className={clsx(
                "w-full py-2 rounded-xl text-[10.5px] font-bold flex items-center justify-center gap-2 cursor-pointer",
                "bg-[#e8edf3] dark:bg-[#0d1424] text-slate-700 dark:text-slate-200",
                "border border-slate-300/35 dark:border-slate-700/35",
                "shadow-[3px_3px_8px_#c5cfdb,-3px_-3px_8px_#ffffff] dark:shadow-[3px_3px_8px_#060a12,-3px_-3px_8px_#18243c]",
                "hover:shadow-[2px_2px_4px_#c5cfdb,-2px_-2px_4px_#ffffff] hover:text-slate-900 dark:hover:text-white transition-all"
              )}>
              <GoogleIcon />
              <span>Sign in with Google</span>
            </button>

            {/* Continue as Guest */}
            <button type="button" onClick={handleGuestLogin}
              className="w-full py-1 text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <Stethoscope size={12} className="text-[#0284c7] dark:text-sky-400" />
              <span>Continue as Guest</span>
              <ArrowRight size={10} />
            </button>

            {/* Switch mode */}
            <div className="text-center text-[10.5px] text-slate-500 dark:text-slate-400">
              {isSignUp ? (
                <>Already have an account?{' '}
                  <button type="button" onClick={() => { setIsSignUp(false); setError(null); }}
                    className="text-[#0284c7] dark:text-sky-400 font-bold hover:underline cursor-pointer">Sign in</button>
                </>
              ) : (
                <>Don't have an account?{' '}
                  <button type="button" onClick={() => { setIsSignUp(true); setError(null); }}
                    className="text-[#0284c7] dark:text-sky-400 font-bold hover:underline cursor-pointer">Sign up</button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ── Google Account Selector Modal ── */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <button onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X size={17} />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <GoogleIcon />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Sign in with Google</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Choose or enter your Google Doctor account</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Suggested Accounts</div>
              {[
                { name: 'Dr. Sarah Johnson', email: 'sarah.johnson@radiology.health.org', initials: 'SJ', color: 'bg-blue-600' },
                { name: 'Dr. Alexander Chen', email: 'alex.chen@thoracic-ai.org', initials: 'AC', color: 'bg-emerald-600' },
              ].map((doc) => (
                <button key={doc.email} type="button" onClick={() => handleGoogleSignIn(doc.name, doc.email)}
                  className="w-full p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/60 dark:bg-slate-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 flex items-center justify-between text-left transition-all cursor-pointer group">
                  <div className="flex items-center gap-2.5">
                    <div className={clsx("w-7 h-7 rounded-full text-white font-bold text-[10px] flex items-center justify-center", doc.color)}>{doc.initials}</div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">{doc.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{doc.email}</div>
                    </div>
                  </div>
                  <ArrowRight size={13} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Custom Google Account</div>
              <input type="text" placeholder="Doctor Name (e.g. Dr. Emily Watson)" value={googleDoctorName}
                onChange={(e) => setGoogleDoctorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 font-medium" />
              <input type="email" placeholder="Google Email" value={googleDoctorEmail}
                onChange={(e) => setGoogleDoctorEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 font-medium" />
              <button type="button" onClick={() => handleGoogleSignIn(googleDoctorName, googleDoctorEmail)}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer transition-colors">
                <Check size={13} />
                <span>Continue with Custom Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
