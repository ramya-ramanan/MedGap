import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generatePatientHistoryPDF } from '../../utils/pdfGenerator';
import { 
  X, 
  ShieldCheck, 
  Stethoscope, 
  Pill, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Lock, 
  Download, 
  FileText, 
  Calendar,
  Activity 
} from 'lucide-react';

interface DoctorPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DoctorPortalModal: React.FC<DoctorPortalModalProps> = ({ isOpen, onClose }) => {
  const { 
    patientProfile, 
    medications, 
    prescriptions, 
    timelineEvents, 
    safetyAlerts, 
    sharingSession,
    adverseReactions,
    lifestyleHistory,
    doctorVisits,
    medicalReports
  } = useApp();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen) return null;

  const activeMeds = medications.filter(m => m.status === 'Active');
  const activeAlerts = safetyAlerts.filter(a => !a.resolved);
  const currentToken = sharingSession?.token || 'mg_sec_preview_auth';

  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    try {
      generatePatientHistoryPDF({
        valid: true,
        status: 'active',
        patient: {
          full_name: patientProfile.fullName || 'Patient',
          age: patientProfile.age,
          gender: patientProfile.gender,
          email: patientProfile.email,
          phone: patientProfile.phone,
        },
        allergies: patientProfile.knownAllergies || [],
        conditions: patientProfile.existingConditions || [],
        adverse_reactions: adverseReactions.map(ar => ({
          id: ar.id,
          medicine_name: ar.medicineName,
          reaction: ar.reaction,
          severity: ar.severity,
          date_recorded: ar.dateRecorded,
          notes: ar.notes,
        })),
        doctor_visits: doctorVisits.map(dv => ({
          id: dv.id,
          doctor_name: dv.doctorName,
          specialty: dv.specialty,
          clinic_or_hospital: dv.clinicOrHospital,
          visit_date: dv.visitDate,
          reason_for_visit: dv.reasonForVisit,
          diagnosis_notes: dv.diagnosisNotes,
          follow_up_date: dv.followUpDate,
        })),
        medical_reports: medicalReports.map(mr => ({
          id: mr.id,
          title: mr.title,
          report_type: mr.reportType,
          date: mr.date,
          facility_or_doctor: mr.facilityOrDoctor,
          summary_or_findings: mr.summaryOrFindings,
          file_url: mr.fileUrl,
        })),
        current_medicines: activeMeds.map(m => ({
          name: m.name,
          generic_name: m.genericName,
          strength: m.strength,
          dosage: m.dosage,
          frequency: m.frequency,
          timing: m.timing,
          prescribed_by: m.prescribedBy,
          start_date: m.startDate,
          indication: m.indication,
        })),
        prescriptions: prescriptions.map(rx => ({
          id: rx.id,
          doctor_name: rx.doctorName,
          hospital_name: rx.hospitalOrClinic,
          specialty: rx.specialty,
          prescription_date: rx.issueDate,
          prescription_number: rx.prescriptionNumber,
          extraction_status: rx.status,
          file_url: rx.fileUrl,
          medicines: (rx.extractedMedicines || []).map(em => ({
            name: em.name,
            generic_name: em.genericName,
            strength: em.strength,
            dosage: em.dosage,
            frequency: em.frequency,
            duration: em.duration,
          })),
        })),
        medication_history: timelineEvents.map(evt => ({
          id: evt.id,
          action_type: evt.type,
          title: evt.title,
          description: evt.description,
          created_at: evt.date,
        })),
        safety_alerts: activeAlerts.map(a => ({
          alert_type: a.type || 'Drug Interaction',
          severity: a.severity || 'Moderate',
          medicine_a: a.medicineA || a.newMedicine || '',
          medicine_b: a.medicineB || a.conflictingMedicine,
          description: a.description,
        })),
        disclaimer: 'Read-only view — Medication decisions remain with qualified healthcare professionals.',
      }, currentToken);
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Clinician Banner Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-medblue-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>SESSION VERIFIED • READ-ONLY VIEW</span>
                </span>
              </div>
              <h2 className="text-xl font-black mt-1">Authorized Clinical Portal View</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Viewing patient record: <strong className="text-white">{patientProfile.fullName || 'Patient'}</strong> ({patientProfile.age || 'N/A'}y, {patientProfile.gender || 'N/A'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor Portal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
          
          {/* Patient Overview Pill */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient</span>
              <span className="font-bold text-slate-900 block mt-0.5">{patientProfile.fullName || 'Patient'}</span>
              <span className="text-[11px] text-slate-500">
                {patientProfile.age ? `Age: ${patientProfile.age}` : 'Age: N/A'} • {patientProfile.gender || 'Gender: N/A'}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">Recorded Allergy</span>
              <span className="font-bold text-rose-900 block mt-0.5">
                {patientProfile.knownAllergies?.length > 0 ? patientProfile.knownAllergies.join(', ') : 'None recorded'}
              </span>
              <span className="text-[11px] text-rose-600">Strict contraindication check</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Existing Conditions</span>
              <span className="font-bold text-slate-900 block mt-0.5 truncate">
                {patientProfile.existingConditions?.length > 0 ? patientProfile.existingConditions.join(', ') : 'None recorded'}
              </span>
              <span className="text-[11px] text-slate-500">Under medical management</span>
            </div>
          </div>

          {/* Active Medicines List for Doctor */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Active Regimens ({activeMeds.length})
              </h4>
              <span className="text-[11px] text-slate-400">Verified by MedGap vault</span>
            </div>

            {activeMeds.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs text-center">
                No records available.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                {activeMeds.map(med => (
                  <div key={med.id} className="p-3.5 bg-white flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{med.name}</span>
                        <span className="text-xs text-slate-500 font-mono">({med.genericName})</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {med.strength} • {med.frequency} • {med.timing || 'Scheduled'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">{med.prescribedBy || 'Prescriber'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Adverse Drug Reactions Preview */}
          {adverseReactions.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Recorded Adverse Reactions & Side Effects ({adverseReactions.length})</span>
                </h4>
                <span className="text-[11px] text-amber-700">Re-exposure risk</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {adverseReactions.map((adr) => (
                  <div key={adr.id} className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{adr.medicineName}</span>
                      <span className="text-[10px] text-amber-800 uppercase font-extrabold">{adr.severity}</span>
                    </div>
                    <p className="text-slate-700 text-[11px] mt-0.5">{adr.reaction}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lifestyle & Substance History Preview */}
          {lifestyleHistory.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                  <span>Lifestyle & Substance History ({lifestyleHistory.length})</span>
                </h4>
                <span className="text-[11px] text-amber-700">Patient profile</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {lifestyleHistory.map((item) => {
                  const displayName = item.substanceType === 'Other' && item.customSubstanceName 
                    ? item.customSubstanceName 
                    : item.substanceType;
                  return (
                    <div key={item.id} className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-0.5">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{displayName}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          item.status === 'Current' ? 'bg-rose-100 text-rose-800' :
                          item.status === 'Past' ? 'bg-medblue-100 text-medblue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>{item.status}</span>
                      </div>
                      {item.durationValue && (
                        <p className="text-slate-600 text-[11px]">Duration: {item.durationValue} {item.durationUnit}</p>
                      )}
                      {item.status === 'Past' && item.quitDurationValue && (
                        <p className="text-medblue-800 text-[11px] font-medium">Quit: {item.quitDurationValue} {item.quitDurationUnit} ago</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Diagnostic & Lab Reports Preview */}
          {medicalReports.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  <span>Diagnostic & Lab Reports ({medicalReports.length})</span>
                </h4>
                <span className="text-[11px] text-teal-700">Locker records</span>
              </div>
              <div className="space-y-2">
                {medicalReports.slice(0, 3).map((rep) => (
                  <div key={rep.id} className="p-2.5 rounded-xl bg-teal-50/40 border border-teal-200 text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span className="truncate">{rep.title}</span>
                      <span className="text-[10px] text-teal-800 uppercase font-bold shrink-0">{rep.reportType}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">{rep.summaryOrFindings}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctor Visits Preview */}
          {doctorVisits.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-medblue-600" />
                  <span>Doctor Consultations ({doctorVisits.length})</span>
                </h4>
                <span className="text-[11px] text-slate-400">Clinical visits</span>
              </div>
              <div className="space-y-2">
                {doctorVisits.slice(0, 2).map((v) => (
                  <div key={v.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{v.doctorName} ({v.specialty})</span>
                      <span className="text-[10px] text-slate-500">{v.visitDate}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{v.reasonForVisit} • {v.diagnosisNotes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prescriptions Preview */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Prescriptions ({prescriptions.length})
              </h4>
              <span className="text-[11px] text-slate-400">Clinical records</span>
            </div>

            {prescriptions.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs text-center">
                No records available.
              </div>
            ) : (
              <div className="space-y-2">
                {prescriptions.slice(0, 3).map(rx => (
                  <div key={rx.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{rx.doctorName} — {rx.hospitalOrClinic}</span>
                      <p className="text-[11px] text-slate-500">{rx.issueDate} • {rx.specialty || 'General'}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      {rx.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medication History Preview */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Medication History ({timelineEvents.length})
              </h4>
              <span className="text-[11px] text-slate-400">Audit trail</span>
            </div>

            {timelineEvents.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs text-center">
                No records available.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                {timelineEvents.slice(0, 4).map(evt => (
                  <div key={evt.id} className="p-2.5 bg-white flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{evt.title}</span>
                      <p className="text-[11px] text-slate-600">{evt.description}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{evt.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mandatory Clinical Disclaimer */}
          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-slate-800 text-center">
            <p className="text-xs font-bold text-medblue-950">
              "Read-only view — Medication decisions remain with qualified healthcare professionals."
            </p>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Authorized session token: {currentToken} • Access pass is time-limited and revocable.
          </p>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="px-4 py-2 text-xs font-bold text-white bg-medblue-600 hover:bg-medblue-700 rounded-xl flex items-center space-x-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Patient History PDF'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
          >
            Close Doctor View
          </button>
        </div>

      </div>
    </div>
  );
};
