import { useState } from 'react';
import { Mail, Search, AlertOctagon, CheckCircle2, Loader2, Flag } from 'lucide-react';

export default function TextScanner() {
  const [text, setText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!text) return;
    setIsScanning(true);
    setResult(null);
    setFeedbackSubmitted(false);

    try {
      const response = await fetch('http://localhost:5000/api/scan/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) throw new Error('Scan failed');
      const data = await response.json();
      setResult(data.result); // Returns 'safe' or 'malicious'
    } catch (error) {
      console.error("Scan Error:", error);
      setResult('malicious');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center">
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
          <div className="mt-4 animate-in fade-in slide-in-from-bottom-4">
            <div className={`relative p-6 rounded-2xl border backdrop-blur-sm ${result === 'safe' ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-900/20' : 'bg-red-950/30 border-red-500/50 shadow-lg shadow-red-900/20'}`}>
              
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
                            scanType: 'text',
                            originalInput: text,
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

              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mt-8 md:mt-0">
                <div className={`p-3 rounded-full ${result === 'safe' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                   {result === 'safe' ? <CheckCircle2 size={24} /> : <AlertOctagon size={24} />}
                </div>
                <div className="text-center md:text-left">
                  <h3 className={`text-xl font-bold ${result === 'safe' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result === 'safe' ? 'No Social Engineering Detected' : 'High Risk: Phishing Language Detected!'}
                  </h3>
                  <p className="text-slate-300 text-sm mt-1 mb-2 w-full md:w-10/12">
                     {result === 'safe' ? 'This message does not exhibit psychological pressure or common scam terminology.' : 'This text relies heavily on urgency tactics typical to phishing attacks.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}