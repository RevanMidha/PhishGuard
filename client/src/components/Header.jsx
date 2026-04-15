import { Search, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function Header({ user }) {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return `Welcome back, ${user.name ? user.name.split(' ')[0] : 'User'}`;
      case '/url-scanner': return 'Lexical URL Analysis';
      case '/text-scanner': return 'Text & Email Analysis';
      case '/vision-scanner': return 'Vision Scanner';
      case '/methodology': return 'Our Methodology';
      default: return 'PhishGuard';
    }
  };

  return (
    <header className="h-20 flex items-center justify-between px-8 border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-md z-20 relative">
      <div className="flex items-center gap-4 md:hidden">
         <Menu className="text-slate-400" />
         <span className="font-bold text-white">PhishGuard</span>
      </div>
      <h1 className="text-2xl font-bold text-white hidden md:block">
        {getPageTitle()}
      </h1>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Quick scan URL..." 
            className="bg-slate-950 border border-slate-800 text-sm text-white rounded-full py-2 pl-9 pr-4 focus:outline-none focus:border-blue-500 transition-colors w-64 placeholder:text-slate-600"
          />
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold border-2 border-slate-800">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  );
}
