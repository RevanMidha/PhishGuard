import { useEffect, useState } from 'react';
import { 
  ShieldCheck, LogOut, Link as LinkIcon, Mail, Image as ImageIcon, 
  Activity, BookOpen, Menu, Search, BrainCircuit, Database, Lock
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Methodology() {
  const [user, setUser] = useState({ name: 'User' });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token) navigate('/');
    else if (storedUser) setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Helper to check which page is active for the sidebar styling
  const isActive = (path) => location.pathname === path;

  return (
    <div className="relative h-screen w-full flex overflow-hidden bg-slate-950 font-sans text-slate-200">
      
      {/* Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150"></div>
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      {/* Sidebar */}
      <div className="relative z-10 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-900/20">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">PhishGuard</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 rounded-xl font-medium transition-all group">
            <Activity className="group-hover:text-blue-400 transition-colors" size={20} /> Overview
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 rounded-xl font-medium transition-all group">
            <LinkIcon className="group-hover:text-blue-400 transition-colors" size={20} /> URL Scanner
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 rounded-xl font-medium transition-all group">
            <Mail className="group-hover:text-emerald-400 transition-colors" size={20} /> Text & Email Scanner
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 rounded-xl font-medium transition-all group">
            <ImageIcon className="group-hover:text-purple-400 transition-colors" size={20} /> Vision Scanner
          </button>
          
          <div className="pt-4 mt-4 border-t border-slate-700">
            <button onClick={() => navigate('/methodology')} className="w-full flex items-center gap-3 px-4 py-3 bg-amber-600/10 text-amber-400 rounded-xl font-medium border border-amber-500/20 transition-all">
              <BookOpen size={20} /> Our Methodology
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl font-medium transition-all">
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-md">
          <div className="flex items-center gap-4 md:hidden">
             <Menu className="text-slate-400" />
             <span className="font-bold text-white">PhishGuard</span>
          </div>
          <h1 className="text-2xl font-bold text-white hidden md:block">
            System Methodology
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold border-2 border-slate-800">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Intro Section */}
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-slate-400">
                How PhishGuard Protects You
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                Modern phishing attacks easily bypass traditional blocklists. We engineered a tri-modal Machine Learning architecture to analyze threats exactly like a human security analyst would—but in milliseconds.
              </p>
            </div>

            {/* URL Module */}
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm relative overflow-hidden group hover:border-blue-500/30 transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 shrink-0">
                  <LinkIcon size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">1. Lexical URL Analysis</h3>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    Attackers hide malicious intents in the structure of web addresses. Our model doesn't just check a database; it extracts lexical features mathematically.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> <b>Feature Extraction:</b> Analyzes URL length, entropy, and special character density.</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> <b>Heuristics:</b> Detects IP-based domains and deeply nested subdomains used to spoof legitimate brands.</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> <b>Homoglyph Detection:</b> Identifies Cyrillic or similar-looking characters used to fake domains (e.g., g00gle.com).</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Text Module */}
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/30 transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0">
                  <BrainCircuit size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">2. Natural Language Processing (Text)</h3>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    Phishing relies heavily on social engineering. By utilizing NLP, PhishGuard understands the context and emotional manipulation present in an email or text message.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> <b>Urgency Detection:</b> Flags artificial time constraints ("Account suspended in 24 hours").</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> <b>Financial Intent:</b> Highlights unauthorized requests for credentials, wire transfers, or crypto.</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> <b>Semantic Analysis:</b> Looks beyond keywords to understand the actual intent of the message structure.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Vision Module */}
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/30 transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors"></div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 shrink-0">
                  <ImageIcon size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">3. Computer Vision Authentication</h3>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    Zero-day phishing sites often use legitimate code to trick URL scanners. Our vision model bypasses the code entirely, looking at the visual rendering of the page itself.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div> <b>Brand Impersonation:</b> Matches site logos and layouts against a verified trusted-brand database.</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div> <b>Input Field Detection:</b> Identifies credential-harvesting login boxes mapped to unusual domains.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Trust Footer */}
            <div className="mt-12 p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center justify-center gap-3 text-amber-400/80">
              <Lock size={18} />
              <p className="text-sm font-medium">Your data is processed securely and is never stored permanently during analysis.</p>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}