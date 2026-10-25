import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PrescriptionUploadView } from './PrescriptionUploadView';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  User, 
  Building, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  Eye,
  Activity,
  Plus,
  Trash2,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Prescription, MedicalReport } from '../../types';

export const PrescriptionsView: React.FC = () => {
  const navigate = useNavigate();
  const { 
    prescriptions, 
    medicalReports, 
    addMedicalReport, 
    removeMedicalReport, 
    runSafetyEvaluation 
  } = useApp();
  
  const [showUploader, setShowUploader] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'prescriptions' | 'reports'>('all');

  // Medical report modal state
  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState<MedicalReport['reportType']>('Lab Test');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportFacility, setReportFacility] = useState('');
  const [reportFindings, setReportFindings] = useState('');

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !reportFindings.trim()) return;
    addMedicalReport({
      title: reportTitle.trim(),
      reportType,
      date: reportDate || new Date().toISOString().split('T')[0],
      facilityOrDoctor: reportFacility.trim() || 'Clinical Laboratory',
      summaryOrFindings: reportFindings.trim(),
    });
    setReportTitle('');
    setReportFacility('');
    setReportFindings('');
    setShowAddReportModal(false);
  };

  if (showUploader) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowUploader(false)}
          className="text-xs font-bold text-medblue-600 hover:text-medblue-800 flex items-center space-x-1"
        >
          <span>← Back to Records & Prescriptions</span>
        </button>
        <PrescriptionUploadView />
      </div>
    );
  }

  const totalRecordsCount = prescriptions.length + medicalReports.length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Prescriptions & Medical Records Locker
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {totalRecordsCount} Records
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Digitized prescriptions, lab test reports, radiology findings, and clinical documents.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setShowAddReportModal(true)}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-bold shadow-soft-sm transition-all flex items-center space-x-1.5"
          >
            <Activity className="w-4 h-4 text-medteal-600" />
            <span>+ Archive Lab Report</span>
          </button>
          <button
            onClick={() => setShowUploader(true)}
            className="px-5 py-2.5 bg-medblue-600 hover:bg-medblue-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-medblue-600/25 transition-all flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>+ Upload Prescription</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs sm:text-sm font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Records ({totalRecordsCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('prescriptions')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'prescriptions'
              ? 'bg-medblue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Prescriptions ({prescriptions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'reports'
              ? 'bg-medteal-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Diagnostic & Lab Reports ({medicalReports.length})
        </button>
      </div>

      {/* Grid content based on activeTab */}
      <div className="space-y-8">
        {/* Prescriptions Section */}
        {(activeTab === 'all' || activeTab === 'prescriptions') && (
          <div className="space-y-3">
            {activeTab === 'all' && (
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-medblue-600" />
                  <span>Archived Prescriptions ({prescriptions.length})</span>
                </h2>
                <button
                  onClick={() => setShowUploader(true)}
                  className="text-xs font-bold text-medblue-600 hover:text-medblue-800 flex items-center space-x-1"
                >
                  <span>+ New Upload</span>
                </button>
              </div>
            )}

            {prescriptions.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center shadow-card">
                <div className="w-12 h-12 rounded-2xl bg-medblue-50 text-medblue-600 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">No Prescriptions Archived</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Digitize paper prescriptions and clinical discharge slips to track medications.
                </p>
                <button
                  onClick={() => setShowUploader(true)}
                  className="px-4 py-2 bg-medblue-600 hover:bg-medblue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Prescription</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {prescriptions.map(rx => (
                  <div
                    key={rx.id}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-card hover:shadow-soft-md transition-all p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top metadata */}
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center space-x-2">
                          <div className="w-9 h-9 rounded-xl bg-medblue-50 text-medblue-600 flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">{rx.prescriptionNumber}</h3>
                            <span className="text-[11px] text-slate-400 font-mono">{rx.fileName}</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rx.status === 'Processed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {rx.status}
                        </span>
                      </div>

                      {/* Doctor details */}
                      <div className="mt-3 space-y-1 text-xs text-slate-600">
                        <div className="flex items-center space-x-2 font-semibold text-slate-800">
                          <User className="w-3.5 h-3.5 text-medblue-600 shrink-0" />
                          <span>{rx.doctorName}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-500">
                          <Building className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{rx.hospitalOrClinic}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>Issued on {rx.issueDate}</span>
                        </div>
                      </div>

                      {/* Extracted medicines list */}
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                          Extracted Medications ({rx.extractedMedicines.length})
                        </span>
                        <div className="space-y-1.5">
                          {rx.extractedMedicines.map((m, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-900">{m.name}</span>
                                <span className="text-[11px] text-slate-500 ml-1.5">{m.strength}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {m.frequency}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedPrescription(rx)}
                        className="text-xs font-bold text-medblue-600 hover:text-medblue-800 flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => {
                          if (rx.extractedMedicines.length > 0) {
                            runSafetyEvaluation(rx.extractedMedicines[0].name, rx.extractedMedicines[0].strength);
                            navigate('/safety-checker');
                          }
                        }}
                        className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-medblue-800 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1"
                      >
                        <ShieldAlert className="w-3 h-3 text-medblue-600" />
                        <span>Check Safety</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Diagnostic & Lab Reports Section */}
        {(activeTab === 'all' || activeTab === 'reports') && (
          <div className="space-y-3">
            {activeTab === 'all' && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-medteal-600" />
                  <span>Diagnostic & Lab Reports ({medicalReports.length})</span>
                </h2>
                <button
                  onClick={() => setShowAddReportModal(true)}
                  className="text-xs font-bold text-medteal-700 hover:text-medteal-800 flex items-center space-x-1"
                >
                  <span>+ Archive Report</span>
                </button>
              </div>
            )}

            {medicalReports.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center shadow-card">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">No Diagnostic Reports Stored</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Archive blood tests, pathology panels, CT/MRI radiology findings, and clinical investigations in your locker.
                </p>
                <button
                  onClick={() => setShowAddReportModal(true)}
                  className="px-4 py-2 bg-medteal-600 hover:bg-medteal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Archive Lab Report</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {medicalReports.map(rep => (
                  <div
                    key={rep.id}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-card hover:shadow-soft-md transition-all p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                            <Activity className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{rep.title}</h3>
                            <span className="text-[11px] text-slate-400">{rep.date}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200/50 shrink-0">
                          {rep.reportType}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1 text-xs text-slate-600">
                        <div className="flex items-center space-x-2 font-medium text-slate-700">
                          <Building className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="truncate">{rep.facilityOrDoctor}</span>
                        </div>
                      </div>

                      <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Findings & Values
                        </div>
                        <p className="text-slate-700 whitespace-pre-line leading-relaxed font-sans line-clamp-4">
                          {rep.summaryOrFindings}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Encrypted in Vault</span>
                      <button
                        onClick={() => removeMedicalReport(rep.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors flex items-center space-x-1"
                        title="Delete report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prescription Detail Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-medblue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Prescription Details: {selectedPrescription.prescriptionNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-slate-600">
              <p><strong>Physician:</strong> {selectedPrescription.doctorName} ({selectedPrescription.specialty})</p>
              <p><strong>Clinic / Hospital:</strong> {selectedPrescription.hospitalOrClinic}</p>
              <p><strong>Date of Issue:</strong> {selectedPrescription.issueDate}</p>
              <p><strong>Original File:</strong> {selectedPrescription.fileName}</p>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Prescribed Regimen Breakdown
              </h4>
              <div className="space-y-2">
                {selectedPrescription.extractedMedicines.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{m.name} ({m.strength})</span>
                      <span className="text-emerald-700 font-normal">{m.confidenceScore}% OCR match</span>
                    </div>
                    <p className="text-slate-500 mt-1">Dosage: {m.dosage} • Frequency: {m.frequency}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedPrescription(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Medical / Diagnostic Report Modal */}
      {showAddReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-medteal-600" />
                <h3 className="text-base font-bold text-slate-900">Archive Diagnostic or Lab Report</h3>
              </div>
              <button
                onClick={() => setShowAddReportModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReport} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Report / Investigation Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Blood Count (CBC) or Fasting Lipid Profile"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medteal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Report Category
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as MedicalReport['reportType'])}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medteal-500 focus:outline-none"
                  >
                    <option value="Lab Test">Lab Test</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Pathology">Pathology</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date of Investigation
                  </label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medteal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Testing Facility / Laboratory / Doctor
                </label>
                <input
                  type="text"
                  placeholder="e.g. Metropolis Diagnostic Lab, Dr. Rao"
                  value={reportFacility}
                  onChange={(e) => setReportFacility(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medteal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Findings Summary / Key Values *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. HbA1c: 6.8% (Borderline diabetic control). Serum Creatinine: 1.1 mg/dL (Normal). eGFR: >90 mL/min."
                  value={reportFindings}
                  onChange={(e) => setReportFindings(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medteal-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddReportModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-medteal-600 hover:bg-medteal-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save to Locker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
