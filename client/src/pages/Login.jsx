import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, ShieldCheck, Lock, Mail, User, Globe, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/ToastContext';
import Button from '../components/common/Button';

const Login = () => {
  const navigate = useNavigate();
  const { loginWithEmail, signupWithEmail, loginWithGoogle, loginDemoUser } = useAuth();
  const { addToast } = useToast();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [language, setLanguage] = useState('English');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signupWithEmail(email, password, name);
        addToast({ type: 'success', title: 'Account Created', message: 'Welcome to NyayaMitra Legal Protection Portal.' });
      } else {
        await loginWithEmail(email, password);
        addToast({ type: 'success', title: 'Login Successful', message: 'Logged in successfully.' });
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please try demo login.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      addToast({ type: 'success', title: 'Google Sign-In', message: 'Welcome to NyayaMitra!' });
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Auth error:', err);
      setErrorMsg(err.message || 'Google Sign-In failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleQuickDemo = () => {
    loginDemoUser();
    addToast({ type: 'success', title: '⚡ Demo Access Granted', message: 'Welcome to NyayaMitra Portal.' });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between selection:bg-amber-100 selection:text-blue-900">
      {/* Top Header Bar */}
      <header className="bg-blue-900 text-white px-6 py-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 rounded-xl text-blue-950 font-extrabold shadow-sm">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight leading-none text-white">
              NYAYAMITRA <span className="text-amber-400 font-bold text-xs uppercase tracking-widest ml-1">न्याय मित्र</span>
            </h1>
            <p className="text-[11px] text-blue-200 font-medium">AI-Powered Legal Aid & Protection Portal for Citizens of India</p>
          </div>
        </div>

        {/* Language Switcher Placeholder */}
        <div className="flex items-center gap-2 bg-blue-950/80 px-3 py-1.5 rounded-xl border border-blue-800 text-xs font-semibold">
          <Globe className="w-4 h-4 text-amber-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-white focus:outline-none cursor-pointer"
          >
            <option value="English" className="text-slate-900">English (EN)</option>
            <option value="Hindi" className="text-slate-900">हिन्दी (Hindi)</option>
            <option value="Tamil" className="text-slate-900">தமிழ் (Tamil)</option>
            <option value="Telugu" className="text-slate-900">తెలుగు (Telugu)</option>
            <option value="Bengali" className="text-slate-900">বাংলা (Bengali)</option>
            <option value="Marathi" className="text-slate-900">मराठी (Marathi)</option>
          </select>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all">
          {/* Header Banner inside card */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-950 text-white p-6 text-center relative">
            <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 mb-3">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">
              {isSignUp ? 'Create Citizen Account' : 'Citizen Legal Portal Login'}
            </h2>
            <p className="text-xs text-blue-200 mt-1">
              {isSignUp
                ? 'Register for free legal advice, document generation & emergency SOS'
                : 'Sign in to access your legal assistant & document templates'}
            </p>
          </div>

          {/* Form Area */}
          <div className="p-6 sm:p-8 space-y-4">
            {/* Quick One-Click Demo Access Button for Hackathon Testing */}
            <button
              onClick={handleQuickDemo}
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-blue-950 font-bold py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer transform active:scale-98"
            >
              <Zap className="w-5 h-5 fill-blue-950 text-blue-950" />
              <span className="text-sm">Quick Demo Login (1-Click Access)</span>
            </button>

            <div className="relative flex items-center justify-center py-1">
              <hr className="w-full border-slate-200" />
              <span className="absolute bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Or Sign In with Credentials
              </span>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Google Sign-in Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-all disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="text-sm">Sign in with Google</span>
            </button>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {isSignUp && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={loading}
                icon={ArrowRight}
                iconPosition="right"
                className="py-3"
              >
                {isSignUp ? 'Create Citizen Account' : 'Sign In to Portal'}
              </Button>
            </form>

            {/* Toggle sign in / sign up */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-blue-900 hover:text-blue-950 font-semibold hover:underline cursor-pointer"
              >
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Register for Free Legal Aid"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-[11px] py-4 text-center border-t border-slate-800">
        <p>© 2026 NyayaMitra National AI Legal Portal • Empowered under National Legal Services Authority (NALSA) Guidelines</p>
      </footer>
    </div>
  );
};

export default Login;
