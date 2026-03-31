import { useState, useEffect } from 'react';
import { 
  ShieldCheck, LogOut, Link as LinkIcon, Mail, Image as ImageIcon, 
  Activity, BookOpen, Menu, Search, AlertOctagon, CheckCircle2, Loader2, ArrowRight, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TextScanner() {
  const [user, setUser] = useState({ name: 'User' });
  const [text, setText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/');
    else setUser(JSON.parse(localStorage.getItem('user')) || { name: 'User' });
  }, [navigate]);

  const handleScan = (e) => {
    e.preventDefault();
    if (!text) return;
    setIsScanning(true);
    setResult(null);

    // Fake API call for UI testing
    setTimeout(() => {
      setIsScanning(false);
      setResult(Math.random() > 0.5 ? 'safe' : 'malicious');
    }, 2000);
  };

  return (
    <div className="relative h-screen w-full flex overflow-hidden bg-slate-950 font-sans text-slate-200">
      {/* Background (Same as URL Scanner) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full mix-blend-screen filter blur-[100px]"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-600/10 rounded-full mix-blend-screen filter blur-[100px]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden w-full max-w-4xl mx-auto">
        <header className="h-20 flex items-center justify-between px-8 border-b border-slate-800/50 bg-slate-900/30">
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white flex items-center gap-2">
            <ArrowRight className="rotate-180" size={20} /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-white">Linguistic Analysis</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center">
          <div className="w-full space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-full mb-4 text-emerald-400">
                <Mail size={40} />
              </div>
              <h2 className="text-3xl font-extrabold text-white">Analyze Email & Text</h2>
              <p className="text-slate-400 text-lg">Paste an email, SMS, or message. Our Natural Language Processing AI will scan for urgency triggers and social engineering tactics.</p>
            </div>

            <form onSubmit={handleScan} className="relative group flex flex-col gap-4">
              <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl shadow-emerald-900/20">
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste the suspicious message here..." 
                  className="w-full bg-transparent border-none text-lg text-white p-2 focus:outline-none placeholder:text-slate-600 resize-none h-48"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isScanning || !text}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 w-full md:w-auto self-end"
              >
                {isScanning ? <><Loader2 className="animate-spin" size={20} /> Analyzing Text...</> : <>Scan Content <Search size={20} /></>}
              </button>
            </form>

            {/* Results Area */}
            {result && !isScanning && (
              <div className={`p-6 rounded-2xl border backdrop-blur-sm ${result === 'safe' ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-red-950/30 border-red-500/50'}`}>
                <div className="flex items-center gap-4">
                  {result === 'safe' ? <CheckCircle2 className="text-emerald-400" size={32} /> : <AlertOctagon className="text-red-400" size={32} />}
                  <h3 className={`text-xl font-bold ${result === 'safe' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result === 'safe' ? 'No Social Engineering Detected' : 'High Risk: Phishing Language Detected!'}
                  </h3>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}