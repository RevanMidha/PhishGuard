import { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Mail, Lock, User, ArrowRight, Globe, Shield, Loader2 } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/signup';

    try {
      const { data } = await axios.post(endpoint, formData);
      localStorage.setItem('token', data.token);
      
      setTimeout(() => {
         alert(`Welcome to PhishGuard, ${data.name || 'User'}`);
      }, 500);

    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIXED: Using "fixed inset-0" ensures it takes exactly 100% of the viewport, no scrolling.
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-slate-950 font-sans selection:bg-blue-500/30">
      
      {/* --- ANIMATED BACKGROUND --- */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
         <div className="absolute inset-0 bg-slate-950/90"></div>
         
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
         <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* --- MAIN CONTENT WRAPPER --- */}
      {/* z-10 ensures it sits above the background. "flex-row" forces side-by-side layout. */}
      <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24">
        
        {/* LEFT SIDE: Brand & Trust */}
        <div className="hidden md:flex flex-col justify-center space-y-6 animate-fade-in max-w-lg text-left">
          <div className="flex items-center gap-3">
             <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-900/50">
                <ShieldCheck className="text-white w-7 h-7" />
             </div>
             <h1 className="text-2xl font-bold text-white tracking-tight">PhishGuard</h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-400 leading-tight">
              Security for the <br/> Modern Web.
            </h2>
            <p className="text-base text-slate-400 leading-relaxed max-w-sm">
              Detect phishing attacks in real-time with our AI-driven multimodal analysis engine.
            </p>
          </div>

          <div className="flex gap-4 pt-2">
             <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Globe className="text-blue-400 w-5 h-5" />
                <span className="text-sm font-semibold text-slate-200">Global Intel</span>
             </div>
             <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Shield className="text-emerald-400 w-5 h-5" />
                <span className="text-sm font-semibold text-slate-200">Zero-Day Protection</span>
             </div>
          </div>
        </div>

        {/* RIGHT SIDE: Auth Card */}
        {/* Added "my-auto" to force vertical centering */}
        <div className="w-full max-w-[380px] bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl shadow-black/50 animate-fade-in my-auto">
          
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-1">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h3>
            <p className="text-slate-400 text-xs">
              {isLogin ? 'Enter your credentials to access your dashboard' : 'Create an account to verify your identity'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-xs">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <div className="relative group">
                  <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                    placeholder="Full Name"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <div className="relative group">
                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                  placeholder="Email Address"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative group">
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-2 text-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-xs">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-blue-400 hover:text-blue-300 font-medium hover:underline transition-all"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}