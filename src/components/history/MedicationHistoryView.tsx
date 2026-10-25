import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  History, 
  Pill, 
  FileText, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  QrCode, 
  Filter, 
  Calendar,
  CheckCircle2,
  Activity,
  Bell
} from 'lucide-react';

export const MedicationHistoryView: React.FC = () => {
  const { timelineEvents, patientProfile, lifestyleHistory } = useApp();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEvents = timelineEvents.filter(evt => {
    if (filterType === 'all') return true;
    return evt.type === filterType;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Medication History & Timeline
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
              Auditable Log
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Chronological audit of prescription uploads, dose adjustments, and safety assessments for {patientProfile.fullName && patientProfile.fullName.trim() ? patientProfile.fullName.trim() : 'Patient'}.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-2xl border border-slate-200/90 shadow-card self-start sm:self-auto overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'all'
                ? 'bg-medblue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilterType('prescription')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'prescription'
                ? 'bg-medblue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Prescriptions
          </button>
          <button
            onClick={() => setFilterType('added')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'added'
                ? 'bg-medblue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Additions
          </button>
          <button
            onClick={() => setFilterType('discontinued')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'discontinued'
                ? 'bg-medblue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Discontinued
          </button>
        </div>
      </div>

      {/* Lifestyle & Substance History Profile Card */}
      {lifestyleHistory && lifestyleHistory.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Patient Lifestyle & Substance History
              </h3>
            </div>
            <span className="text-xs text-slate-400">Recorded in Patient Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {lifestyleHistory.map((item) => {
              const displayName = item.substanceType === 'Other' && item.customSubstanceName
                ? item.customSubstanceName
                : item.substanceType;

              return (
                <div key={item.id} className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/70 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{displayName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                  {item.notes && <p className="text-slate-500 text-[10px] italic">"{item.notes}"</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline Component */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-12 text-center max-w-lg mx-auto space-y-2">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No history events found</h3>
          <p className="text-xs text-slate-500">
            {filterType === 'all'
              ? 'Your medication audit log will automatically record prescription uploads, safety evaluations, and wallet updates.'
              : `No events match the "${filterType}" category.`}
          </p>
          {filterType !== 'all' && (
            <button
              onClick={() => setFilterType('all')}
              className="mt-3 px-4 py-1.5 text-xs font-semibold text-medblue-600 bg-sky-50 rounded-xl"
            >
              Show All Events
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 sm:p-8">
          <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-8 my-2">
            
            {filteredEvents.map(evt => {
              let icon = <Pill className="w-4 h-4 text-white" />;
              let markerBg = 'bg-medblue-600';

              if (evt.type === 'prescription') {
                icon = <FileText className="w-4 h-4 text-white" />;
                markerBg = 'bg-indigo-600';
              } else if (evt.type === 'discontinued') {
                icon = <Clock className="w-4 h-4 text-white" />;
                markerBg = 'bg-amber-600';
              } else if (evt.type === 'scan') {
                icon = <ShieldCheck className="w-4 h-4 text-white" />;
                markerBg = 'bg-teal-600';
              } else if (evt.type === 'shared') {
                icon = <QrCode className="w-4 h-4 text-white" />;
                markerBg = 'bg-slate-800';
              }

              return (
                <div key={evt.id} className="relative group">
                
                {/* Timeline Marker Point */}
                <div className={`absolute -left-[35px] sm:-left-[43px] top-1 w-8 h-8 rounded-xl ${markerBg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  {icon}
                </div>

                {/* Event Card */}
                <div className="p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                        {evt.date}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {evt.relativeTime}
                      </span>
                    </div>

                    {evt.metadata && (
                      <span className="self-start sm:self-auto px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-600">
                        {evt.metadata}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {evt.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

    </div>
  );
};
