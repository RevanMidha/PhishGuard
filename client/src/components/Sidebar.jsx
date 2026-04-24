import { ShieldCheck, LogOut, Link as LinkIcon, Mail, Image as ImageIcon, Activity, BookOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const navItems = [
    { 
      name: 'Overview', path: '/dashboard', icon: Activity, 
      activeClass: 'bg-amber-400/10 text-amber-200 border-amber-300/30', 
      hoverClass: 'group-hover:text-amber-200' 
    },
    { 
      name: 'URL Scanner', path: '/url-scanner', icon: LinkIcon, 
      activeClass: 'bg-amber-400/10 text-amber-200 border-amber-300/30', 
      hoverClass: 'group-hover:text-amber-200' 
    },
    { 
      name: 'Text & Email Scanner', path: '/text-scanner', icon: Mail, 
      activeClass: 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20', 
      hoverClass: 'group-hover:text-emerald-400' 
    },
    { 
      name: 'Vision Scanner', path: '/vision-scanner', icon: ImageIcon, 
      activeClass: 'bg-rose-400/10 text-rose-200 border-rose-300/30', 
      hoverClass: 'group-hover:text-rose-200' 
    },
  ];

  return (
    <div className="relative w-64 bg-stone-900/50 backdrop-blur-xl border-r border-stone-800 hidden md:flex flex-col z-20">
      <div className="p-5 flex items-center gap-3 border-b border-stone-800/50">
        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-300 to-rose-300 shadow-lg shadow-orange-900/20">
          <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">PhishGuard</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button 
              key={item.path}
              onClick={() => navigate(item.path)} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium border transition-all group ${
                isActive 
                  ? item.activeClass
                  : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-200 border-transparent'
              }`}
            >
              <Icon className={isActive ? '' : `${item.hoverClass} transition-colors`} size={20} /> 
              {item.name}
            </button>
          );
        })}
        
        <div className="pt-4 mt-4 border-t border-stone-700"> 
          <button 
            onClick={() => navigate('/methodology')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium border transition-all group ${
              location.pathname === '/methodology'
                ? 'bg-amber-400/10 text-amber-200 border-amber-300/30'
                : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-200 border-transparent'
            }`}
          >
            <BookOpen className={location.pathname === '/methodology' ? '' : 'group-hover:text-amber-200 transition-colors'} size={20} /> 
            Our Methodology
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-stone-800/50">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-stone-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl font-medium transition-all"
        >
          <LogOut size={20} /> Log Out
        </button>
      </div>
    </div>
  );
}
