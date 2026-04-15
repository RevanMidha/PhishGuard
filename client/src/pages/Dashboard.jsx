import { Activity, AlertTriangle, Link as LinkIcon, Mail, Image as ImageIcon, ServerCrash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full flex flex-col">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <Activity size={24} />
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-800/50 px-2 py-1 rounded-full">Awaiting Scans</span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium">Total Scans</h3>
          <p className="text-3xl font-bold text-white mt-1">0</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
              <AlertTriangle size={24} />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium">Threats Blocked</h3>
          <p className="text-3xl font-bold text-white mt-1">0</p>
        </div>

        {/* System Status (UPDATED TO OFFLINE) */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
              <ServerCrash size={24} />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium">System Status</h3>
          <p className="text-xl font-bold text-amber-500 mt-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> Engine Offline
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