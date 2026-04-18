import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Link as LinkIcon, Mail, Image as ImageIcon, ServerCrash, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getJson } from '../lib/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalScans: null, threatsBlocked: null });
  const [engineStatus, setEngineStatus] = useState('checking');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getJson('/api/scan/stats');
        setStats({ totalScans: data.totalScans, threatsBlocked: data.threatsBlocked });
        setEngineStatus('online');
        setLastUpdated(new Date());
      } catch {
        setEngineStatus('offline');
      }
    };

    let intervalId;

    const startPolling = () => {
      fetchStats();
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchStats();
        }
      }, 20000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStats();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const modules = [
    {
      title: 'URL Analysis',
      description: 'Lexical signals, suspicious tokens, brand mismatches, and safe-domain fallback handling.',
      path: '/url-scanner',
      icon: LinkIcon,
      accent: 'blue',
    },
    {
      title: 'Text & Email',
      description: 'Hybrid NLP + heuristics to reduce false positives on normal messages while catching pressure tactics.',
      path: '/text-scanner',
      icon: Mail,
      accent: 'emerald',
    },
    {
      title: 'Vision Scanner',
      description: 'OCR text, form cues, brand/domain checks, plus direct screenshot paste support.',
      path: '/vision-scanner',
      icon: ImageIcon,
      accent: 'sky',
    },
  ];

  const accentClasses = {
    blue: 'text-blue-400 group-hover:text-blue-300 border-blue-500/50 bg-blue-500/5',
    emerald: 'text-emerald-400 group-hover:text-emerald-300 border-emerald-500/50 bg-emerald-500/5',
    sky: 'text-sky-300 group-hover:text-sky-200 border-sky-400/50 bg-sky-500/5',
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Control Center</p>
            <h2 className="text-3xl font-bold text-white">Everything important at a glance</h2>
            <p className="max-w-2xl text-slate-400">
              PhishGuard now keeps the scanners aligned across URL, text, and screenshot workflows and pauses dashboard polling when the tab is hidden.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-400">
            Last refresh: <span className="font-medium text-slate-200">{lastUpdated ? lastUpdated.toLocaleTimeString() : 'Waiting for first response'}</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <Activity size={24} />
            </div>
            {engineStatus === 'online' && <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-1 rounded-full animate-pulse flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Live</span>}
          </div>
          <h3 className="text-slate-400 text-sm font-medium relative z-10">Total Scans</h3>
          <p className="text-3xl font-bold text-white mt-1 relative z-10">
            {stats.totalScans !== null ? stats.totalScans.toLocaleString() : '...'}
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
              <AlertTriangle size={24} />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium relative z-10">Threats Detected</h3>
          <p className="text-3xl font-bold text-white mt-1 relative z-10">
            {stats.threatsBlocked !== null ? stats.threatsBlocked.toLocaleString() : '...'}
          </p>
        </div>

        {/* System Status */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl transition-colors ${engineStatus === 'online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
              {engineStatus === 'online' ? <ShieldCheck size={24} /> : <ServerCrash size={24} />}
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium">System Status</h3>
          <p className={`text-xl font-bold mt-2 flex items-center gap-2 transition-colors ${engineStatus === 'online' ? 'text-emerald-500' : 'text-amber-500'}`}>
            <span className={`w-2.5 h-2.5 rounded-full transition-colors ${engineStatus === 'online' ? 'bg-emerald-500 animate-[pulse_2s_infinite]' : 'bg-amber-600'}`}></span> 
            {engineStatus === 'online' ? 'Engine Online' : engineStatus === 'checking' ? 'Connecting...' : 'Engine Offline'}
          </p>
        </div>
      </div>

      {/* Scanners Section */}
      <h2 className="text-xl font-bold text-white mb-6">Active Modules</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          const accent = accentClasses[module.accent];
          return (
            <div
              key={module.path}
              onClick={() => navigate(module.path)}
              className="group bg-gradient-to-b from-slate-800/40 to-slate-900/40 border border-slate-700/50 p-6 rounded-2xl hover:border-slate-600 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 h-32 w-32 rounded-full blur-2xl transition-colors ${accent.split(' ').slice(3).join(' ')}`}></div>
              <div className={`inline-flex rounded-2xl border p-3 ${accent}`}>
                <Icon className="w-7 h-7" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-white mb-2">{module.title}</h3>
              <p className="text-sm text-slate-400 mb-6">{module.description}</p>
              <button className={`text-sm font-semibold flex items-center gap-2 ${accent.split(' ').slice(0, 2).join(' ')}`}>
                Launch scanner <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
