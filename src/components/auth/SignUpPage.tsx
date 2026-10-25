import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/authService';
import { ShieldCheck, User, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, updatePatientProfile, addToast, isSupabaseConnected, loadSupabaseUserProfile, setIsDemoMode } = useApp();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast('Password Mismatch', 'Passwords do not match. Please verify.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConnected) {
        const { error } = await authService.signUp({
          email,
          password,
          fullName: fullName.trim() || 'Patient',
          dateOfBirth: '1974-04-12',
          gender: 'Not Specified',
        });

        if (error) {
          addToast('Registration Notice', error.message || 'Could not register user.', 'error');
          setLoading(false);
          return;
        }

        setIsDemoMode(false);
        await loadSupabaseUserProfile();
      } else {
        setIsDemoMode(false);
        updatePatientProfile({ fullName: fullName.trim() || 'Patient', email });
        setIsAuthenticated(true);
      }

      addToast('Account Created', `Welcome to MedGap, ${fullName.trim() || 'Patient'}! Your patient safety profile is active.`, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      addToast('Registration Error', err?.message || 'Failed to complete registration.', 'error');
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
          Create your safety profile
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">
          Protect your prescriptions from duplicate drugs and dangerous interactions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-soft-lg rounded-3xl border border-slate-200/90">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none transition-all"
                  placeholder="e.g. Jane Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email address *
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password *
              </label>
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

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Confirm password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Protected by Row Level Security (RLS)</span>
              </div>
              <p>Your medication history is encrypted and accessible only to you and authorized doctors.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-sm font-bold text-white bg-medblue-600 hover:bg-medblue-700 disabled:opacity-50 rounded-xl shadow-md shadow-medblue-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Creating Profile...' : 'Complete Sign Up'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-medblue-600 hover:text-medblue-700"
            >
              Sign in
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
