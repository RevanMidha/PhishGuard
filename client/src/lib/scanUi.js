import { AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

const BASE_RESULT_TONES = {
  safe: {
    card: 'bg-emerald-950/25 border-emerald-400/50 shadow-lg shadow-emerald-950/20',
    iconWrap: 'bg-emerald-400/20 text-emerald-300',
    title: 'text-emerald-300',
    badge: 'bg-emerald-400/10 text-emerald-200 border border-emerald-400/25',
    Icon: CheckCircle2,
  },
  suspicious: {
    card: 'bg-amber-950/30 border-amber-400/50 shadow-lg shadow-amber-950/25',
    iconWrap: 'bg-amber-400/20 text-amber-200',
    title: 'text-amber-200',
    badge: 'bg-amber-400/10 text-amber-100 border border-amber-400/25',
    Icon: ShieldAlert,
  },
  malicious: {
    card: 'bg-rose-950/30 border-rose-400/50 shadow-lg shadow-rose-950/25',
    iconWrap: 'bg-rose-400/20 text-rose-300',
    title: 'text-rose-300',
    badge: 'bg-rose-400/10 text-rose-100 border border-rose-400/25',
    Icon: AlertOctagon,
  },
  error: {
    card: 'bg-slate-900/60 border-slate-700 shadow-lg shadow-slate-950/40',
    iconWrap: 'bg-slate-700 text-slate-200',
    title: 'text-slate-100',
    badge: 'bg-slate-800 text-slate-300 border border-slate-700',
    Icon: AlertOctagon,
  },
};

export function createResultStyles(headlines) {
  return Object.fromEntries(
    Object.entries(BASE_RESULT_TONES).map(([key, tone]) => [
      key,
      {
        ...tone,
        headline: headlines[key],
      },
    ])
  );
}

export function getPercent(score) {
  return Math.round((score || 0) * 100);
}
