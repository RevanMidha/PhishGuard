import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Link as LinkIcon, Mail, Image as ImageIcon, ServerCrash, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getJson } from '../lib/api';

const MODULES = [
  {
    title: 'URL Analysis',
    description: 'Lexical signals, suspicious tokens, brand mismatches, and safe-domain fallback handling.',
    path: '/url-scanner',
    icon: LinkIcon,
    accent: 'amber',
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
    accent: 'rose',
  },
];

const ACCENT_CLASSES = {
  amber: {
    badge: 'text-amber-200 group-hover:text-amber-100 border-amber-300/50 bg-amber-300/10',
    glow: 'bg-amber-300/10',
  },
  emerald: {
    badge: 'text-emerald-400 group-hover:text-emerald-300 border-emerald-500/50 bg-emerald-500/5',
    glow: 'bg-emerald-500/10',
  },
  rose: {
    badge: 'text-rose-200 group-hover:text-rose-100 border-rose-300/50 bg-rose-300/10',
    glow: 'bg-rose-300/10',
  },
};

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

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-6 rounded-3xl border border-stone-800 bg-stone-900/40 p-5 backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Control Center</p>
            <h2 className="text-3xl font-bold text-white">Everything important at a glance</h2>
            <p className="max-w-2xl text-stone-400">
              PhishGuard now keeps the scanners aligned across URL, text, and screenshot workflows and pauses dashboard polling when the tab is hidden.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-950/60 px-3.5 py-2.5 text-sm text-stone-400">
            Last refresh: <span className="font-medium text-stone-200">{lastUpdated ? lastUpdated.toLocaleTimeString() : 'Waiting for first response'}</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-stone-900/40 border border-stone-800 p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-300/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-amber-300/15 rounded-xl text-amber-200">
              <Activity size={24} />
            </div>
            {engineStatus === 'online' && <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-1 rounded-full animate-pulse flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Live</span>}
          </div>
          <h3 className="text-stone-400 text-sm font-medium relative z-10">Total Scans</h3>
          <p className="text-3xl font-bold text-white mt-1 relative z-10">
            {stats.totalScans !== null ? stats.totalScans.toLocaleString() : '...'}
          </p>
        </div>

        <div className="bg-stone-900/40 border border-stone-800 p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
              <AlertTriangle size={24} />
            </div>
          </div>
          <h3 className="text-stone-400 text-sm font-medium relative z-10">Threats Detected</h3>
          <p className="text-3xl font-bold text-white mt-1 relative z-10">
            {stats.threatsBlocked !== null ? stats.threatsBlocked.toLocaleString() : '...'}
          </p>
        </div>

        {/* System Status */}
        <div className="bg-stone-900/40 border border-stone-800 p-5 rounded-2xl backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl transition-colors ${engineStatus === 'online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-400/10 text-orange-300'}`}>
              {engineStatus === 'online' ? <ShieldCheck size={24} /> : <ServerCrash size={24} />}
            </div>
          </div>
          <h3 className="text-stone-400 text-sm font-medium">System Status</h3>
          <p className={`text-xl font-bold mt-2 flex items-center gap-2 transition-colors ${engineStatus === 'online' ? 'text-emerald-500' : 'text-orange-300'}`}>
            <span className={`w-2.5 h-2.5 rounded-full transition-colors ${engineStatus === 'online' ? 'bg-emerald-500 animate-[pulse_2s_infinite]' : 'bg-orange-300'}`}></span> 
            {engineStatus === 'online' ? 'Engine Online' : engineStatus === 'checking' ? 'Connecting...' : 'Engine Offline'}
          </p>
        </div>
      </div>

      {/* Scanners Section */}
      <h2 className="text-xl font-bold text-white mb-4">Active Modules</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {MODULES.map((module) => {
          const Icon = module.icon;
          const accent = ACCENT_CLASSES[module.accent];
          return (
            <div
              key={module.path}
              onClick={() => navigate(module.path)}
              className="group bg-gradient-to-b from-stone-800/40 to-stone-900/40 border border-stone-700/50 p-5 rounded-2xl hover:border-stone-600 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 h-32 w-32 rounded-full blur-2xl transition-colors ${accent.glow}`}></div>
              <div className={`inline-flex rounded-2xl border p-3 ${accent.badge}`}>
                <Icon className="w-7 h-7" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-white mb-2">{module.title}</h3>
              <p className="text-sm text-stone-400 mb-6">{module.description}</p>
              <button className={`text-sm font-semibold flex items-center gap-2 ${accent.badge.split(' ').slice(0, 2).join(' ')}`}>
                Launch scanner <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
