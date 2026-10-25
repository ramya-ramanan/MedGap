import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Medication, MedicationStatus } from '../../types';
import { AddEditMedicineModal } from './AddEditMedicineModal';
import { MedicineDetailModal } from './MedicineDetailModal';
import { 
  Pill, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  User, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const MedicationWalletView: React.FC = () => {
  const navigate = useNavigate();
  const { 
    medications, 
    addMedication, 
    updateMedication, 
    deleteMedication, 
    toggleMedicationStatus,
    searchQuery,
    setSearchQuery 
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Discontinued'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [inspectingMedication, setInspectingMedication] = useState<Medication | null>(null);

  // Filter & search logic
  const filteredMeds = medications.filter(med => {
    const matchesFilter = 
      filterStatus === 'All' ? true : 
      filterStatus === 'Active' ? med.status === 'Active' : 
      med.status === 'Discontinued';

    const matchesSearch = 
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.indication.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.prescribedBy.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const activeCount = medications.filter(m => m.status === 'Active').length;
  const discontinuedCount = medications.filter(m => m.status === 'Discontinued').length;

  const handleOpenAdd = () => {
    setEditingMedication(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (med: Medication) => {
    setEditingMedication(med);
    setIsAddModalOpen(true);
  };

  const handleSaveMedication = (medData: Omit<Medication, 'id'>) => {
    if (editingMedication) {
      updateMedication(editingMedication.id, medData);
    } else {
      addMedication(medData);
      // Flow requirement: Manual Entry → Review → Confirm → Wallet → Safety Check
      navigate('/safety-checker', {
        state: {
          autoCheckMedicine: {
            name: medData.name,
            strength: medData.strength,
            dosage: medData.dosage,
            frequency: medData.frequency
          }
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Add Medicine Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Medication Wallet
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-medblue-100 text-medblue-800">
              {activeCount} Active
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage your daily therapeutic regimens, strengths, schedules, and active doctor records.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-medblue-600 hover:bg-medblue-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-medblue-600/25 transition-all flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Medicine</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by brand name, generic, or doctor..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none transition-all"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto self-start">
          <button
            onClick={() => setFilterStatus('All')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'All'
                ? 'bg-white text-slate-900 shadow-soft-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({medications.length})
          </button>
          <button
            onClick={() => setFilterStatus('Active')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'Active'
                ? 'bg-white text-emerald-800 shadow-soft-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus('Discontinued')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'Discontinued'
                ? 'bg-white text-slate-800 shadow-soft-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Discontinued ({discontinuedCount})
          </button>
        </div>

      </div>

      {/* Medication Cards Grid */}
      {filteredMeds.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No medicines found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No medications match your current search query or filter selection.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setFilterStatus('All'); }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-medblue-600 hover:text-medblue-800 bg-sky-50 rounded-xl"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredMeds.map(med => {
            const isActive = med.status === 'Active';

            return (
              <div
                key={med.id}
                className={`rounded-3xl border p-5 flex flex-col justify-between transition-all group ${
                  isActive 
                    ? 'bg-white border-slate-200/80 shadow-card hover:shadow-soft-md' 
                    : 'bg-slate-50/80 border-slate-200 text-slate-600'
                }`}
              >
                <div>
                  {/* Top line: Name + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-medblue-700 transition-colors">
                        {med.name}
                      </h3>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        {med.genericName}
                      </p>
                    </div>

                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {med.status}
                    </span>
                  </div>

                  {/* Badges / Metrics */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-left">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Strength</span>
                      <span className="text-xs font-bold text-slate-900 block truncate">{med.strength}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Dose</span>
                      <span className="text-xs font-bold text-slate-900 block truncate">{med.dosage}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Frequency</span>
                      <span className="text-xs font-bold text-slate-900 block truncate" title={med.frequency}>
                        {med.frequency}
                      </span>
                    </div>
                  </div>

                  {/* Timing & Indication */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{med.timing || 'As scheduled'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Prescribed by {med.prescribedBy}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>Started {med.startDate}{med.endDate && ` • Stopped ${med.endDate}`}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setInspectingMedication(med)}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-medblue-600 hover:text-medblue-800"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(med)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Medicine"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleMedicationStatus(med.id)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title={isActive ? 'Mark as Discontinued' : 'Reactivate'}
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMedication(med.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove from Wallet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddEditMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveMedication}
        editingMedication={editingMedication}
      />

      {/* Detail Inspection Modal */}
      <MedicineDetailModal
        medication={inspectingMedication}
        onClose={() => setInspectingMedication(null)}
        onEdit={(med) => handleOpenEdit(med)}
        onToggleStatus={(id) => toggleMedicationStatus(id)}
      />

    </div>
  );
};
