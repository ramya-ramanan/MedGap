import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  Pill, 
  FileText, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight, 
  Plus, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  QrCode, 
  ChevronRight,
  Sparkles,
  ExternalLink,
  Bell
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { 
    patientProfile, 
    medications, 
    prescriptions, 
    safetyAlerts, 
    resolveSafetyAlert 
  } = useApp();

  const activeMeds = medications.filter(m => m.status === 'Active');
  const activeAlerts = safetyAlerts.filter(a => !a.resolved);
  
  // Calculate dynamic 3-state safety status from database alert records
  const hasHighRisk = activeAlerts.some(a => a.severity === 'High');
  const hasModerateRisk = activeAlerts.some(a => a.severity === 'Moderate' || a.severity === 'Low');
  
  let safetyStatusLevel: 'green' | 'yellow' | 'red' = 'green';
  let safetyStatusTitle = '🟢 No unresolved high-priority alerts';
  let safetyStatusDescription = 'No unresolved high-priority alerts across your active medicines and allergy profile.';

  if (hasHighRisk) {
    safetyStatusLevel = 'red';
    safetyStatusTitle = '🔴 High-priority alert requires professional review';
    safetyStatusDescription = 'A potential high-priority pharmacovigilance contraindication or allergy conflict was detected. Please consult a qualified healthcare professional.';
  } else if (hasModerateRisk || activeAlerts.length > 0) {
    safetyStatusLevel = 'yellow';
    safetyStatusTitle = '🟡 Potential safety issue detected';
    safetyStatusDescription = 'A potential therapeutic duplication or moderate interaction was identified. Clinical review is recommended.';
  }

  return (
    <div className="space-y-6">
      
      {/* Dashboard Top Greeting & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Good morning, {patientProfile.fullName && patientProfile.fullName.trim() ? (patientProfile.fullName.trim().split(' ')[0] || 'Patient') : 'Patient'}
            </h1>
            {patientProfile.age && patientProfile.age > 0 ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-medblue-50 text-medblue-700 border border-medblue-200">
                Age {patientProfile.age}
              </span>
            ) : null}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            "Bridging the Medication Gap. Protecting Every Prescription."
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate('/safety-checker')}
            className="px-4 py-2.5 bg-medblue-600 hover:bg-medblue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center space-x-2 active:scale-95"
          >
            <ShieldAlert className="w-4 h-4 text-sky-200" />
            <span>Run Safety Check</span>
          </button>
          <button
            onClick={() => navigate('/prescriptions')}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold shadow-soft-sm transition-all flex items-center space-x-2"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Upload Rx</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards Grid (Requirement 4) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat 1: Current Medicines */}
        <div 
          onClick={() => navigate('/medications')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-soft-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Medicines</span>
            <div className="w-9 h-9 rounded-xl bg-medblue-50 text-medblue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{activeMeds.length}</span>
            <span className="text-xs text-emerald-600 font-semibold">Active in wallet</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {medications.filter(m => m.status === 'Discontinued').length} discontinued on file
          </p>
        </div>

        {/* Stat 2: Active Prescriptions */}
        <div 
          onClick={() => navigate('/prescriptions')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-soft-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Prescriptions</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-medteal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{prescriptions.length}</span>
            <span className="text-xs text-slate-500 font-medium">Digital records</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {prescriptions.length === 0 ? 'No prescriptions on file' : `Latest: ${prescriptions[0].hospitalOrClinic || prescriptions[0].doctorName}`}
          </p>
        </div>

        {/* Stat 3: Safety Alerts */}
        <div 
          onClick={() => navigate('/alerts')}
          className={`p-5 rounded-2xl border shadow-card transition-all cursor-pointer group ${
            safetyStatusLevel === 'green'
              ? 'bg-white border-slate-200/80 hover:shadow-soft-md' 
              : safetyStatusLevel === 'red'
              ? 'bg-rose-50/70 border-rose-300 hover:shadow-soft-md'
              : 'bg-amber-50/70 border-amber-300 hover:shadow-soft-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Safety Alerts</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
              safetyStatusLevel === 'green'
                ? 'bg-emerald-50 text-emerald-600'
                : safetyStatusLevel === 'red'
                ? 'bg-rose-100 text-rose-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {safetyStatusLevel === 'green' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className={`text-3xl font-extrabold ${
              safetyStatusLevel === 'green' ? 'text-slate-900' : safetyStatusLevel === 'red' ? 'text-rose-700' : 'text-amber-700'
            }`}>
              {activeAlerts.length}
            </span>
            <span className={`text-xs font-semibold ${
              safetyStatusLevel === 'green' ? 'text-emerald-600' : 'text-rose-700'
            }`}>
              {safetyStatusLevel === 'green' ? 'All verified' : 'Requires review'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {activeAlerts.length === 0 ? 'No active risk' : `${activeAlerts.length} Unreviewed`}
          </p>
        </div>

        {/* Stat 4: Last Updated */}
        <div 
          onClick={() => navigate('/history')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-soft-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Last Updated</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900">Today</span>
            <span className="text-xs text-slate-500 font-medium">Just now</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Auto-sync active</p>
        </div>

      </div>

      {/* Dynamic Safety Status Card (Requirement 4) */}
      <div className={`p-6 rounded-3xl border transition-all ${
        safetyStatusLevel === 'green'
          ? 'bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white border-emerald-200' 
          : safetyStatusLevel === 'red'
          ? 'bg-gradient-to-r from-rose-50 via-amber-50/30 to-white border-rose-300'
          : 'bg-gradient-to-r from-amber-50 via-orange-50/30 to-white border-amber-300'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-2xl shrink-0 ${
              safetyStatusLevel === 'green' ? 'bg-emerald-500 text-white' : safetyStatusLevel === 'red' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
            }`}>
              {safetyStatusLevel === 'green' ? (
                <ShieldCheck className="w-7 h-7" />
              ) : (
                <ShieldAlert className="w-7 h-7" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Calculated Safety Status
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  safetyStatusLevel === 'green'
                    ? 'bg-emerald-100 text-emerald-800' 
                    : safetyStatusLevel === 'red'
                    ? 'bg-rose-100 text-rose-800 animate-pulse'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {safetyStatusLevel === 'green' ? 'Status: Safe' : 'Status: Action Advised'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {safetyStatusTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
                {safetyStatusDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => navigate('/alerts')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center space-x-1.5 ${
                safetyStatusLevel === 'green'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : safetyStatusLevel === 'red'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              <span>View Safety Alerts</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Active Medications Preview & Safety Alert Notice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Active Medications Preview */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Pill className="w-5 h-5 text-medblue-600" />
              <h3 className="text-base font-bold text-slate-900">Current Medications Wallet</h3>
            </div>
            <button
              onClick={() => navigate('/medications')}
              className="text-xs font-semibold text-medblue-600 hover:text-medblue-700 flex items-center space-x-1"
            >
              <span>View Full Wallet</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeMeds.length === 0 ? (
            <div className="p-8 text-center bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2">
              <Pill className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No active medications in your wallet</p>
              <p className="text-xs text-slate-500">Upload a prescription or add a medicine to evaluate safety interactions.</p>
              <button
                onClick={() => navigate('/medications')}
                className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 bg-medblue-600 hover:bg-medblue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
              >
                <span>+ Add Medication</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {activeMeds.slice(0, 4).map((med) => (
                <div key={med.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-medblue-50 text-medblue-700 flex items-center justify-center font-bold text-xs">
                      {med.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{med.name}</span>
                        <span className="text-xs text-slate-500">({med.genericName})</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {med.strength} • {med.frequency} • {med.timing || 'Scheduled'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">{med.prescribedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
            <span>
              {activeMeds.length === 0 
                ? 'Wallet is empty' 
                : `Showing ${Math.min(4, activeMeds.length)} of ${activeMeds.length} active medications`}
            </span>
            <button
              onClick={() => navigate('/medications')}
              className="font-semibold text-medblue-600 hover:underline"
            >
              + Add or manage medications
            </button>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Sharing Pass */}
        <div className="space-y-4">
          
          {/* Clinical Sharing Pass Quick Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Security Feature</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                Encrypted
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold">Secure Clinician Pass</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Generate a temporary 30-minute encrypted QR code for your doctor or pharmacist to view your medications safely.
              </p>
            </div>
            <button
              onClick={() => navigate('/share')}
              className="w-full py-2.5 px-4 bg-medblue-600 hover:bg-medblue-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 shadow-sm"
            >
              <QrCode className="w-4 h-4" />
              <span>Generate Secure QR Pass</span>
            </button>
          </div>

          {/* Quick Safety Checker Run Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-medblue-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Prescription Safety Checker
              </h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Evaluating a new medicine? Check in real-time against your allergies, active meds, and duplicate ingredients.
            </p>
            <button
              onClick={() => navigate('/safety-checker')}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
            >
              <span>Launch Checker</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
