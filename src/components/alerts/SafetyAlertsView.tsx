import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SafetyAlert, RiskSeverity, AlertStatus } from '../../types';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Eye,
  Check,
  RotateCcw,
  Sparkles,
  Search,
  Clock,
  Info,
  ExternalLink,
  ShieldCheck,
  X,
  ChevronRight
} from 'lucide-react';

type FilterTab = 'all' | 'high' | 'moderate' | 'low' | 'unreviewed' | 'resolved';

export const SafetyAlertsView: React.FC = () => {
  const { safetyAlerts, resolveSafetyAlert, addToast } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [selectedAlertForReview, setSelectedAlertForReview] = useState<SafetyAlert | null>(null);

  // Filter alerts
  const filteredAlerts = safetyAlerts.filter((alert) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'high') return alert.severity === 'High';
    if (activeFilter === 'moderate') return alert.severity === 'Moderate';
    if (activeFilter === 'low') return alert.severity === 'Low' || alert.severity === 'Info';
    if (activeFilter === 'unreviewed') return !alert.resolved && alert.status !== 'Reviewed';
    if (activeFilter === 'resolved') return alert.resolved || alert.status === 'Resolved';
    return true;
  });

  const highCount = safetyAlerts.filter((a) => a.severity === 'High' && !a.resolved).length;
  const modCount = safetyAlerts.filter((a) => a.severity === 'Moderate' && !a.resolved).length;
  const unreviewedCount = safetyAlerts.filter((a) => !a.resolved).length;

  const handleMarkReviewed = (alert: SafetyAlert) => {
    addToast('Alert Reviewed', `Marked "${alert.title}" as clinically reviewed.`, 'info');
  };

  const handleResolve = (alert: SafetyAlert) => {
    resolveSafetyAlert(alert.id);
    addToast('Alert Resolved', `Safety alert marked as resolved.`, 'success');
    if (selectedAlertForReview?.id === alert.id) {
      setSelectedAlertForReview(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Safety Alert Center
              </h1>
              <p className="text-sm text-slate-500">
                Pharmacovigilance monitoring for drug interactions, therapeutic duplicates, and allergy contraindications
              </p>
            </div>
          </div>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center gap-2">
          {highCount > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
              🔴 {highCount} High Priority
            </span>
          )}
          {modCount > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              🟡 {modCount} Moderate
            </span>
          )}
          {unreviewedCount === 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All Reviewed</span>
            </span>
          )}
        </div>
      </div>

      {/* Mandatory Clinical Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-950 flex items-start space-x-3 shadow-soft-sm">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <p className="font-bold text-amber-900">Important Medical Safety Rule</p>
          <p className="mt-0.5 text-slate-700 leading-relaxed">
            "This is a potential safety alert, not a diagnosis or prescription recommendation. Consult a qualified healthcare professional before making medication changes."
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm border-b border-slate-200">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all shrink-0 ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Alerts ({safetyAlerts.length})
        </button>

        <button
          onClick={() => setActiveFilter('high')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all shrink-0 flex items-center space-x-1.5 ${
            activeFilter === 'high'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>High Severity</span>
        </button>

        <button
          onClick={() => setActiveFilter('moderate')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all shrink-0 flex items-center space-x-1.5 ${
            activeFilter === 'moderate'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Moderate Severity</span>
        </button>

        <button
          onClick={() => setActiveFilter('low')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all shrink-0 ${
            activeFilter === 'low'
              ? 'bg-slate-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Low / Info
        </button>

        <button
          onClick={() => setActiveFilter('unreviewed')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all shrink-0 ${
            activeFilter === 'unreviewed'
              ? 'bg-medblue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Unreviewed ({unreviewedCount})
        </button>

        <button
          onClick={() => setActiveFilter('resolved')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all shrink-0 ${
            activeFilter === 'resolved'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Resolved
        </button>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-4">No Alerts Matching Filter</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            There are no safety alerts matching the selected category. Active pharmacovigilance monitors your prescriptions 24/7.
          </p>
          <button
            onClick={() => setActiveFilter('all')}
            className="mt-4 px-4 py-2 text-xs font-semibold text-medblue-600 bg-medblue-50 hover:bg-medblue-100 rounded-xl"
          >
            Show All Alerts
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const isResolved = alert.resolved || alert.status === 'Resolved';
            const isHigh = alert.severity === 'High';
            const isMod = alert.severity === 'Moderate';

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border transition-all shadow-card hover:shadow-soft-md ${
                  isResolved
                    ? 'bg-slate-50/70 border-slate-200 opacity-75'
                    : isHigh
                    ? 'bg-white border-rose-200 hover:border-rose-300'
                    : isMod
                    ? 'bg-white border-amber-200 hover:border-amber-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Icon & Core Details */}
                  <div className="flex items-start space-x-3.5 flex-1">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        isResolved
                          ? 'bg-emerald-100 text-emerald-700'
                          : isHigh
                          ? 'bg-rose-100 text-rose-700'
                          : isMod
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-sky-100 text-sky-700'
                      }`}
                    >
                      {isResolved ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isHigh
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : isMod
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {alert.severity} Risk
                        </span>

                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {alert.type}
                        </span>

                        <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{alert.timestamp}</span>
                        </span>

                        {isResolved && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Resolved
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{alert.title}</h3>

                      {/* Medicines Involved */}
                      <div className="flex items-center space-x-2 text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Medicines Involved:</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-slate-900 font-bold">
                          {alert.medicineA || alert.newMedicine}
                        </span>
                        {(alert.medicineB || alert.conflictingMedicine) && (
                          <>
                            <span className="text-slate-400">↔</span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-slate-900 font-bold">
                              {alert.medicineB || alert.conflictingMedicine}
                            </span>
                          </>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                        {alert.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => setSelectedAlertForReview(alert)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review Details</span>
                    </button>

                    {!isResolved && (
                      <>
                        <button
                          onClick={() => handleMarkReviewed(alert)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-medblue-700 border border-sky-200 transition-colors flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Reviewed</span>
                        </button>

                        <button
                          onClick={() => handleResolve(alert)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal Dialog */}
      {selectedAlertForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/30 text-rose-300">
                    {selectedAlertForReview.severity} Risk Alert
                  </span>
                  <h3 className="text-lg font-bold mt-1 text-white">{selectedAlertForReview.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlertForReview(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs sm:text-sm">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Identified Contrast</span>
                <p className="font-bold text-slate-900 mt-1">
                  {selectedAlertForReview.medicineA || selectedAlertForReview.newMedicine}
                  {selectedAlertForReview.medicineB && ` Concurrently with ${selectedAlertForReview.medicineB}`}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800">Pharmacological Rationale & Impact</h4>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  {selectedAlertForReview.clinicalRationale || selectedAlertForReview.description}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
                <h4 className="font-bold text-amber-900 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Clinical Recommendation</span>
                </h4>
                <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                  {selectedAlertForReview.recommendation ||
                    'Potential medication interaction identified. Please consult a qualified healthcare professional before making medication changes.'}
                </p>
              </div>

              <p className="text-[11px] text-slate-400 text-center italic">
                MedGap records all safety alerts for clinical review. Decisions remain with qualified prescribers.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedAlertForReview(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => handleResolve(selectedAlertForReview)}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center space-x-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Alert as Resolved</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
