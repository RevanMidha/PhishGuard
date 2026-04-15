import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Link as LinkIcon, Mail, Image as ImageIcon, ServerCrash, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalScans: null, threatsBlocked: null });
  const [engineStatus, setEngineStatus] = useState('checking');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/scan/stats');
        if (res.ok) {
          const data = await res.json();
          setStats({ totalScans: data.totalScans, threatsBlocked: data.threatsBlocked });
          setEngineStatus('online');
        } else {
          setEngineStatus('offline');
        }
      } catch (err) {
        setEngineStatus('offline');
      }
    };
    
    fetchStats();
    // Poll to keep dashboard live
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
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
        
        {/* URL Scanner Card */}
        <div 
          onClick={() => navigate('/url-scanner')}
          className="group bg-gradient-to-b from-slate-800/40 to-slate-900/40 border border-slate-700/50 p-6 rounded-2xl hover:border-blue-500/50 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
          <LinkIcon className="w-8 h-8 text-blue-400 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">URL Analysis</h3>
          <p className="text-sm text-slate-400 mb-6">AI-driven lexical and feature extraction to detect malicious links in real-time.</p>
          <button className="text-sm font-semibold text-blue-400 group-hover:text-blue-300 flex items-center gap-1">
            Launch Scanner &rarr;
          </button>
        </div>

        {/* NLP Scanner Card */}
        <div 
          onClick={() => navigate('/text-scanner')}
          className="group bg-gradient-to-b from-slate-800/40 to-slate-900/40 border border-slate-700/50 p-6 rounded-2xl hover:border-emerald-500/50 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
          <Mail className="w-8 h-8 text-emerald-400 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Text & Email</h3>
          <p className="text-sm text-slate-400 mb-6">Detect urgency, threat phrases, and social engineering attempts in text blocks.</p>
          <button className="text-sm font-semibold text-emerald-400 group-hover:text-emerald-300 flex items-center gap-1">
            Launch Scanner &rarr;
          </button>
        </div>

        {/* Vision Scanner Card */}
        <div 
          onClick={() => navigate('/vision-scanner')}
          className="group bg-gradient-to-b from-slate-800/40 to-slate-900/40 border border-slate-700/50 p-6 rounded-2xl hover:border-purple-500/50 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
          <ImageIcon className="w-8 h-8 text-purple-400 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Vision Scanner</h3>
          <p className="text-sm text-slate-400 mb-6">Upload screenshots to identify brand impersonation and fake login portals.</p>
          <button className="text-sm font-semibold text-purple-400 group-hover:text-purple-300 flex items-center gap-1">
            Launch Scanner &rarr;
          </button>
        </div>

      </div>
    </div>
  );
}