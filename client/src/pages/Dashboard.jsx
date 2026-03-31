import { useEffect, useState } from 'react';
import { 
  ShieldCheck, LogOut, Link as LinkIcon, Mail, Image as ImageIcon, 
  Activity, AlertTriangle, CheckCircle, Search, Menu, BookOpen, ServerCrash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState({ name: 'User' });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token) {
      navigate('/'); // Kick back to login if no token
    } else if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="relative h-screen w-full flex overflow-hidden bg-slate-950 font-sans text-slate-200">
      
      {/* --- ANIMATED BACKGROUND --- */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150"></div>
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      {/* --- SIDEBAR --- */}
      <div className="relative z-10 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-900/20">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">PhishGuard</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {/* Added onClick navigate to Dashboard here */}
          <button 
            onClick={() => navigate('/dashboard')} 
            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl font-medium border border-blue-500/20 transition-all"
          >
            <Activity size={20} /> Overview
          </button>
          <button 
            onClick={() => navigate('/url-scanner')}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 rounded-xl font-medium transition-all group"
          >
            <LinkIcon className="group-hover:text-blue-400 transition-colors" size={20} /> URL Scanner
          </button>
          <button 
            onClick={() => navigate('/text-scanner')}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 rounded-xl font-medium transition-all group"
          >
            <Mail className="group-hover:text-emerald-400 transition-colors" size={20} /> Text & Email Scanner
          </button>
          <button 
            onClick={() => navigate('/vision-scanner')}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 rounded-xl font-medium transition-all group"
          >
            <ImageIcon className="group-hover:text-purple-400 transition-colors" size={20} /> Vision Scanner
          </button>
          
          {/* NEW: Methodology Link */}
          {/* Changed border-slate-800/50 to border-slate-700 for better visibility */}
          <div className="pt-4 mt-4 border-t border-slate-700"> 
            <button 
              onClick={() => navigate('/methodology')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 rounded-xl font-medium transition-all group"
            >
              <BookOpen className="group-hover:text-amber-400 transition-colors" size={20} /> Our Methodology
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl font-medium transition-all"
          >
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-md">
          <div className="flex items-center gap-4 md:hidden">
             <Menu className="text-slate-400" />
             <span className="font-bold text-white">PhishGuard</span>
          </div>
          <h1 className="text-2xl font-bold text-white hidden md:block">
            Welcome back, {user.name ? user.name.split(' ')[0] : 'User'}
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Quick scan URL..." 
                className="bg-slate-950 border border-slate-800 text-sm text-white rounded-full py-2 pl-9 pr-4 focus:outline-none focus:border-blue-500 transition-colors w-64 placeholder:text-slate-600"
              />
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold border-2 border-slate-800">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          
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
          </div> {/* ADDED MISSING CLOSING DIV HERE */}

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
              {/* NLP TEXT REMOVED BELOW */}
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
        </main>
      </div>
    </div>
  );
}