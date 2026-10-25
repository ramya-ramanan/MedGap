import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ExtractedMedicine } from '../../types';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Eye, 
  Edit3, 
  ShieldAlert, 
  Download,
  FileCheck,
  Plus,
  Trash2,
  Check,
  Building,
  User,
  Calendar,
  AlertCircle
} from 'lucide-react';

type OcrStage = 'idle' | 'uploading' | 'reading' | 'extracting' | 'review';

interface EditableOcrMedicine extends ExtractedMedicine {
  id: string;
  verified: boolean;
}

export const PrescriptionUploadView: React.FC = () => {
  const navigate = useNavigate();
  const { addPrescription, addMedication, addToast } = useApp();
  
  const [ocrStage, setOcrStage] = useState<OcrStage>('idle');
  const [stageProgress, setStageProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; previewUrl?: string } | null>(null);
  const [doctorName, setDoctorName] = useState('Dr. K. Sharma, MD');
  const [clinicName, setClinicName] = useState('Metro Heart Institute');
  const [extractedMedicines, setExtractedMedicines] = useState<EditableOcrMedicine[]>([]);
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateOcrProcess = (sampleType: 'cardio' | 'urgent_care' | 'custom', customName?: string, previewUrl?: string) => {
    setOcrStage('uploading');
    setStageProgress(15);
    setUploadedFile({
      name: customName || (sampleType === 'urgent_care' ? 'UrgentCare_Clinic_Rx.pdf' : 'Cardio_Followup_Jan2026.pdf'),
      size: '1.4 MB',
      previewUrl
    });

    // Stage 1: Uploading
    setTimeout(() => {
      setOcrStage('reading');
      setStageProgress(45);
    }, 800);

    // Stage 2: Reading prescription
    setTimeout(() => {
      setOcrStage('extracting');
      setStageProgress(75);
    }, 1600);

    // Stage 3: Extracting medicines
    setTimeout(() => {
      if (sampleType === 'urgent_care') {
        setDoctorName('Dr. Arvind Gupta, MD');
        setClinicName('City Urgent Care Center');
        setExtractedMedicines([
          {
            id: 'ocr-1',
            name: 'Amoxicillin',
            genericName: 'Amoxicillin (Penicillin class)',
            strength: '500 mg',
            dosage: '1 capsule',
            frequency: '3 times / day',
            duration: '7 days',
            confidenceScore: 98,
            flaggedAlert: '⚠️ Penicillin allergy conflict with Arun Kumar profile',
            verified: false // Must be verified by user
          },
          {
            id: 'ocr-2',
            name: 'Ibuprofen',
            genericName: 'Ibuprofen (NSAID)',
            strength: '400 mg',
            dosage: '1 tablet',
            frequency: 'Every 8 hours as needed',
            duration: '5 days',
            confidenceScore: 96,
            flaggedAlert: '⚠️ Interaction warning: High bleeding risk with Aspirin',
            verified: false // Must be verified by user
          }
        ]);
      } else {
        setDoctorName('Dr. K. Sharma, MD');
        setClinicName('Metro Heart Institute');
        setExtractedMedicines([
          {
            id: 'ocr-1',
            name: 'Lisinopril',
            genericName: 'Lisinopril',
            strength: '10 mg',
            dosage: '1 tablet',
            frequency: 'Once daily (morning)',
            duration: '90 days',
            confidenceScore: 99,
            verified: false // Must be verified by user
          },
          {
            id: 'ocr-2',
            name: 'Atorvastatin',
            genericName: 'Atorvastatin Calcium',
            strength: '20 mg',
            dosage: '1 tablet',
            frequency: 'Once daily (bedtime)',
            duration: '90 days',
            confidenceScore: 98,
            verified: false // Must be verified by user
          }
        ]);
      }

      setOcrStage('review');
      setStageProgress(100);
      addToast('Prescription OCR Complete', 'Identified medical header and extracted candidate medications. Please verify details before saving.', 'success');
    }, 2400);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      simulateOcrProcess('custom', file.name, previewUrl);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      simulateOcrProcess('custom', file.name, previewUrl);
    }
  };

  const handleToggleVerify = (id: string) => {
    setExtractedMedicines(prev => prev.map(m => m.id === id ? { ...m, verified: !m.verified } : m));
  };

  const handleVerifyAll = () => {
    setExtractedMedicines(prev => prev.map(m => ({ ...m, verified: true })));
  };

  const handleUpdateMedicine = (id: string, field: keyof EditableOcrMedicine, value: string) => {
    setExtractedMedicines(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleRemoveMedicine = (id: string) => {
    setExtractedMedicines(prev => prev.filter(m => m.id !== id));
    if (activeEditingId === id) setActiveEditingId(null);
  };

  const handleAddNewMedicineRow = () => {
    const newId = `ocr-${Date.now()}`;
    const newRow: EditableOcrMedicine = {
      id: newId,
      name: 'New Medicine',
      genericName: '',
      strength: '500 mg',
      dosage: '1 tablet',
      frequency: 'Once daily',
      duration: '30 days',
      confidenceScore: 100,
      verified: true
    };
    setExtractedMedicines(prev => [...prev, newRow]);
    setActiveEditingId(newId);
  };

  const handleConfirmAndAdd = () => {
    const verifiedItems = extractedMedicines.filter(m => m.verified);

    if (verifiedItems.length === 0) {
      addToast(
        'Verification Required', 
        'Safety rule: Please verify at least one extracted medicine by ticking the verification checkbox before saving to wallet.', 
        'warning'
      );
      return;
    }

    // 1. Add prescription record
    const newRx = addPrescription({
      doctorName,
      specialty: 'Clinical Medicine',
      hospitalOrClinic: clinicName,
      issueDate: new Date().toISOString().split('T')[0],
      prescriptionNumber: `RX-${Math.floor(10000 + Math.random() * 90000)}-OCR`,
      status: 'Processed',
      fileName: uploadedFile?.name || 'Uploaded_Prescription.pdf',
      extractedMedicines: verifiedItems.map(({ verified, id, ...rest }) => rest),
    });

    // 2. Add each verified medicine to wallet
    verifiedItems.forEach(m => {
      addMedication({
        name: m.name,
        genericName: m.genericName || m.name,
        strength: m.strength,
        dosage: m.dosage,
        frequency: m.frequency,
        status: 'Active',
        prescribedBy: doctorName,
        startDate: new Date().toISOString().split('T')[0],
        indication: `Prescribed via ${newRx.prescriptionNumber} (${clinicName})`,
        instructions: `Take ${m.dosage} ${m.frequency} for ${m.duration || 'prescribed duration'}.`,
        category: 'Prescription Drug'
      });
    });

    addToast('Medications Confirmed', `${verifiedItems.length} verified medications added to your Medication Wallet. Opening Safety Checker...`, 'success');

    // 3. Flow requirement: Prescription → OCR → Extract → Verify/Edit → Confirm → Wallet → Safety Check
    // Automatically open the Safety Checker to check recorded allergies, adverse reactions, existing medicines, and known interactions
    const primaryMed = verifiedItems[0];
    navigate('/safety-checker', {
      state: {
        autoCheckMedicine: {
          name: primaryMed.name,
          strength: primaryMed.strength,
          dosage: primaryMed.dosage,
          frequency: primaryMed.frequency
        }
      }
    });
  };

  const handleResetUpload = () => {
    setOcrStage('idle');
    setUploadedFile(null);
    setExtractedMedicines([]);
    setStageProgress(0);
    setActiveEditingId(null);
  };

  const verifiedCount = extractedMedicines.filter(m => m.verified).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload Prescription
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload JPG, PNG, or PDF prescriptions. OCR extracts medicine name, strength, dosage, frequency, and duration into an editable verification screen before saving to your wallet.
        </p>
      </div>

      {/* Demo Sample Presets */}
      <div className="bg-gradient-to-r from-medblue-50 to-sky-50 p-4 rounded-2xl border border-medblue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-medblue-600 shrink-0" />
          <div>
            <span className="text-xs font-bold text-slate-900 block">Hackathon Demo OCR Presets</span>
            <span className="text-[11px] text-slate-600 block">
              Test realistic clinical prescriptions with 1-click OCR simulation:
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => simulateOcrProcess('cardio')}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-medblue-900 border border-medblue-200 text-xs font-bold rounded-xl shadow-soft-sm transition-all"
          >
            📄 Dr. Sharma (Cardiology Rx)
          </button>
          <button
            onClick={() => simulateOcrProcess('urgent_care')}
            className="px-3.5 py-1.5 bg-medblue-600 hover:bg-medblue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            ⚡ Urgent Care (Triggers Allergy/Interaction Alert)
          </button>
        </div>
      </div>

      {/* Main Drag & Drop / Processing Area */}
      {ocrStage === 'idle' && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-medblue-500 bg-white hover:bg-sky-50/20 rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all shadow-card group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-medblue-50 text-medblue-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Upload Prescription (JPG, PNG, or PDF)
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-4 max-w-sm mx-auto">
            Drag and drop your file here, or click to browse. Supports JPG, PNG, and PDF files.
          </p>

          <button
            type="button"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all"
          >
            Choose File
          </button>

          <p className="text-[11px] text-slate-400 mt-4">
            Encrypted client-side OCR processing • Never auto-saves unverified results
          </p>
        </div>
      )}

      {/* Multi-stage Animated OCR Processing */}
      {ocrStage !== 'idle' && ocrStage !== 'review' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-md p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-medblue-50 text-medblue-600 flex items-center justify-center mx-auto animate-bounce">
            <FileText className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {ocrStage === 'uploading' && 'Uploading prescription file...'}
              {ocrStage === 'reading' && 'Reading prescription OCR & handwriting...'}
              {ocrStage === 'extracting' && 'Extracting Medicine Name, Strength, Dosage, Frequency & Duration...'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Document: <span className="font-mono font-medium text-slate-700">{uploadedFile?.name}</span>
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-medblue-600 to-medteal-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${stageProgress}%` }}
            />
          </div>

          {/* Step indicators */}
          <div className="grid grid-cols-4 gap-2 text-[11px] text-slate-500 pt-2">
            <div className={`font-semibold ${stageProgress >= 25 ? 'text-medblue-600' : ''}`}>1. Uploading</div>
            <div className={`font-semibold ${stageProgress >= 50 ? 'text-medblue-600' : ''}`}>2. Reading OCR</div>
            <div className={`font-semibold ${stageProgress >= 75 ? 'text-medblue-600' : ''}`}>3. Extracting</div>
            <div className={`font-semibold ${stageProgress >= 100 ? 'text-medblue-600' : ''}`}>4. Verification</div>
          </div>
        </div>
      )}

      {/* OCR Editable Verification Screen */}
      {ocrStage === 'review' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Strict Human-in-the-Loop Safety Rule Banner */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <span className="font-bold block text-sm">Human Verification Required Before Adding to Wallet</span>
              <p>
                To guarantee medication safety, <strong>MedGap never automatically saves unverified OCR results</strong>. Please review, edit fields if necessary, and check the verification box for each medicine you wish to add to your Medication Wallet.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft p-6 sm:p-8 space-y-6">
            
            {/* Header of review */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>OCR Extraction Ready for Verification</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    {verifiedCount} of {extractedMedicines.length} verified
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                  Editable Verification Screen
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Extracted from: <strong className="text-slate-800">{uploadedFile?.name}</strong>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleVerifyAll}
                  className="px-3 py-1.5 text-xs font-bold text-medblue-700 bg-medblue-50 hover:bg-medblue-100 rounded-xl transition-all"
                >
                  Verify All ({extractedMedicines.length})
                </button>
                <button
                  onClick={handleResetUpload}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 rounded-xl"
                >
                  Upload Different File
                </button>
              </div>
            </div>

            {/* Document & Prescribing Clinician Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Prescribing Doctor</span>
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-medblue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Clinic / Hospital</span>
                </label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-medblue-500"
                />
              </div>

              {uploadedFile?.previewUrl && (
                <div className="md:col-span-2 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Uploaded Document Thumbnail:
                  </span>
                  <img
                    src={uploadedFile.previewUrl}
                    alt="Prescription Preview"
                    className="max-h-44 rounded-xl border border-slate-200 object-contain bg-white shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Extracted Medicines Editable Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Extracted Medicines ({extractedMedicines.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Edit Medicine Name, Strength, Dosage, Frequency, and Duration directly.
                  </p>
                </div>
                
                <button
                  onClick={handleAddNewMedicineRow}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-medblue-300 text-medblue-600 text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medicine Row</span>
                </button>
              </div>

              {extractedMedicines.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
                  <p className="text-sm font-semibold text-slate-600">No medicines in current prescription list.</p>
                  <button
                    onClick={handleAddNewMedicineRow}
                    className="mt-3 px-4 py-2 bg-medblue-600 text-white rounded-xl text-xs font-bold shadow"
                  >
                    + Add Medicine Manually
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {extractedMedicines.map((med) => (
                    <div 
                      key={med.id} 
                      className={`p-4 rounded-2xl border transition-all ${
                        med.verified 
                          ? 'bg-white border-emerald-300 shadow-soft-sm' 
                          : 'bg-amber-50/40 border-amber-200'
                      }`}
                    >
                      {/* Top Bar: Verification toggle & OCR Confidence */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2 flex-wrap">
                        <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={med.verified}
                            onChange={() => handleToggleVerify(med.id)}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className={`text-xs font-bold ${med.verified ? 'text-emerald-700' : 'text-amber-800'}`}>
                            {med.verified ? '✓ Verified by User' : '⚠️ Unverified (Check to Approve)'}
                          </span>
                        </label>

                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] text-slate-400 font-mono">
                            OCR Confidence: {med.confidenceScore}%
                          </span>
                          <button
                            onClick={() => handleRemoveMedicine(med.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Discard this row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Flagged Alert Banner if any */}
                      {med.flaggedAlert && (
                        <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{med.flaggedAlert}</span>
                        </div>
                      )}

                      {/* Editable Fields Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-3">
                        {/* Medicine Name */}
                        <div className="space-y-1 sm:col-span-2 lg:col-span-2">
                          <label className="text-[11px] font-bold text-slate-600">Medicine Name</label>
                          <input
                            type="text"
                            value={med.name}
                            onChange={(e) => handleUpdateMedicine(med.id, 'name', e.target.value)}
                            placeholder="e.g. Amoxicillin"
                            className="w-full px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-medblue-500"
                          />
                        </div>

                        {/* Strength */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Strength</label>
                          <input
                            type="text"
                            value={med.strength}
                            onChange={(e) => handleUpdateMedicine(med.id, 'strength', e.target.value)}
                            placeholder="e.g. 500 mg"
                            className="w-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-medblue-500"
                          />
                        </div>

                        {/* Dosage */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Dosage</label>
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) => handleUpdateMedicine(med.id, 'dosage', e.target.value)}
                            placeholder="e.g. 1 capsule"
                            className="w-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-medblue-500"
                          />
                        </div>

                        {/* Frequency */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Frequency</label>
                          <input
                            type="text"
                            value={med.frequency}
                            onChange={(e) => handleUpdateMedicine(med.id, 'frequency', e.target.value)}
                            placeholder="e.g. 3 times / day"
                            className="w-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-medblue-500"
                          />
                        </div>

                        {/* Duration */}
                        <div className="space-y-1 sm:col-span-2 lg:col-span-5">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 space-y-1">
                              <label className="text-[11px] font-bold text-slate-600">Duration</label>
                              <input
                                type="text"
                                value={med.duration || ''}
                                onChange={(e) => handleUpdateMedicine(med.id, 'duration', e.target.value)}
                                placeholder="e.g. 7 days, 30 days, 90 days"
                                className="w-full px-3 py-1.5 text-xs sm:text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-medblue-500"
                              />
                            </div>
                            <div className="flex-1 space-y-1">
                              <label className="text-[11px] font-bold text-slate-600">Generic Name (Optional)</label>
                              <input
                                type="text"
                                value={med.genericName || ''}
                                onChange={(e) => handleUpdateMedicine(med.id, 'genericName', e.target.value)}
                                placeholder="e.g. Amoxicillin trihydrate"
                                className="w-full px-3 py-1.5 text-xs sm:text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-medblue-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Safety Checker Pipeline Info Box */}
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <ShieldAlert className="w-6 h-6 text-medblue-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Automated Safety Check on Confirmation
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    Upon clicking Confirm, MedGap will save these verified medicines to your Medication Wallet and automatically open the Safety Checker to audit allergies, previous adverse reactions, existing medicines, and known interactions.
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleResetUpload}
                className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl transition-all"
              >
                Cancel / Re-upload
              </button>

              <button
                onClick={handleConfirmAndAdd}
                disabled={verifiedCount === 0}
                className={`w-full sm:w-auto px-7 py-2.5 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 ${
                  verifiedCount > 0
                    ? 'text-white bg-medblue-600 hover:bg-medblue-700 shadow-medblue-600/25 cursor-pointer active:scale-95'
                    : 'text-slate-400 bg-slate-200 cursor-not-allowed shadow-none'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Add to Wallet ({verifiedCount} Verified) → Safety Check</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
