import React, { useState } from 'react';
import { ShieldAlert, X, Info } from 'lucide-react';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ compact = false }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  if (compact) {
    return (
      <div className="bg-sky-50 border-b border-sky-100 px-4 py-1.5 text-xs text-slate-600 flex items-center justify-between">
        <div className="flex items-center space-x-2 truncate">
          <Info className="w-3.5 h-3.5 text-medblue-600 shrink-0" />
          <span className="truncate">
            <strong className="text-slate-700">Safety Notice:</strong> MedGap is an informational safety alert tool, not a medical diagnostic or prescribing platform. Always consult a licensed healthcare professional.
          </span>
        </div>
        <button 
          onClick={() => setIsDismissed(true)} 
          className="text-slate-400 hover:text-slate-600 ml-2"
          aria-label="Dismiss banner"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-medblue-50 via-sky-50 to-teal-50 border-y border-sky-100/80 px-4 py-2.5 sm:px-6 shadow-soft-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="p-1.5 rounded-lg bg-medblue-100 text-medblue-700 mt-0.5 sm:mt-0 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            <strong className="font-semibold text-medblue-900">Clinical Medication Safety Notice:</strong>{' '}
            MedGap is a proactive <strong>medication safety alert system</strong>, not a clinical diagnostic or medicine-prescribing platform. AI analysis does not replace physicians. If a potential risk is detected, please consult a qualified healthcare professional.
          </p>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/50 transition-colors ml-3 shrink-0"
          title="Dismiss advisory"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
