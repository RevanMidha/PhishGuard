import { useState } from 'react';
import { Link as LinkIcon, Search, AlertOctagon, CheckCircle2, Loader2, ArrowRight, Flag } from 'lucide-react';

export default function UrlScanner() {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null); // 'safe', 'malicious', or null
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  const handleScan = async (e) => {
    e.preventDefault();
    if (!url) return;

    setIsScanning(true);
    setResult(null);
    setFeedbackSubmitted(false);

    try {
      const response = await fetch('http://localhost:5000/api/scan/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) throw new Error('Scan failed');
      const data = await response.json();
      setResult(data.result); // Returns 'safe' or 'malicious'
    } catch (error) {
      console.error("Scan Error:", error);
      setResult('malicious'); // Fallback to safe UI or error UI, we'll mark malicious on failure for now to alert users.
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
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
              className="flex-1 w-full bg-transparent border-none text-lg text-white px-4 py-4 focus:outline-none placeholder:text-slate-600"
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
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
            <div className={`relative p-6 md:p-8 rounded-2xl border backdrop-blur-sm ${
              result === 'safe' 
                ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-900/20' 
                : 'bg-red-950/30 border-red-500/50 shadow-lg shadow-red-900/20'
            }`}>
              
              {/* Feedback Section - Embedded inside card at top right */}
              <div className="absolute top-4 right-4 z-10">
                {!feedbackSubmitted ? (
                  <button 
                    onClick={async () => {
                      setFeedbackSubmitted(true);
                      try {
                        await fetch('http://localhost:5000/api/feedback', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            scanType: 'url',
                            originalInput: url,
                            predictedResult: result,
                            reportedAs: result === 'safe' ? 'False Negative' : 'False Positive'
                          })
                        });
                      } catch (e) { console.error(e); }
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-1.5 transition-all"
                  >
                    <Flag size={12} />
                    Report False {result === 'safe' ? 'Negative' : 'Positive'}
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-lg px-3 py-1.5">
                    <CheckCircle2 size={12} /> Flagged for review
                  </span>
                )}
              </div>

              <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 mt-6 md:mt-0">
                <div className={`p-4 rounded-full inline-flex ${result === 'safe' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {result === 'safe' ? <CheckCircle2 size={32} /> : <AlertOctagon size={32} />}
                </div>
                <div>
                  <h3 className={`text-xl md:text-2xl font-bold mb-2 ${result === 'safe' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result === 'safe' ? 'No Threats Detected' : 'Malicious Phishing Link Detected!'}
                  </h3>
                  <p className="text-slate-300 text-sm md:text-base mb-4 w-full md:w-11/12">
                    {result === 'safe' 
                      ? 'Our AI engine analyzed the lexical structure and found no anomalies. This link appears safe to visit.' 
                      : 'Warning! This URL exhibits high-risk lexical features commonly used in credential harvesting and social engineering.'}
                  </p>
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 break-all font-mono text-xs md:text-sm text-slate-400">
                    Target: {url}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}