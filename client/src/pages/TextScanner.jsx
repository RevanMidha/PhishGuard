import { useState } from 'react';
import { Mail, Search, Loader2, Flag, CheckCircle2 } from 'lucide-react';
import { postJson, submitFeedback } from '../lib/api';
import { createResultStyles, getPercent } from '../lib/scanUi';

const RESULT_STYLES = createResultStyles({
  safe: 'Looks Safe',
  suspicious: 'Needs Manual Review',
  malicious: 'High Risk Phishing Signals',
  error: 'Scan Failed',
});

export default function TextScanner() {
  const [text, setText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scan, setScan] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!text) return;

    setIsScanning(true);
    setScan(null);
    setFeedbackSubmitted(false);

    try {
      setScan(await postJson('/api/scan/text', { text }));
    } catch (error) {
      console.error('Scan Error:', error);
      setScan({
        result: 'error',
        summary: error.message || 'The scan could not be completed.',
        indicators: [],
        confidence_score: 0,
        risk_score: 0
      });
    } finally {
      setIsScanning(false);
    }
  };

  const tone = RESULT_STYLES[scan?.result || 'safe'];
  const ResultIcon = tone.Icon;
  const confidence = getPercent(scan?.confidence_score);
  const risk = getPercent(scan?.risk_score);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center">
      <div className="w-full space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-amber-400/15 rounded-full mb-3 text-amber-200">
            <Mail size={34} />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Analyze Email & Text</h2>
          <p className="text-stone-400">
            Paste an email, SMS, or message. PhishGuard now blends NLP with phishing-specific safety heuristics so normal conversation is less likely to get mislabeled.
          </p>
        </div>

        <form onSubmit={handleScan} className="flex flex-col gap-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-300/60 via-orange-300/45 to-rose-300/60 rounded-2xl blur-sm opacity-60 group-hover:opacity-90 transition duration-500"></div>
            <div className="relative bg-neutral-900 border border-orange-200/25 rounded-2xl p-3 shadow-xl shadow-orange-900/20">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the message here..."
                className="w-full bg-transparent border-none text-base text-white p-2 focus:outline-none placeholder:text-stone-600 resize-none h-44"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isScanning || !text}
            className="bg-orange-300 hover:bg-orange-200 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 w-full md:w-auto self-end"
          >
            {isScanning ? <><Loader2 className="animate-spin" size={20} /> Analyzing Text...</> : <>Scan Content <Search size={20} /></>}
          </button>
        </form>

        {scan && !isScanning && (
          <div className="mt-4 animate-in fade-in slide-in-from-bottom-4">
            <div className={`relative p-5 rounded-2xl border backdrop-blur-sm ${tone.card}`}>
              <div className="absolute top-4 right-4 z-10">
                {!feedbackSubmitted && scan.result !== 'error' ? (
                  <button
                    onClick={async () => {
                      setFeedbackSubmitted(true);
                      try {
                        await submitFeedback({
                          scanType: 'text',
                          originalInput: text,
                          predictedResult: scan.result,
                          reportedAs: scan.result === 'safe' ? 'False Negative' : 'False Positive'
                        });
                      } catch (feedbackError) {
                        console.error(feedbackError);
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-white bg-stone-900/60 hover:bg-stone-800 border border-stone-700/50 rounded-lg px-3 py-1.5 transition-all"
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

              <div className="flex flex-col md:flex-row items-start gap-4 mt-8 md:mt-0">
                <div className={`p-3 rounded-full ${tone.iconWrap}`}>
                  <ResultIcon size={24} />
                </div>
                <div className="w-full space-y-4">
                  <div>
                    <h3 className={`text-xl font-bold ${tone.title}`}>{tone.headline}</h3>
                    <p className="text-stone-300 text-sm mt-1 w-full md:w-10/12">{scan.summary}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className={`px-3 py-2 rounded-lg text-sm ${tone.badge}`}>
                      Risk score: <span className="font-semibold">{risk}%</span>
                    </div>
                    <div className="px-3 py-2 rounded-lg text-sm bg-stone-900/70 border border-stone-700 text-stone-300">
                      Verdict confidence: <span className="font-semibold">{confidence}%</span>
                    </div>
                    {typeof scan.model_score === 'number' && (
                      <div className="px-3 py-2 rounded-lg text-sm bg-stone-900/70 border border-stone-700 text-stone-300">
                        Model signal: <span className="font-semibold">{Math.round(scan.model_score * 100)}%</span>
                      </div>
                    )}
                  </div>

                  {scan.indicators?.length > 0 && (
                    <div className="grid gap-3">
                      {scan.indicators.map((indicator, index) => (
                        <div key={`${indicator.label}-${index}`} className="rounded-xl border border-stone-800 bg-stone-950/50 px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-white">{indicator.label}</p>
                            <span className="text-[11px] uppercase tracking-[0.2em] text-stone-500">{indicator.severity}</span>
                          </div>
                          <p className="text-sm text-stone-400 mt-1">{indicator.detail}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
