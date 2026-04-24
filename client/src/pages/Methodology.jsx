import { Link as LinkIcon, BrainCircuit, ImageIcon, Lock, ShieldCheck, ScanSearch } from 'lucide-react';

const modules = [
  {
    title: '1. URL Risk Scoring',
    icon: LinkIcon,
    accent: 'amber',
    summary: 'The URL engine combines learned lexical signals with a fallback heuristic layer so obviously suspicious links are still caught even if the serialized model is unavailable or uncertain.',
    bullets: [
      'Measures hostname shape, entropy, suspicious tokens, nested subdomains, IP-based links, and brand lookalike patterns.',
      'Uses trusted-domain short-circuiting to avoid over-penalizing known safe services.',
      'Adds a heuristic probability floor for risky structures such as spoofed brands, suspicious TLDs, or credential-themed paths.',
    ],
  },
  {
    title: '2. Text and Email Analysis',
    icon: BrainCircuit,
    accent: 'emerald',
    summary: 'Text scanning is intentionally hybrid: a saved NLP model contributes signal, but phishing-specific guardrails help reduce false positives on normal conversation.',
    bullets: [
      'Looks for urgency, credential requests, account threats, payment collection language, reward lures, and click-driving prompts.',
      'Adds benign conversational overrides for short everyday messages like greetings and self-introductions.',
      'Returns explainable indicators instead of only a binary label so the user can see why content was flagged.',
    ],
  },
  {
    title: '3. Screenshot Verification',
    icon: ImageIcon,
    accent: 'rose',
    summary: 'The vision path reads the screenshot itself instead of trusting page source or markup, which helps with spoofed login pages and cloned interfaces.',
    bullets: [
      'Runs OCR to extract visible text, domains, login wording, payment terms, and threat language.',
      'Detects form-like layout regions and combines them with brand evidence from the screenshot text.',
      'Cross-checks the supplied page domain against the most likely detected brand to catch impersonation while avoiding shared-login false positives.',
    ],
  },
];

const accentStyles = {
  amber: 'bg-amber-300/15 text-amber-200 border-amber-300/30',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rose: 'bg-rose-300/15 text-rose-200 border-rose-300/30',
};

export default function Methodology() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-3 mb-4">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Detection Methodology</p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-stone-400">
          How PhishGuard makes a decision
        </h2>
        <p className="text-stone-400 max-w-3xl mx-auto leading-relaxed">
          PhishGuard does not rely on one model or one keyword list. It combines URL structure analysis, phishing-aware text heuristics, and screenshot verification so each scanner can explain what it saw and where the risk came from.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-5">
          <div className="mb-3 inline-flex rounded-xl border border-amber-300/30 bg-amber-300/15 p-2 text-amber-200">
            <ScanSearch size={18} />
          </div>
          <h3 className="text-lg font-semibold text-white">Explainable results</h3>
          <p className="mt-2 text-sm text-stone-400">Each scanner returns reasons, not just a verdict, so analysts can verify the call instead of trusting a black box.</p>
        </div>
        <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-5">
          <div className="mb-3 inline-flex rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400">
            <ShieldCheck size={18} />
          </div>
          <h3 className="text-lg font-semibold text-white">False-positive guardrails</h3>
          <p className="mt-2 text-sm text-stone-400">Safe-domain handling and conversational overrides help prevent harmless content from being labeled as phishing.</p>
        </div>
        <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-5">
          <div className="mb-3 inline-flex rounded-xl border border-rose-300/30 bg-rose-300/15 p-2 text-rose-200">
            <Lock size={18} />
          </div>
          <h3 className="text-lg font-semibold text-white">Layered resilience</h3>
          <p className="mt-2 text-sm text-stone-400">If one model is missing or uncertain, the surrounding heuristic layers still provide useful phishing risk coverage.</p>
        </div>
      </div>

      <div className="space-y-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <div key={module.title} className="bg-stone-900/40 border border-stone-800 p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden group hover:border-stone-700 transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl"></div>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl border shrink-0 ${accentStyles[module.accent]}`}>
                  <Icon size={28} />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{module.title}</h3>
                    <p className="text-stone-400 leading-relaxed">{module.summary}</p>
                  </div>
                  <div className="grid gap-3">
                    {module.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-start gap-3 rounded-xl border border-stone-800 bg-stone-950/45 px-4 py-3">
                        <div className={`mt-1 h-2 w-2 rounded-full ${module.accent === 'amber' ? 'bg-amber-200' : module.accent === 'emerald' ? 'bg-emerald-400' : 'bg-rose-200'}`}></div>
                        <p className="text-sm text-stone-300 leading-relaxed">{bullet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-5 bg-amber-300/10 border border-amber-300/25 rounded-2xl flex items-center justify-center gap-3 text-amber-200/90">
        <Lock size={18} />
        <p className="text-sm font-medium">Scan snippets are minimized in storage, and the UI is designed to surface enough evidence for review without dumping raw private content unnecessarily.</p>
      </div>
    </div>
  );
}
