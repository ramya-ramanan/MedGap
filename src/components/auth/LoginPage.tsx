import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/authService';
import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, setIsDemoMode, addToast, isSupabaseConnected, loadSupabaseUserProfile } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      setIsDemoMode(false);
      if (isSupabaseConnected) {
        const { error } = await authService.signIn(email, password);
        if (error) {
          addToast('Sign In Notice', error.message || 'Could not verify credentials.', 'error');
          setLoading(false);
          return;
        }
        await loadSupabaseUserProfile();
      } else {
        setIsAuthenticated(true);
      }
      addToast('Welcome Back', 'Signed in successfully to MedGap.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      addToast('Sign In Error', err?.message || 'Unable to sign in.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          to="/"
          className="inline-flex items-center space-x-2.5 group focus:outline-none mb-4"
        >
          <div className="w-11 h-11 rounded-2xl bg-medblue-600 flex items-center justify-center text-white shadow-md shadow-medblue-600/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-3xl font-black text-slate-900 tracking-tight">
            Med<span className="text-medblue-600">Gap</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">
          Access your unified patient medication wallet and safety scanner
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-soft-lg rounded-3xl border border-slate-200/90">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => addToast('Password Reset', 'Password recovery instructions sent to your email.', 'info')}
                  className="text-xs font-semibold text-medblue-600 hover:text-medblue-700"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-medblue-600 focus:ring-medblue-500"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Verifying...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-bold text-medblue-600 hover:text-medblue-700"
            >
              Sign up for free
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          <Link
            to="/"
            className="hover:text-slate-600 transition-colors"
          >
            ← Back to MedGap home
          </Link>
        </div>
      </div>
    </div>
  );
};
