import { useState } from 'react';
import { User, ShieldCheck, Lock, Edit, Check, Save } from 'lucide-react';
import { getAuthUser, logoutUser, DEFAULT_CLINICIAN } from '../services/authService';

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(() => getAuthUser() || DEFAULT_CLINICIAN);
  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState(currentUser.role);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = () => {
    let cleanName = name.trim();
    if (!cleanName.toLowerCase().startsWith('dr.') && cleanName.toLowerCase() !== 'guest') {
      cleanName = `Dr. ${cleanName}`;
    }
    const updated = {
      ...currentUser,
      name: cleanName,
      role: role.trim() || 'Attending Clinician',
    };
    localStorage.setItem('clini_auth_user', JSON.stringify(updated));
    setCurrentUser(updated);
    setName(cleanName);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const getInitials = (n: string) => {
    const parts = n.replace(/^Dr\.\s*/i, '').trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0]?.[0]?.toUpperCase() || 'D';
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-deep-navy dark:text-slate-100">Doctor Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your clinician identity and workstation details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Summary */}
        <div className="card-surface p-8 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg mb-4 ring-4 ring-rose-50 dark:ring-rose-900/30">
            {getInitials(currentUser.name)}
          </div>
          <h2 className="text-xl font-display font-bold text-deep-navy dark:text-slate-100">{currentUser.name}</h2>
          <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 mb-2">{currentUser.role}</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 mb-8 border border-slate-200 dark:border-slate-700">
            <User size={14} /> {currentUser.id}
          </div>

          <div className="w-full flex items-center justify-around border-t border-slate-100 dark:border-slate-800 pt-6 mb-6">
            <div>
              <div className="font-bold text-deep-navy dark:text-slate-200">Active Session</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</div>
            </div>
            <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>
            <div>
              <div className="font-bold text-deep-navy dark:text-slate-200">Verified</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Credentials</div>
            </div>
          </div>

          <button
            onClick={() => { logoutUser(); window.location.href = '/login'; }}
            className="w-full py-2.5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl font-bold transition-all shadow-sm cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        {/* Right Column: Account Details */}
        <div className="lg:col-span-2 card-surface p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-display font-bold text-deep-navy dark:text-slate-100">Account Details</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Update your clinical title, name, and specialty</p>
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#0b5c92] hover:bg-blue-800 text-white rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              {savedMsg ? <Check size={16} /> : <Save size={16} />}
              {savedMsg ? 'Saved!' : 'Save Profile'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Edit size={14} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Periketi Raju"
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Role / Specialty</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <ShieldCheck size={14} />
                </div>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Skin Specialist / Thoracic Radiologist"
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">User Identifier</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={14} />
                </div>
                <input type="text" readOnly value={currentUser.id} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Department</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={14} />
                </div>
                <input type="text" readOnly value={currentUser.department} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 outline-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
