import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DoctorPortalModal } from './DoctorPortalModal';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  ShieldCheck, 
  Copy, 
  Check, 
  Clock, 
  Lock, 
  RotateCcw, 
  XCircle, 
  Eye, 
  Sparkles, 
  Stethoscope, 
  AlertCircle,
  ExternalLink,
  Loader2,
  Calendar
} from 'lucide-react';

export const SecureShareView: React.FC = () => {
  const { 
    sharingSession, 
    generateSharingSession, 
    revokeSharingSession, 
    patientProfile, 
    addToast 
  } = useApp();

  const [hasCopied, setHasCopied] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate initial seconds remaining
  const calculateRemainingSeconds = () => {
    if (!sharingSession?.expiresAt || !sharingSession.isActive) return 0;
    const diff = Math.floor((new Date(sharingSession.expiresAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  };

  const [countdownSeconds, setCountdownSeconds] = useState<number>(calculateRemainingSeconds);

  // Live timer for active session
  useEffect(() => {
    setCountdownSeconds(calculateRemainingSeconds());
    if (!sharingSession?.isActive) return;

    const interval = setInterval(() => {
      const remaining = calculateRemainingSeconds();
      setCountdownSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sharingSession?.isActive, sharingSession?.expiresAt]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatExpiryTime = (date?: Date | string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isExpired = Boolean(sharingSession && (!sharingSession.isActive || countdownSeconds <= 0));
  const isRevoked = Boolean(sharingSession && !sharingSession.isActive && countdownSeconds > 0);
  const isActive = Boolean(sharingSession?.isActive && countdownSeconds > 0);

  const activeToken = sharingSession?.token || 'mg_sec_initial_pending';
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/shared/${activeToken}`;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const session = await generateSharingSession(selectedDuration);
      if (session) {
        const diff = Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000);
        setCountdownSeconds(Math.max(0, diff));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (!navigator.clipboard) {
      addToast('Copy Failed', 'Clipboard access not supported in this environment.', 'error');
      return;
    }
    navigator.clipboard.writeText(shareUrl);
    setHasCopied(true);
    addToast('Link Copied', `Encrypted temporary doctor review URL copied to clipboard: ${shareUrl}`, 'success');
    setTimeout(() => setHasCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Share My Medication Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Share your medication information securely with an authorized doctor or pharmacist.
        </p>
      </div>

      {/* Main Sharing Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Config & Explanation (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-medblue-50 text-medblue-600 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Zero-Knowledge Sharing Protocol</h3>
                <p className="text-xs text-slate-500">Time-limited access token for clinic or emergency use</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              When visiting a new clinic or hospital, presenting your MedGap QR code allows the healthcare provider to review your active medications, strengths, and recorded allergy flags without manual re-entry.
            </p>

            {/* Scope inclusions */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Information Included in Secure Pass:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Active Medications</span>
                </div>
                <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-rose-600 font-bold">✓</span>
                  <span>Recorded Allergies</span>
                </div>
                <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span>Safety Alerts & Warnings</span>
                </div>
                <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-medblue-600 font-bold">✓</span>
                  <span>Prescription & History Records</span>
                </div>
              </div>
            </div>

            {/* Duration selector */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Access Token Duration:
              </label>
              <div className="flex items-center space-x-2">
                {[15, 30, 60].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSelectedDuration(mins)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedDuration === mins
                        ? 'bg-medblue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {mins} Minutes
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 px-4 bg-medblue-600 hover:bg-medblue-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-md shadow-medblue-600/25 transition-all flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Generating Secure Backend Token...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5 text-sky-200" />
                    <span>Generate New QR Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Temporary Secure Access Status Card */}
          {isActive ? (
            <div className="bg-white rounded-3xl border border-emerald-200 shadow-soft p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="text-sm font-bold text-slate-900">Temporary Secure Access</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Active Pass
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Time Remaining</span>
                  <span className="text-lg font-mono font-bold text-medblue-700 block mt-0.5">
                    {formatTimer(countdownSeconds)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Expires at {formatExpiryTime(sharingSession?.expiresAt)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Access Token</span>
                  <span className="text-xs font-mono font-bold text-slate-800 block mt-1 truncate">
                    {activeToken}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Role: {sharingSession?.recipientRole || 'Doctor'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center justify-center space-x-1.5"
                >
                  {hasCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{hasCopied ? 'Link Copied!' : 'Copy Secure Link'}</span>
                </button>

                <button
                  onClick={revokeSharingSession}
                  className="py-2 px-4 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all flex items-center space-x-1"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Revoke Access</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <h4 className="text-sm font-bold text-slate-900">Session Status</h4>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isRevoked ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isRevoked ? 'Revoked by Patient' : 'Expired / Inactive'}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {isRevoked 
                  ? 'Your previous clinician pass was revoked. Healthcare providers can no longer view your medication wallet until you generate a new QR code.'
                  : 'Your temporary clinician pass has expired. Generate a new QR code above to grant secure, time-limited access.'}
              </p>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-2.5 px-4 bg-medblue-50 hover:bg-medblue-100 text-medblue-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Generate New 30-Min QR Pass</span>
              </button>
            </div>
          )}

        </div>

        {/* Right Column: Scannable QR Code Visual Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-medblue-950 rounded-3xl p-6 sm:p-7 text-white text-center shadow-xl border border-slate-800 flex flex-col items-center justify-between h-full space-y-4">
            
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-sky-300 text-xs font-semibold mb-2.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Encrypted Patient QR Pass</span>
              </div>
              <h3 className="text-lg font-bold">MedGap Clinical Pass</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Scan with any phone camera or tablet
              </p>
            </div>

            {/* Real Scannable QR Code Container */}
            <div className="relative p-5 bg-white rounded-3xl shadow-2xl mx-auto flex flex-col items-center justify-center border-4 border-white/90 group transition-transform hover:scale-[1.02]">
              <QRCodeSVG
                value={shareUrl}
                size={180}
                level="M"
                bgColor="#FFFFFF"
                fgColor="#0F172A"
                marginSize={2}
                className="rounded-lg"
              />
              
              {!isActive && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-amber-400 mb-1" />
                  <span className="text-xs font-bold text-white">
                    {isRevoked ? 'Access Revoked' : 'Pass Expired'}
                  </span>
                  <span className="text-[10px] text-slate-300 mt-1">
                    Click Generate New to refresh
                  </span>
                </div>
              )}
            </div>

            {/* Token & Expiry Details beside/below QR */}
            <div className="w-full space-y-3">
              
              {/* Expiry Time Box Beside/Under QR */}
              <div className="bg-white/10 rounded-2xl p-3 border border-white/10 flex items-center justify-between text-left">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold block">
                      Expiry Time
                    </span>
                    <span className="text-xs font-bold text-white block">
                      {isActive 
                        ? `Valid until ${formatExpiryTime(sharingSession?.expiresAt)}` 
                        : 'Session Expired'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                    Countdown
                  </span>
                  <span className="text-sm font-mono font-bold text-sky-300 block">
                    {isActive ? formatTimer(countdownSeconds) : '00:00'}
                  </span>
                </div>
              </div>

              {/* Copy Secure Link & Quick Actions beside/below QR */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-md"
                >
                  {hasCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-700" />}
                  <span>{hasCopied ? 'Link Copied!' : 'Copy Secure Link'}</span>
                </button>

                {isActive && (
                  <button
                    type="button"
                    onClick={revokeSharingSession}
                    title="Revoke Access Pass"
                    className="py-2.5 px-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Revoke</span>
                  </button>
                )}
              </div>

              {/* Encoded URL Token Subtext */}
              <div className="text-[10px] text-slate-400 font-mono truncate px-1">
                Token: <span className="text-sky-300">{activeToken}</span>
              </div>

              {/* Clinician View Links */}
              <div className="pt-1 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsDoctorModalOpen(true)}
                  className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-300" />
                  <span>Preview Doctor Modal</span>
                </button>

                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-medblue-600 hover:bg-medblue-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-200" />
                  <span>Open Doctor View in New Tab</span>
                </a>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Doctor Portal View Simulation Modal */}
      <DoctorPortalModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
      />

    </div>
  );
};
