import { Menu, ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function Header({ user }) {
  const location = useLocation();

  const getPageMeta = () => {
    switch (location.pathname) {
      case '/dashboard':
        return {
          title: `Welcome back, ${user.name ? user.name.split(' ')[0] : 'User'}`,
          subtitle: 'Monitor scan volume, threat detections, and engine health.',
        };
      case '/url-scanner':
        return {
          title: 'Lexical URL Analysis',
          subtitle: 'Inspect suspicious domains, lookalikes, and risky URL structure.',
        };
      case '/text-scanner':
        return {
          title: 'Text & Email Analysis',
          subtitle: 'Review language cues, coercion signals, and credential requests.',
        };
      case '/vision-scanner':
        return {
          title: 'Vision Scanner',
          subtitle: 'Paste or upload screenshots for OCR, form, and brand-domain checks.',
        };
      case '/methodology':
        return {
          title: 'Our Methodology',
          subtitle: 'See how the detection pipeline combines URL, text, and vision signals.',
        };
      default:
        return {
          title: 'PhishGuard',
          subtitle: 'AI-assisted phishing detection workspace.',
        };
    }
  };

  const pageMeta = getPageMeta();

  return (
    <header className="h-20 flex items-center justify-between px-8 border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-md z-20 relative">
      <div className="flex items-center gap-4 md:hidden">
         <Menu className="text-slate-400" />
         <span className="font-bold text-white">PhishGuard</span>
      </div>
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-white">{pageMeta.title}</h1>
        <p className="text-sm text-slate-400">{pageMeta.subtitle}</p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 md:flex md:items-center md:gap-2">
          <ShieldCheck size={14} />
          Secure workspace
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold border-2 border-slate-800">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  );
}
