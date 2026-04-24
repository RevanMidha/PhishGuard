import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { ShieldCheck, Mail, Lock, User, ArrowRight, Loader2, AtSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../lib/api';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Send the Google token to our backend
        const { data } = await axios.post(`${API_BASE_URL}/api/auth/google`, {
          access_token: tokenResponse.access_token
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data)); 

        setTimeout(() => navigate('/dashboard'), 500);
      } catch (err) {
        setError('Google Authentication failed.');
      }
    },
    onError: () => setError('Google Login Failed')
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? `${API_BASE_URL}/api/auth/login` : `${API_BASE_URL}/api/auth/signup`;

    try {
      const { data } = await axios.post(endpoint, formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data)); 
      
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-slate-950 font-sans selection:bg-blue-500/30">
      
      {/* Background blobs kept the same */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
         <div className="absolute inset-0 bg-slate-950/90"></div>
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
         <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24">
        
        {/* LEFT SIDE: Brand - kept the same */}
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
        </div>

        {/* RIGHT SIDE: Auth Card */}
        <div className="w-full max-w-[380px] bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl shadow-black/50 animate-fade-in my-auto">
          
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-1">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p className="text-slate-400 text-xs">
              {isLogin ? 'Enter your credentials to access your dashboard' : 'Join PhishGuard to verify your identity'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-xs">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            
            {/* SIGNUP ONLY FIELDS */}
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <div className="relative group">
                    <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} autoComplete="off" className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600" placeholder="Full Name" required={!isLogin} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="relative group">
                    <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="off" className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600" placeholder="Email Address" required={!isLogin} />
                  </div>
                </div>
              </>
            )}

            {/* SHARED FIELD: USERNAME */}
            <div className="space-y-1">
              <div className="relative group">
                <AtSign className="absolute left-3 top-2.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="new-username"
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            {/* SHARED FIELD: PASSWORD */}
            <div className="space-y-1">
              <div className="relative group">
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password" // Stops Chrome yellow background
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                  placeholder="Password"
                  required
                />
              </div>
              
              {/* FORGOT PASSWORD LINK */}
              {isLogin && (
                <div className="flex justify-end pt-1">
                  <button type="button" className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-all">
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group disabled:opacity-70 mt-2 text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
            </button>

            {/* GOOGLE AUTH BUTTON */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
              <div className="relative flex justify-center text-xs"><span className="bg-slate-900 px-2 text-slate-500">Or continue with</span></div>
            </div>
            
            <button
              type="button"
              onClick={() => loginWithGoogle()}
              className="w-full bg-slate-950/50 border border-slate-800 hover:bg-slate-800 text-slate-300 font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              {/* Google SVG Logo */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-xs">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button onClick={() => setIsLogin(!isLogin)} className="ml-1 text-blue-400 hover:text-blue-300 font-medium hover:underline transition-all">
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
