import React from 'react';
import { Medication } from '../../types';
import { X, Pill, ShieldCheck, Calendar, User, Clock, AlertCircle, Info, Stethoscope } from 'lucide-react';

interface MedicineDetailModalProps {
  medication: Medication | null;
  onClose: () => void;
  onEdit: (med: Medication) => void;
  onToggleStatus: (id: string) => void;
}

export const MedicineDetailModal: React.FC<MedicineDetailModalProps> = ({
  medication,
  onClose,
  onEdit,
  onToggleStatus,
}) => {
  if (!medication) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-medblue-900 to-slate-900 text-white flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-sky-400 shrink-0">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  medication.status === 'Active' 
                    ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' 
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {medication.status} Regimen
                </span>
                <span className="text-xs text-slate-300">{medication.category || 'Therapeutic'}</span>
              </div>
              <h2 className="text-xl font-black mt-1">{medication.name}</h2>
              <p className="text-xs text-sky-300 font-mono mt-0.5">{medication.genericName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Strength</span>
              <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{medication.strength}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Dosage Form</span>
              <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{medication.dosage}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Schedule</span>
              <span className="text-base font-extrabold text-slate-900 mt-0.5 block truncate" title={medication.frequency}>
                {medication.frequency}
              </span>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-3.5">
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <Clock className="w-4 h-4 text-medblue-600 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold text-slate-900 text-xs">Timing & Administration</span>
                <p className="text-slate-600 mt-0.5">{medication.timing || 'As directed by physician'}</p>
                {medication.instructions && (
                  <p className="text-slate-500 text-xs mt-1 italic">{medication.instructions}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <Info className="w-4 h-4 text-medteal-600 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold text-slate-900 text-xs">Clinical Indication</span>
                <p className="text-slate-600 mt-0.5">{medication.indication}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <Stethoscope className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold text-slate-900 text-xs">Prescribing Healthcare Provider</span>
                <p className="text-slate-600 mt-0.5">{medication.prescribedBy}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold text-slate-900 text-xs">Dates of Therapy</span>
                <p className="text-slate-600 mt-0.5">
                  Started: {medication.startDate}
                  {medication.endDate && ` • Discontinued: ${medication.endDate}`}
                </p>
              </div>
            </div>
          </div>

          {/* Clinical safety note */}
          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-slate-700 text-xs leading-relaxed">
            <strong className="text-medblue-900 font-semibold">Active Safety Shield:</strong> This medication is continuously monitored in your MedGap wallet against all new prescriptions and known allergies (Penicillin).
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onToggleStatus(medication.id);
              onClose();
            }}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
              medication.status === 'Active'
                ? 'border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100'
                : 'border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            {medication.status === 'Active' ? 'Mark Discontinued' : 'Mark Active'}
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                onEdit(medication);
                onClose();
              }}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Edit Details
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
