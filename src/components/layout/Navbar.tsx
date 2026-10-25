import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  QrCode, 
  RotateCcw, 
  Bell, 
  Menu, 
  User, 
  Sparkles,
  ExternalLink,
  Database
} from 'lucide-react';
import { getAvatarInitials, profileService } from '../../services/profileService';
import { authService } from '../../services/authService';

interface NavbarProps {
  onMobileMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    patientProfile, 
    safetyAlerts, 
    resetToDemoData,
    searchQuery,
    setSearchQuery,
    isSupabaseConnected,
    isDemoMode,
    logout,
  } = useApp();

  // Compute display name: actual Supabase profile name, signup metadata, or 'Patient'
  const resolvedProfileName = patientProfile.fullName && patientProfile.fullName.trim() !== '' ? patientProfile.fullName.trim() : 'Patient';
  const displayName = isDemoMode ? (patientProfile.fullName || 'Arun Kumar (Demo)') : resolvedProfileName;
  const avatarInitials = getAvatarInitials(displayName);

  const activeAlerts = safetyAlerts.filter(a => !a.resolved);
  const hasHighRisk = activeAlerts.some(a => a.severity === 'High');
  const hasModRisk = activeAlerts.some(a => a.severity === 'Moderate');
  const isSafe = activeAlerts.length === 0;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-soft-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onMobileMenuToggle}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden focus:outline-none"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-medblue-600 to-medblue-800 flex items-center justify-center text-white shadow-md shadow-medblue-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                    Med<span className="text-medblue-600">Gap</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-medteal-100 text-medteal-800">
                    Safety
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 hidden sm:block">Medication Safety Platform</p>
              </div>
            </button>
          </div>

          {/* Middle: Search input */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (location.pathname !== '/medications') {
                    navigate('/medications');
                  }
                }}
                placeholder="Search medications, generics, conditions..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-medblue-500 rounded-xl focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right: Actions, Database indicator, Safety status pill, Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Demo Mode / Backend status pill */}
            {isDemoMode ? (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>DEMO MODE</span>
                <button
                  onClick={async () => {
                    await logout();
                    navigate('/login');
                  }}
                  className="ml-1 text-[10px] underline hover:text-amber-950 font-bold"
                  title="Exit demo mode"
                >
                  Exit
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/settings')}
                className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                  isSupabaseConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
                title={isSupabaseConnected ? 'Connected to live Supabase cloud PostgreSQL' : 'Local storage vault active. Connect Supabase in settings.'}
              >
                <Database className="w-3.5 h-3.5" />
                <span>{isSupabaseConnected ? 'Supabase Live' : 'Active Account'}</span>
              </button>
            )}

            {/* Safety status pill */}
            <button
              onClick={() => navigate('/alerts')}
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isSafe 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' 
                  : hasHighRisk
                  ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 animate-pulse-beacon font-bold'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 font-bold'
              }`}
            >
              {isSafe ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Profile Safe</span>
                </>
              ) : hasHighRisk ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>🔴 High Priority Alert</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>🟡 Safety Issue</span>
                </>
              )}
            </button>

            {/* Share QR quick action */}
            <button
              onClick={() => navigate('/share')}
              className="p-2 rounded-xl text-slate-600 hover:text-medblue-600 hover:bg-slate-100 transition-colors relative"
              title="Generate temporary clinician share token"
            >
              <QrCode className="w-5 h-5" />
            </button>

            {/* Safety Alerts quick link */}
            <button
              onClick={() => navigate('/alerts')}
              className="p-2 rounded-xl text-slate-600 hover:text-medblue-600 hover:bg-slate-100 transition-colors relative"
              title="View safety alerts"
            >
              <Bell className="w-5 h-5" />
              {activeAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              )}
            </button>

            {/* Profile Avatar */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2 pl-2 sm:pl-3 border-l border-slate-200 text-left group focus:outline-none"
              title={`Logged in as ${displayName}`}
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-medblue-700 transition-colors">
                {avatarInitials}
              </div>
              <div className="hidden lg:block text-xs leading-tight">
                <span className="font-bold text-slate-800 block truncate max-w-[100px]">
                  {displayName}
                </span>
                <span className="text-[10px] text-slate-400">Patient</span>
              </div>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
