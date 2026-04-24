import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout() {
  const [user, setUser] = useState({ name: 'User' });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token) {
      navigate('/'); // Kick back to login if no token
    } else if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  return (
    <div className="relative h-screen w-full flex overflow-hidden bg-[#1d1411] font-sans text-stone-200">
      
      {/* --- ANIMATED BACKGROUND --- */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(251,191,118,0.26),transparent_40%),radial-gradient(circle_at_88%_12%,rgba(253,186,116,0.24),transparent_42%),radial-gradient(circle_at_70%_78%,rgba(253,164,175,0.20),transparent_45%)]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-8 brightness-110 contrast-125"></div>
         <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-amber-300/24 rounded-full mix-blend-screen filter blur-[110px] animate-blob"></div>
         <div className="absolute bottom-0 left-0 w-[520px] h-[520px] bg-orange-300/22 rounded-full mix-blend-screen filter blur-[110px] animate-blob animation-delay-2000"></div>
         <div className="absolute top-1/3 left-1/3 w-[440px] h-[440px] bg-rose-300/18 rounded-full mix-blend-screen filter blur-[110px] animate-blob animation-delay-4000"></div>
      </div>

      <Sidebar />

      {/* --- MAIN CONTENT AREA --- */}
      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        <Header user={user} />

        {/* Scrollable Content provided by Outlet */}
        <main className="flex-1 overflow-y-auto w-full p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
