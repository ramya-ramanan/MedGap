import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  User,
  Pill,
  FileText,
  ShieldAlert,
  Bell,
  History,
  QrCode,
  Settings,
  LogOut,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Bot
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    medications, 
    prescriptions, 
    safetyAlerts, 
    patientProfile,
    logout,
    isDemoMode,
  } = useApp();

  const activeMedsCount = medications.filter(m => m.status === 'Active').length;
  const unresolvedAlerts = safetyAlerts.filter(a => !a.resolved).length;

  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      path: '/assistant',
      label: 'AI Assistant',
      icon: Bot,
      badge: 'Triage',
      badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
    },
    {
      path: '/profile',
      label: 'My Profile',
      icon: User,
    },
    {
      path: '/medications',
      label: 'Medication Wallet',
      icon: Pill,
      badge: activeMedsCount,
      badgeColor: 'bg-medblue-100 text-medblue-700',
    },
    {
      path: '/prescriptions',
      label: 'Prescriptions',
      icon: FileText,
      badge: prescriptions.length,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      path: '/safety-checker',
      label: 'Safety Checker',
      icon: ShieldAlert,
      highlight: true,
    },
    {
      path: '/alerts',
      label: 'Safety Alerts',
      icon: Bell,
      badge: unresolvedAlerts > 0 ? unresolvedAlerts : undefined,
      badgeColor: 'bg-rose-100 text-rose-700 font-bold animate-pulse',
    },
    {
      path: '/history',
      label: 'Medication History',
      icon: History,
    },
    {
      path: '/share',
      label: 'Share Access',
      icon: QrCode,
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    onClose();
  };

  const displayPatientName = isDemoMode
    ? (patientProfile.fullName || 'Arun Kumar (Demo)')
    : (patientProfile.fullName && patientProfile.fullName.trim() !== '' ? patientProfile.fullName.trim() : 'Patient');

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header in Drawer */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between lg:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-medblue-600 flex items-center justify-center text-white font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-lg">
              Med<span className="text-medblue-600">Gap</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Mini Card */}
        <div className="p-4 m-3 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white shadow-soft-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
              {isDemoMode ? 'Demo Patient' : 'Patient Profile'}
            </span>
            {isDemoMode ? (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                DEMO
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </div>
          <div className="mt-2">
            <h4 className="font-bold text-sm text-white tracking-tight">{displayPatientName}</h4>
            <p className="text-[11px] text-slate-300">
              {patientProfile.age ? `Age ${patientProfile.age}` : 'Age: N/A'} • {patientProfile.bloodGroup ? `Blood ${patientProfile.bloodGroup}` : 'Blood: N/A'}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-700/80 flex items-center justify-between text-[11px]">
            <span className="text-rose-300 font-medium truncate max-w-[170px]" title={patientProfile.knownAllergies?.join(', ') || 'None recorded'}>
              Allergy: {patientProfile.knownAllergies && patientProfile.knownAllergies.length > 0 ? patientProfile.knownAllergies[0] : 'None recorded'}
            </span>
            <button
              onClick={() => handleNavClick('/profile')}
              className="text-medblue-300 hover:text-white flex items-center space-x-0.5 shrink-0"
            >
              <span>View</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-medblue-600 text-white shadow-md shadow-medblue-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Doctor Portal Quick Action banner */}
        <div className="p-3 m-3 rounded-2xl bg-sky-50 border border-sky-200/80 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-medblue-950 flex items-center space-x-1.5">
              <QrCode className="w-4 h-4 text-medblue-600" />
              <span>Doctor Portal</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-medblue-200 text-medblue-900">
              30 Min QR
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Generate encrypted QR for clinical consultations
          </p>
          <button
            onClick={() => handleNavClick('/share')}
            className="mt-2 w-full py-1.5 px-2.5 rounded-lg bg-medblue-600 hover:bg-medblue-700 text-white text-[11px] font-semibold transition-colors flex items-center justify-center space-x-1"
          >
            <span>Share My Profile</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Footer with Sign Out */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
