import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ScanLine, 
  FileSearch, 
  FileText, 
  History, 
  Eye,
  Box, 
  Settings, 
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  User
} from 'lucide-react';
import clsx from 'clsx';
import { getAuthUser, logoutUser, DEFAULT_CLINICIAN } from '../services/authService';

interface AppShellProps {
  children: React.ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ScanLine, label: 'New Analysis', path: '/new-analysis' },
  { icon: FileSearch, label: 'Results', path: '/results' },
  { icon: FileText, label: 'Clinical Report', path: '/report' },
  { icon: History, label: 'History', path: '/history' },
  { icon: Eye, label: 'Explainability', path: '/explainability' },
  { icon: Box, label: 'Model', path: '/model' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const currentUser = getAuthUser() || DEFAULT_CLINICIAN;

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('app_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  // Apply persisted theme (default dark) and density on startup
  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    }

    const savedDensity = localStorage.getItem('app_density');
    if (savedDensity === 'Compact') {
      document.body.classList.add('density-compact');
    } else {
      document.body.classList.remove('density-compact');
    }
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('app_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans relative print:block print:h-auto print:overflow-visible bg-gradient-to-br from-[#dce5ed] via-[#f0f4f8] to-[#d0deea] dark:from-[#080d1a] dark:via-[#0b1222] dark:to-[#080b14] bg-fixed text-slate-800 dark:text-slate-100">
      {/* Global Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-100/50 dark:bg-teal-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/40 dark:bg-blue-900/20 rounded-full blur-[120px]"></div>
      </div>
      
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800 flex flex-col h-full shrink-0 relative z-10">
        <div className="p-4 sm:p-5 flex items-center gap-3 border-b border-slate-200/50 dark:border-slate-800/80">
          <img 
            src="/logo.png" 
            alt="CliniFusionX Logo" 
            className="w-12 h-12 object-contain shrink-0 drop-shadow-md rounded-2xl p-1 bg-white/70 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/60" 
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-bold text-base tracking-tight text-deep-navy dark:text-white truncate">CliniFusionX</h1>
            <p className="text-[10px] uppercase tracking-wider text-[#0277b6] dark:text-sky-400 font-bold">Medical Insights</p>
          </div>
        </div>

        <div className="px-4 pb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-4">
          Workspace
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
              
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center justify-between px-3 py-2.5 rounded-full text-sm font-medium transition-all duration-200 mb-1",
                  isActive 
                    ? "bg-[#0277b6] text-white shadow-md shadow-blue-900/20" 
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={clsx("shrink-0", isActive ? "text-white" : "text-slate-400 dark:text-slate-500")} />
                  {item.label}
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white mr-1 shadow-sm"></div>}
              </NavLink>
            );
          })}
        </nav>

        {/* Clinician Card in Sidebar */}
        <div 
          onClick={() => navigate('/profile')}
          className="p-3.5 m-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group"
          title="Click to view Doctor Profile"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {currentUser.name.charAt(0) || 'D'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-deep-navy dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentUser.role}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleLogout(); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative print:block print:h-auto print:overflow-visible">
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-transparent shrink-0 border-b border-slate-200/50 dark:border-slate-800/80">
          <div className="flex items-center">
             {/* Page title placeholder */}
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick Dark/Light Mode Switch Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
              title="Toggle theme"
              aria-label="Toggle visual theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={15} className="text-amber-400" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Moon size={15} className="text-blue-600" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
            
            <NavLink 
              to="/settings" 
              className="hidden sm:flex items-center gap-2 bg-emerald-100/60 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-200 dark:border-emerald-800/70 hover:bg-emerald-200/60 transition-colors"
              title="Click to view API and model settings"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Swin-T 224 Ready
            </NavLink>
            <NavLink to="/settings" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" title="Settings">
              <Settings size={18} />
            </NavLink>

            {/* Clinician User Popover Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-full bg-white/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
                title="Clinician session"
              >
                <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentUser.name.charAt(0) || 'D'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-deep-navy dark:text-slate-100 leading-tight truncate max-w-[130px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium leading-tight truncate max-w-[130px]">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                    <div className="font-bold text-sm text-deep-navy dark:text-slate-100">{currentUser.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{currentUser.role}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">{currentUser.department}</div>
                  </div>

                  <button
                    onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer mb-1"
                  >
                    <User size={15} className="text-blue-500" />
                    <span>View & Edit Doctor Profile</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Sign Out & Lock Workstation</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
