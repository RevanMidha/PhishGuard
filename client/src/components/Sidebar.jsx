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
      activeClass: 'bg-blue-600/10 text-blue-400 border-blue-500/20', 
      hoverClass: 'group-hover:text-blue-400' 
    },
    { 
      name: 'URL Scanner', path: '/url-scanner', icon: LinkIcon, 
      activeClass: 'bg-blue-600/10 text-blue-400 border-blue-500/20', 
      hoverClass: 'group-hover:text-blue-400' 
    },
    { 
      name: 'Text & Email Scanner', path: '/text-scanner', icon: Mail, 
      activeClass: 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20', 
      hoverClass: 'group-hover:text-emerald-400' 
    },
    { 
      name: 'Vision Scanner', path: '/vision-scanner', icon: ImageIcon, 
      activeClass: 'bg-purple-600/10 text-purple-400 border-purple-500/20', 
      hoverClass: 'group-hover:text-purple-400' 
    },
  ];

  return (
    <div className="relative w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 hidden md:flex flex-col z-20">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-900/20">
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium border transition-all group ${
                isActive 
                  ? item.activeClass
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-transparent'
              }`}
            >
              <Icon className={isActive ? '' : `${item.hoverClass} transition-colors`} size={20} /> 
              {item.name}
            </button>
          );
        })}
        
        <div className="pt-4 mt-4 border-t border-slate-700"> 
          <button 
            onClick={() => navigate('/methodology')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium border transition-all group ${
              location.pathname === '/methodology'
                ? 'bg-amber-600/10 text-amber-500 border-amber-500/20'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-transparent'
            }`}
          >
            <BookOpen className={location.pathname === '/methodology' ? '' : 'group-hover:text-amber-400 transition-colors'} size={20} /> 
            Our Methodology
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800/50">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl font-medium transition-all"
        >
          <LogOut size={20} /> Log Out
        </button>
      </div>
    </div>
  );
}
