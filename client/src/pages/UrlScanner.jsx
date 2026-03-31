import { useState, useEffect } from 'react';
import { 
  ShieldCheck, LogOut, Link as LinkIcon, Mail, Image as ImageIcon, 
  Activity, BookOpen, Menu, Search, AlertOctagon, CheckCircle2, Loader2, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UrlScanner() {
  const [user, setUser] = useState({ name: 'User' });
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null); // 'safe', 'malicious', or null
  
  const navigate = useNavigate();

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

  const handleScan = (e) => {
    e.preventDefault();
    if (!url) return;

    setIsScanning(true);
    setResult(null);

    // FAKE API CALL (We will connect this to your Python ML backend later!)
    setTimeout(() => {
      setIsScanning(false);
      // Randomly choose safe or malicious for testing the UI
      setResult(Math.random() > 0.5 ? 'safe' : 'malicious');
    }, 2000);
  };

  return (
    <div className="relative h-screen w-full flex overflow-hidden bg-slate-950 font-sans text-slate-200">
      
      {/* Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150"></div>
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      {/* Sidebar (Updated to match Dashboard) */}
      <div className="relative z-10 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-900/20">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">PhishGuard</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 rounded-xl font-medium transition-all group"
          >
            <Activity className="group-hover:text-blue-400 transition-colors" size={20} /> Overview
          </button>
          
          {/* Active State for URL Scanner */}
          <button 
            onClick={() => navigate('/url-scanner')} 
            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl font-medium border border-blue-500/20 transition-all"
          >
            <LinkIcon size={20} /> URL Scanner
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

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-md">
          <div className="flex items-center gap-4 md:hidden">
             <Menu className="text-slate-400" />
             <span className="font-bold text-white">PhishGuard</span>
          </div>
          <h1 className="text-2xl font-bold text-white hidden md:block">
            Lexical URL Analysis
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold border-2 border-slate-800">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center">
          
          <div className="w-full max-w-3xl space-y-8">
            
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-full mb-4 text-blue-400">
                <LinkIcon size={40} />
              </div>
              <h2 className="text-3xl font-extrabold text-white">Is this link safe?</h2>
              <p className="text-slate-400 text-lg">Paste a URL below. Our AI engine will extract lexical features to determine if it is a phishing threat.</p>
            </div>

            {/* Scan Input Box */}
            <form onSubmit={handleScan} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl shadow-blue-900/20">
                <Search className="w-6 h-6 text-slate-500 ml-4" />
                <input 
                  type="url" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/login" 
                  className="flex-1 bg-transparent border-none text-lg text-white px-4 py-4 focus:outline-none placeholder:text-slate-600"
                  required
                />
                <button 
                  type="submit"
                  disabled={isScanning || !url}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2"
                >
                  {isScanning ? (
                    <><Loader2 className="animate-spin" size={20} /> Analyzing...</>
                  ) : (
                    <>Scan URL <ArrowRight size={20} /></>
                  )}
                </button>
              </div>
            </form>

            {/* Results Area */}
            {result && !isScanning && (
              <div className={`mt-8 p-8 rounded-2xl border backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 ${
                result === 'safe' 
                  ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-900/20' 
                  : 'bg-red-950/30 border-red-500/50 shadow-lg shadow-red-900/20'
              }`}>
                <div className="flex items-start gap-6">
                  <div className={`p-4 rounded-full ${result === 'safe' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {result === 'safe' ? <CheckCircle2 size={40} /> : <AlertOctagon size={40} />}
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold mb-2 ${result === 'safe' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {result === 'safe' ? 'No Threats Detected' : 'Malicious Phishing Link Detected!'}
                    </h3>
                    <p className="text-slate-300 text-lg mb-4">
                      {result === 'safe' 
                        ? 'Our AI engine analyzed the lexical structure and found no anomalies. This link appears safe to visit.' 
                        : 'Warning! This URL exhibits high-risk lexical features commonly used in credential harvesting and social engineering.'}
                    </p>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 break-all font-mono text-sm text-slate-400">
                      Target: {url}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}