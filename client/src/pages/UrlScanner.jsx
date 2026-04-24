import { useState } from 'react';
import { Link as LinkIcon, Search, AlertOctagon, CheckCircle2, Loader2, ArrowRight, Flag, ShieldAlert } from 'lucide-react';
import { postJson, submitFeedback } from '../lib/api';

const RESULT_STYLES = {
  safe: {
    card: 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-900/20',
    iconWrap: 'bg-emerald-500/20 text-emerald-400',
    title: 'text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
    headline: 'Link Looks Safe',
    Icon: CheckCircle2
  },
  suspicious: {
    card: 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-900/20',
    iconWrap: 'bg-amber-500/20 text-amber-300',
    title: 'text-amber-300',
    badge: 'bg-amber-500/10 text-amber-200 border border-amber-500/20',
    headline: 'Link Needs Review',
    Icon: ShieldAlert
  },
  malicious: {
    card: 'bg-red-950/30 border-red-500/50 shadow-lg shadow-red-900/20',
    iconWrap: 'bg-red-500/20 text-red-400',
    title: 'text-red-400',
    badge: 'bg-red-500/10 text-red-200 border border-red-500/20',
    headline: 'Malicious Phishing Link Detected',
    Icon: AlertOctagon
  },
  error: {
    card: 'bg-slate-900/60 border-slate-700 shadow-lg shadow-slate-950/40',
    iconWrap: 'bg-slate-700 text-slate-200',
    title: 'text-slate-100',
    badge: 'bg-slate-800 text-slate-300 border border-slate-700',
    headline: 'Scan Failed',
    Icon: AlertOctagon
  }
};

export default function UrlScanner() {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scan, setScan] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url) return;

    setIsScanning(true);
    setScan(null);
    setFeedbackSubmitted(false);

    try {
      setScan(await postJson('/api/scan/url', { url }));
    } catch (error) {
      console.error('Scan Error:', error);
      setScan({
        result: 'error',
        url,
        canonical_url: url,
        confidence_score: 0,
        threshold_used: 0,
        summary: error.message || 'The URL scan could not be completed.'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const tone = RESULT_STYLES[scan?.result || 'safe'];
  const ResultIcon = tone.Icon;
  const confidence = Math.round((scan?.confidence_score || 0) * 100);
  const threshold = Math.round((scan?.threshold_used || 0) * 100);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-full mb-4 text-blue-400">
            <LinkIcon size={40} />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Is this link safe?</h2>
          <p className="text-slate-400 text-lg">
            Paste a URL below. The engine checks lexical features, suspicious brand lookalikes, and heuristic fallback rules when the model is uncertain.
          </p>
        </div>

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
              {isScanning ? <><Loader2 className="animate-spin" size={20} /> Analyzing...</> : <>Scan URL <ArrowRight size={20} /></>}
            </button>
          </div>
        </form>

        {scan && !isScanning && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
            <div className={`relative p-6 md:p-8 rounded-2xl border backdrop-blur-sm ${tone.card}`}>
              <div className="absolute top-4 right-4 z-10">
                {!feedbackSubmitted && scan.result !== 'error' ? (
                  <button
                    onClick={async () => {
                      setFeedbackSubmitted(true);
                      try {
                        await submitFeedback({
                          scanType: 'url',
                          originalInput: url,
                          predictedResult: scan.result,
                          reportedAs: scan.result === 'safe' ? 'False Negative' : 'False Positive'
                        });
                      } catch (feedbackError) {
                        console.error(feedbackError);
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-1.5 transition-all"
                  >
                    <Flag size={12} />
                    Report False {scan.result === 'safe' ? 'Negative' : 'Positive'}
                  </button>
                ) : feedbackSubmitted ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-lg px-3 py-1.5">
                    <CheckCircle2 size={12} /> Flagged for review
                  </span>
                ) : null}
              </div>

              <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 mt-6 md:mt-0">
                <div className={`p-4 rounded-full inline-flex ${tone.iconWrap}`}>
                  <ResultIcon size={32} />
                </div>
                <div className="w-full space-y-4">
                  <div>
                    <h3 className={`text-xl md:text-2xl font-bold mb-2 ${tone.title}`}>{tone.headline}</h3>
                    <p className="text-slate-300 text-sm md:text-base w-full md:w-11/12">
                      {scan.summary || (
                        scan.result === 'safe'
                          ? 'The scanned domain stayed below the phishing threshold and did not trigger the heuristic risk floor.'
                          : 'This URL crossed the phishing threshold based on lexical structure or fallback heuristic rules.'
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className={`px-3 py-2 rounded-lg text-sm ${tone.badge}`}>
                      Risk confidence: <span className="font-semibold">{confidence}%</span>
                    </div>
                    <div className="px-3 py-2 rounded-lg text-sm bg-slate-900/70 border border-slate-700 text-slate-300">
                      Detection threshold: <span className="font-semibold">{threshold}%</span>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 break-all">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Submitted URL</p>
                      <p className="font-mono text-xs md:text-sm text-slate-300">{scan.url || url}</p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 break-all">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Canonical form</p>
                      <p className="font-mono text-xs md:text-sm text-slate-300">{scan.canonical_url || url}</p>
                    </div>
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
