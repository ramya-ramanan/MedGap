import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { shareService } from '../../services/shareService';
import { SharedPatientViewData } from '../../types';
import { generatePatientHistoryPDF } from '../../utils/pdfGenerator';
import {
  ShieldCheck,
  Stethoscope,
  Pill,
  AlertTriangle,
  Lock,
  Printer,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ArrowLeft,
  Calendar,
  UserCheck,
  Download,
  FileText,
  XCircle,
  AlertCircle,
  FileCheck,
  Activity,
  Building,
  User,
  FileSpreadsheet
} from 'lucide-react';

export const SharedDoctorPortalView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [sharedData, setSharedData] = useState<SharedPatientViewData | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    const fetchSharedRecord = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const result = await shareService.getSharedProfile(token);
        setSharedData(result);
      } catch (err) {
        console.error('Error loading shared profile:', err);
        setSharedData({
          valid: false,
          status: 'invalid',
          error: 'An unexpected error occurred while verifying the patient security token.',
          disclaimer: 'Read-only view — Medication decisions remain with qualified healthcare professionals.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSharedRecord();
  }, [token]);

  const handleDownloadPDF = () => {
    if (!sharedData || !token) return;
    setIsGeneratingPdf(true);
    try {
      generatePatientHistoryPDF(sharedData, token);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-16 h-16 rounded-3xl bg-medblue-600 flex items-center justify-center shadow-xl animate-pulse">
          <Stethoscope className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold mt-4">Verifying MedGap Cryptographic Token...</h2>
        <p className="text-xs text-slate-400 mt-1">Decrypting authorized patient health records</p>
      </div>
    );
  }

  // Token is expired, invalid, or revoked
  if (!sharedData || !sharedData.valid) {
    const status = sharedData?.status || 'invalid';
    const isRevoked = status === 'revoked';
    const isExpired = status === 'expired';

    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-3xl p-8 text-center shadow-2xl">
          
          <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border ${
            isRevoked 
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
              : isExpired 
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              : 'bg-slate-700/40 text-slate-400 border-slate-600'
          }`}>
            {isRevoked ? (
              <XCircle className="w-8 h-8" />
            ) : isExpired ? (
              <Clock className="w-8 h-8" />
            ) : (
              <AlertOctagon className="w-8 h-8" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-white mt-4">
            {isRevoked 
              ? 'Access Pass Revoked' 
              : isExpired 
              ? 'Access Pass Expired' 
              : 'Invalid Access Token'}
          </h2>

          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {sharedData?.error || (
              isRevoked
                ? 'This access pass has been revoked by the patient. The patient has terminated clinician access to their health records.'
                : isExpired
                ? 'This temporary medication sharing pass has expired. For patient privacy, access passes self-terminate after the allocated time.'
                : 'This secure access link is invalid or does not match any active patient record on MedGap.'
            )}
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-700/80 text-xs text-slate-400 text-left space-y-1">
            <p className="font-semibold text-slate-300">MedGap Zero-Knowledge Policy:</p>
            <p className="leading-relaxed">
              {isRevoked
                ? 'Patients maintain absolute control over their health records and can immediately invalidate access at any time.'
                : 'QR passes expire automatically to prevent unauthorized or residual access to confidential health records.'}
            </p>
          </div>

          <Link
            to="/login"
            className="mt-6 inline-flex items-center space-x-2 text-xs font-semibold text-medblue-400 hover:text-medblue-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to MedGap Portal</span>
          </Link>

        </div>
      </div>
    );
  }

  const patient = sharedData.patient;
  const medicines = sharedData.current_medicines || [];
  const allergies = sharedData.allergies || [];
  const conditions = sharedData.conditions || [];
  const adverseReactions = sharedData.adverse_reactions || [];
  const lifestyleHistory = sharedData.lifestyle_history || [];
  const doctorVisits = sharedData.doctor_visits || [];
  const medicalReports = sharedData.medical_reports || [];
  const prescriptions = sharedData.prescriptions || [];
  const history = sharedData.medication_history || [];
  const alerts = sharedData.safety_alerts || [];

  const formatExpiryTime = (isoString?: string) => {
    if (!isoString) return null;
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return null;
    }
  };

  const formattedExpiry = formatExpiryTime(sharedData.expires_at);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-medblue-600 selection:text-white">
      {/* Clinician Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-medblue-600 flex items-center justify-center text-white shadow-md">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-tight">
                  Med<span className="text-medblue-400">Gap</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Authorized Clinician View
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Zero-Knowledge Temporary Token Access</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Download Patient History PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="px-4 py-2 rounded-xl bg-medblue-600 hover:bg-medblue-500 text-xs font-bold text-white shadow-md shadow-medblue-600/25 flex items-center space-x-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Patient History PDF'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Chart</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Medical Summary Sheet */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Document Title & Verification Pill */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>TOKEN: {token}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Active Read-Only Session
                </span>
                {formattedExpiry && (
                  <span className="text-xs text-slate-500 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Valid until {formattedExpiry}</span>
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                MedGap Secure Patient View
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Authorized clinical medication profile, allergies, prescription records, and audit history
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Verification Authority</span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">MedGap Clinical Safety Engine</span>
              <span className="text-[11px] text-slate-400">Timestamp: {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Mandatory Safety Disclaimer Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-bold text-amber-900">Clinical Decision Advisory</p>
              <p className="mt-0.5 font-medium text-slate-800">
                "{sharedData.disclaimer}"
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                This report is compiled from verified patient medication records and algorithmic safety checks. Prescribing clinicians must independently verify medical indications.
              </p>
            </div>
          </div>

          {/* 1. Patient Bio & Demographics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Name</span>
              <span className="text-base font-bold text-slate-900 block mt-1">
                {patient?.full_name || 'Patient'}
              </span>
              <span className="text-xs text-slate-500 mt-0.5 block">
                {patient?.age ? `Age: ${patient.age} Years` : 'Age: Not specified'} • {patient?.gender || 'Gender not specified'}
              </span>
              {patient?.email && (
                <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                  {patient.email}
                </span>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">Recorded Allergies</span>
              <span className="text-base font-bold text-rose-900 block mt-1">
                {allergies.length > 0 ? allergies.join(', ') : 'None recorded'}
              </span>
              {allergies.some(a => a.toLowerCase().includes('penicillin')) && (
                <span className="text-xs text-rose-700 mt-0.5 block font-semibold">
                  ⚠️ Strict Contraindication for Beta-Lactams
                </span>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Existing Conditions</span>
              <span className="text-sm font-bold text-slate-900 block mt-1">
                {conditions.length > 0 ? conditions.join(', ') : 'None recorded'}
              </span>
              <span className="text-xs text-slate-500 mt-0.5 block">Under medical management</span>
            </div>
          </div>

          {/* 2. Recorded Adverse Drug Reactions & Side Effects */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Adverse Drug Reactions & Side Effects ({adverseReactions.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">Patient-reported and clinician-confirmed ADR history</span>
            </div>

            {adverseReactions.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs text-center">
                No previous adverse drug reactions documented.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {adverseReactions.map((adr) => (
                  <div key={adr.id} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">{adr.medicine_name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        adr.severity === 'Severe' || adr.severity === 'Life-Threatening'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {adr.severity}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-amber-950">
                      Reaction: {adr.reaction}
                    </p>
                    {adr.notes && (
                      <p className="text-[11px] text-slate-600">
                        {adr.notes}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Recorded on {adr.date_recorded}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lifestyle & Substance History Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Lifestyle & Substance History ({lifestyleHistory.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">Smoking, alcohol, tobacco & other substances</span>
            </div>

            {lifestyleHistory.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs text-center">
                No substance or lifestyle history documented.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lifestyleHistory.map((item: any, idx: number) => {
                  const displayName = item.substanceType === 'Other' && item.customSubstanceName 
                    ? item.customSubstanceName 
                    : (item.substanceType || item.substance_type || 'Substance');
                  const status = item.status || 'Never';
                  const durationVal = item.durationValue ?? item.duration_value;
                  const durationUn = item.durationUnit || item.duration_unit || 'years';
                  const quitVal = item.quitDurationValue ?? item.quit_duration_value;
                  const quitUn = item.quitDurationUnit || item.quit_duration_unit || 'years';

                  return (
                    <div key={item.id || idx} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-base">
                            {displayName.toLowerCase().includes('smoke') || displayName.toLowerCase().includes('smoking') ? '🚬' : 
                             displayName.toLowerCase().includes('alcohol') ? '🍷' : 
                             displayName.toLowerCase().includes('tobacco') ? '🌿' : '🏷️'}
                          </span>
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">{displayName}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          status === 'Current'
                            ? 'bg-rose-100 text-rose-800'
                            : status === 'Past'
                              ? 'bg-medblue-100 text-medblue-800'
                              : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {status} User
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 space-y-0.5">
                        {status !== 'Never' && durationVal && (
                          <p>Duration: <strong>{durationVal} {durationUn}</strong></p>
                        )}
                        {status === 'Past' && quitVal && (
                          <p className="text-medblue-800 font-medium">
                            Time since quitting: <strong>{quitVal} {quitUn} ago</strong>
                          </p>
                        )}
                        {item.notes && <p className="text-slate-500 text-[11px] italic">"{item.notes}"</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Current Active Regimens */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Pill className="w-5 h-5 text-medblue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Current Medicines ({medicines.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">Verified from patient active wallet</span>
            </div>

            {medicines.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs text-center">
                No records available.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                {medicines.map((med, idx) => (
                  <div key={idx} className="p-4 bg-white hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900">{med.name}</span>
                        {med.generic_name && (
                          <span className="text-xs text-slate-500 font-mono">({med.generic_name})</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        <strong>Dosage:</strong> {med.strength || med.dosage} • <strong>Frequency:</strong> {med.frequency} {med.timing && `• Timing: ${med.timing}`}
                      </p>
                      {med.indication && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Indication: {med.indication}
                        </p>
                      )}
                    </div>
                    <div className="sm:text-right">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                        Active Regimen
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Prescribed: {med.prescribed_by || 'Verified Practitioner'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Diagnostic & Lab Reports Locker */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Diagnostic & Lab Reports ({medicalReports.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">Archived lab findings and investigations</span>
            </div>

            {medicalReports.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs text-center">
                No diagnostic or lab reports archived in locker.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {medicalReports.map((rep) => (
                  <div key={rep.id} className="p-4 rounded-2xl bg-teal-50/40 border border-teal-200/70 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">{rep.title}</span>
                        <span className="text-[11px] text-slate-500 block">{rep.facility_or_doctor} • {rep.date}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 shrink-0">
                        {rep.report_type}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/80 border border-teal-100 text-xs text-slate-700">
                      <p className="font-mono text-[11px] leading-relaxed whitespace-pre-line">
                        {rep.summary_or_findings}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Prescription Records */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Prescriptions ({prescriptions.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">Clinical records and OCR extractions</span>
            </div>

            {prescriptions.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs text-center">
                No records available.
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="text-sm font-bold text-slate-900">
                          {rx.doctor_name} — {rx.hospital_name}
                        </span>
                        <span className="text-xs text-slate-500 block">
                          Date: {rx.prescription_date} • Specialty: {rx.specialty || 'General'} {rx.prescription_number && `• Rx #: ${rx.prescription_number}`}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 self-start sm:self-auto">
                        {rx.extraction_status || 'Processed'}
                      </span>
                    </div>

                    {rx.medicines && rx.medicines.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                          Extracted Regimens:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {rx.medicines.map((m, mIdx) => (
                            <div key={mIdx} className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                              <span className="font-semibold text-slate-800">{m.name}</span>
                              <span className="text-[11px] text-slate-500 font-mono">
                                {m.strength || m.dosage} {m.frequency && `• ${m.frequency}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. Doctor Visits & Consultations */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-medblue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Doctor Visits & Consultations ({doctorVisits.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">Clinical appointment records</span>
            </div>

            {doctorVisits.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs text-center">
                No clinical consultations recorded.
              </div>
            ) : (
              <div className="space-y-3">
                {doctorVisits.map((visit) => (
                  <div key={visit.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {visit.doctor_name} — {visit.clinic_or_hospital}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Date: {visit.visit_date} • Specialty: {visit.specialty}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-medblue-800 self-start sm:self-auto">
                        Reason: {visit.reason_for_visit}
                      </span>
                    </div>
                    {visit.diagnosis_notes && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
                        <strong>Clinical Assessment:</strong> {visit.diagnosis_notes}
                        {visit.follow_up_date && (
                          <span className="block mt-1 text-[11px] text-medblue-700 font-medium">
                            Follow-up scheduled: {visit.follow_up_date}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7. Medication History & Audit Log */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-medblue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Medication History ({history.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">Chronological patient audit events</span>
            </div>

            {history.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs text-center">
                No records available.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                {history.map((item) => (
                  <div key={item.id} className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{item.title}</span>
                      <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <span className="text-[11px] text-slate-400 font-mono block">
                        {typeof item.created_at === 'string' ? item.created_at.split('T')[0] : 'Today'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Safety Alerts for Prescribing Doctor */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Pharmacovigilance Safety Alerts ({alerts.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">Calculated by MedGap Safety Checker</span>
            </div>

            {alerts.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-semibold">No unresolved safety contraindications identified.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-rose-950 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                          {alert.severity} Risk
                        </span>
                        <span className="text-xs font-bold text-slate-900">{alert.alert_type}</span>
                      </div>
                      <span className="text-xs text-slate-600">
                        Contrast: <strong>{alert.medicine_a}</strong> {alert.medicine_b && `↔ ${alert.medicine_b}`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {alert.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Action / Export Bar */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <p>
                MedGap Platform • Session Token: <code className="font-mono text-slate-600">{token}</code>
              </p>
              <p className="text-slate-500">
                Read-only view • Healthcare professionals are responsible for clinical decisions.
              </p>
            </div>

            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="px-4 py-2.5 rounded-xl bg-medblue-600 hover:bg-medblue-700 text-xs font-bold text-white shadow-md shadow-medblue-600/25 flex items-center justify-center space-x-2 transition-all self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Patient History PDF'}</span>
            </button>
          </div>

        </div>

      </main>
    </div>
  );
};
