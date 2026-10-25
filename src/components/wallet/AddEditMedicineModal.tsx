import React, { useState, useEffect } from 'react';
import { Medication, MedicationStatus, MasterMedication } from '../../types';
import { medicationService } from '../../services/medicationService';
import { 
  X, 
  Pill, 
  Save, 
  Sparkles, 
  Search, 
  Check, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface AddEditMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medData: Omit<Medication, 'id'>) => void;
  editingMedication?: Medication | null;
}

export const AddEditMedicineModal: React.FC<AddEditMedicineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMedication,
}) => {
  const [step, setStep] = useState<'entry' | 'review'>('entry');

  // Manual Medicine Entry Fields (per requirement)
  const [name, setName] = useState(editingMedication?.name || '');
  const [genericName, setGenericName] = useState(editingMedication?.genericName || '');
  const [strength, setStrength] = useState(editingMedication?.strength || '');
  const [dosage, setDosage] = useState(editingMedication?.dosage || '1 tablet');
  const [frequency, setFrequency] = useState(editingMedication?.frequency || 'Once daily');
  const [duration, setDuration] = useState('30 days');
  const [instructions, setInstructions] = useState(editingMedication?.instructions || 'Take with water after meal.');
  
  // Secondary metadata
  const [status, setStatus] = useState<MedicationStatus>(editingMedication?.status || 'Active');
  const [prescribedBy, setPrescribedBy] = useState(editingMedication?.prescribedBy || 'Dr. Ramesh Mehta, MD');
  const [indication, setIndication] = useState(editingMedication?.indication || 'Hypertension management');

  // Master catalog live search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MasterMedication[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (editingMedication) {
      setName(editingMedication.name);
      setGenericName(editingMedication.genericName);
      setStrength(editingMedication.strength);
      setDosage(editingMedication.dosage);
      setFrequency(editingMedication.frequency);
      setDuration('30 days');
      setStatus(editingMedication.status);
      setPrescribedBy(editingMedication.prescribedBy);
      setIndication(editingMedication.indication);
      setInstructions(editingMedication.instructions || '');
      setStep('entry');
    } else {
      setStep('entry');
      setValidationError('');
    }
  }, [editingMedication, isOpen]);

  // Master medication catalog search debouncing
  useEffect(() => {
    if (!searchQuery.trim() || editingMedication) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await medicationService.searchMasterMedications(searchQuery);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, editingMedication]);

  if (!isOpen) return null;

  const handleSelectMasterMed = (item: MasterMedication) => {
    setName(item.medicine_name);
    setGenericName(item.generic_name);
    setStrength(item.strength);
    setDosage(`1 ${item.dosage_form.toLowerCase()}`);
    setSearchQuery('');
    setSearchResults([]);
    setValidationError('');
  };

  const handleQuickFill = (presetName: string, presetGeneric: string, presetStrength: string, presetFreq: string) => {
    setName(presetName);
    setGenericName(presetGeneric);
    setStrength(presetStrength);
    setDosage('1 tablet');
    setFrequency(presetFreq);
    setValidationError('');
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('Medicine Name is required.');
      return;
    }
    if (!strength.trim()) {
      setValidationError('Strength (e.g., 500 mg, 10 mg) is required.');
      return;
    }
    if (!dosage.trim()) {
      setValidationError('Dosage (e.g., 1 tablet, 2 puffs) is required.');
      return;
    }
    if (!frequency.trim()) {
      setValidationError('Frequency (e.g., Once daily, Twice daily) is required.');
      return;
    }
    if (!duration.trim()) {
      setValidationError('Duration (e.g., 30 days, 7 days, Ongoing) is required.');
      return;
    }

    setValidationError('');
    setStep('review');
  };

  const handleConfirmAndSave = () => {
    onSave({
      name: name.trim(),
      genericName: genericName.trim() || name.trim(),
      strength: strength.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      timing: `${frequency.trim()} for ${duration.trim()}`,
      status,
      prescribedBy: prescribedBy.trim() || 'Physician Authorized',
      startDate: new Date().toISOString().split('T')[0],
      indication: indication.trim() || 'General therapeutic management',
      instructions: instructions.trim() ? `${instructions.trim()} (Duration: ${duration.trim()})` : `Duration: ${duration.trim()}`,
      category: 'Therapeutic Medication',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-medblue-100 text-medblue-700 flex items-center justify-center font-bold">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingMedication ? 'Edit Medication' : 'Manual Medication Entry'}
              </h3>
              <p className="text-xs text-slate-500">
                {step === 'entry' ? 'Step 1 of 2: Enter prescription details' : 'Step 2 of 2: Review and confirm details'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progression Bar */}
        {!editingMedication && (
          <div className="px-6 py-2.5 bg-sky-50/70 border-b border-sky-100 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center space-x-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'entry' ? 'bg-medblue-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {step === 'entry' ? '1' : '✓'}
              </span>
              <span className={step === 'entry' ? 'text-medblue-900 font-bold' : 'text-slate-600'}>
                1. Manual Entry
              </span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />

            <div className="flex items-center space-x-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'review' ? 'bg-medblue-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                2
              </span>
              <span className={step === 'review' ? 'text-medblue-900 font-bold' : 'text-slate-400'}>
                2. Review & Confirm
              </span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />

            <div className="flex items-center space-x-1.5 text-slate-400">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>3. Safety Check</span>
            </div>
          </div>
        )}

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* STEP 1: MANUAL ENTRY */}
        {step === 'entry' && (
          <form onSubmit={handleProceedToReview} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
            
            {/* Live Search Master Catalog */}
            {!editingMedication && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Search Pharmacological Directory (Auto-Fill)
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search master brand or generic (e.g. Metformin, Lisinopril, Lipitor)..."
                    className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-medblue-500"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-3.5 h-3.5 border-2 border-medblue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-36 overflow-y-auto bg-white shadow-lg">
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectMasterMed(item)}
                        className="w-full text-left p-2.5 hover:bg-medblue-50/70 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">{item.medicine_name}</span>
                          <span className="text-[11px] text-slate-500 block">
                            {item.generic_name} • {item.strength} • {item.dosage_form}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-medblue-700 bg-medblue-100 px-2 py-0.5 rounded-full">
                          Select
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Test Presets */}
                <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Quick fill:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('Metformin', 'Metformin Hydrochloride', '500 mg', '2 times / day')}
                    className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-slate-100 font-medium text-slate-700"
                  >
                    Metformin 500mg
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('Lisinopril', 'Lisinopril', '10 mg', 'Once daily')}
                    className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-slate-100 font-medium text-slate-700"
                  >
                    Lisinopril 10mg
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('Amoxicillin', 'Amoxicillin', '500 mg', '3 times / day')}
                    className="text-[10px] px-2 py-0.5 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 font-medium text-rose-800"
                  >
                    Amoxicillin 500mg (Allergy Test)
                  </button>
                </div>
              </div>
            )}

            {/* Medicine Name & Generic Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Medicine Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setValidationError('');
                  }}
                  placeholder="e.g. Metformin, Lisinopril, Advil"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Generic / Active Ingredient
                </label>
                <input
                  type="text"
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  placeholder="e.g. Metformin HCl"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Strength, Dosage, Frequency (Required per prompt) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Strength <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={strength}
                  onChange={(e) => {
                    setStrength(e.target.value);
                    setValidationError('');
                  }}
                  placeholder="e.g. 500 mg, 10 mg"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dosage <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={dosage}
                  onChange={(e) => {
                    setDosage(e.target.value);
                    setValidationError('');
                  }}
                  placeholder="e.g. 1 tablet, 2 drops"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Frequency <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={frequency}
                  onChange={(e) => {
                    setFrequency(e.target.value);
                    setValidationError('');
                  }}
                  placeholder="e.g. Once daily, Every 8h"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Duration (Required per prompt) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Duration <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={duration}
                  onChange={(e) => {
                    setDuration(e.target.value);
                    setValidationError('');
                  }}
                  placeholder="e.g. 30 days, 7 days, Ongoing"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Prescribed By
                </label>
                <input
                  type="text"
                  value={prescribedBy}
                  onChange={(e) => setPrescribedBy(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Mehta, MD"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Instructions (Required per prompt) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Instructions & Timing <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Take with food in the morning to prevent gastric upset."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-medblue-600 hover:bg-medblue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-medblue-600/25 flex items-center space-x-2 transition-all active:scale-95"
              >
                <span>Review Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

        {/* STEP 2: REVIEW & CONFIRM */}
        {step === 'review' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
            
            <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-medblue-50/50 border border-medblue-200/80 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-medblue-700 block">
                    Prescription Summary
                  </span>
                  <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">{name}</h4>
                  <p className="text-xs text-slate-600 font-medium">{genericName || name}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-medblue-600 text-white shadow-xs">
                  {strength}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-medblue-100">
                <div className="bg-white/80 p-2.5 rounded-xl border border-sky-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Dosage</span>
                  <span className="font-bold text-slate-800 text-xs block mt-0.5">{dosage}</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-sky-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Frequency</span>
                  <span className="font-bold text-slate-800 text-xs block mt-0.5">{frequency}</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-sky-100 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Duration</span>
                  <span className="font-bold text-slate-800 text-xs block mt-0.5">{duration}</span>
                </div>
              </div>

              <div className="bg-white/90 p-3 rounded-xl border border-sky-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center space-x-1">
                  <FileText className="w-3 h-3 text-medblue-600" />
                  <span>Patient Instructions</span>
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {instructions}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Prescribed by: <strong className="text-slate-700">{prescribedBy}</strong></span>
                <span>Status: <strong className="text-emerald-700">Active</strong></span>
              </div>
            </div>

            {/* Automated Safety Check Notice */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start space-x-3 text-xs">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-900">Next Step: Automated Clinical Safety Check</span>
                <p className="mt-0.5 leading-relaxed text-slate-700">
                  Upon confirmation, <strong>{name}</strong> will be saved to your Medication Wallet, and MedGap will automatically run an instant safety audit against your recorded allergies, adverse reactions, and existing medications.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('entry')}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Edit</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmAndSave}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/25 flex items-center space-x-2 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Add to Wallet</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
