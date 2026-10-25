import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  SubstanceType, 
  SubstanceStatus, 
  DurationUnit, 
  LifestyleSubstanceItem, 
  MedicationReminderItem,
  AdverseReaction
} from '../../types';
import { reminderService } from '../../services/reminderService';
import { 
  Settings, 
  ShieldCheck, 
  Bell, 
  Lock, 
  User, 
  RotateCcw, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Shield,
  Database,
  Cloud,
  Copy,
  Check,
  ExternalLink,
  KeyRound,
  Server,
  Pill,
  Heart,
  Plus,
  Trash2,
  Edit3,
  X,
  Volume2,
  Calendar,
  Clock,
  Cigarette,
  Wine,
  Activity,
  AlertCircle,
  Sparkles
} from 'lucide-react';

type SettingsTab = 'profile' | 'allergies' | 'lifestyle' | 'reminders' | 'backend';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const SettingsView: React.FC = () => {
  const navigate = useNavigate();
  const { 
    patientProfile, 
    updatePatientProfile,
    medications,
    adverseReactions,
    addAdverseReaction,
    removeAdverseReaction,
    lifestyleHistory,
    addLifestyleItem,
    updateLifestyleItem,
    removeLifestyleItem,
    reminders,
    addReminder,
    updateReminder,
    removeReminder,
    toggleReminder,
    resetToDemoData, 
    logout,
    addToast,
    isSupabaseConnected,
    supabaseConfig,
    setSupabaseCredentials,
    disconnectSupabase,
    isDemoMode
  } = useApp();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // 1. Personal Details Form State
  const [fullName, setFullName] = useState(patientProfile.fullName || '');
  const [age, setAge] = useState(patientProfile.age || 52);
  const [gender, setGender] = useState(patientProfile.gender || 'Male');
  const [bloodGroup, setBloodGroup] = useState(patientProfile.bloodGroup || 'O+');
  const [phone, setPhone] = useState(patientProfile.phone || '');
  const [email, setEmail] = useState(patientProfile.email || '');
  const [primaryPhysician, setPrimaryPhysician] = useState(patientProfile.primaryCarePhysician || '');
  const [emergencyName, setEmergencyName] = useState(patientProfile.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(patientProfile.emergencyContact?.phone || '');
  const [emergencyRelation, setEmergencyRelation] = useState(patientProfile.emergencyContact?.relationship || 'Spouse');

  // 2. Allergies & ADR Form State
  const [newAllergyInput, setNewAllergyInput] = useState('');
  const [isAddingAdr, setIsAddingAdr] = useState(false);
  const [adrMedName, setAdrMedName] = useState('');
  const [adrReaction, setAdrReaction] = useState('');
  const [adrSeverity, setAdrSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');
  const [adrNotes, setAdrNotes] = useState('');

  // 3. Lifestyle & Substance History Form State
  const [isLifestyleModalOpen, setIsLifestyleModalOpen] = useState(false);
  const [editingLifestyleId, setEditingLifestyleId] = useState<string | null>(null);
  const [substanceType, setSubstanceType] = useState<SubstanceType>('Smoking');
  const [customSubstanceName, setCustomSubstanceName] = useState('');
  const [substanceStatus, setSubstanceStatus] = useState<SubstanceStatus>('Current');
  const [durationValue, setDurationValue] = useState<number>(5);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('years');
  const [quitDurationValue, setQuitDurationValue] = useState<number>(1);
  const [quitDurationUnit, setQuitDurationUnit] = useState<DurationUnit>('years');
  const [substanceNotes, setSubstanceNotes] = useState('');

  // 4. Medication Reminders Form State
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [reminderMedName, setReminderMedName] = useState('');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [reminderDosage, setReminderDosage] = useState('1 tablet');
  const [reminderDays, setReminderDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [reminderNotes, setReminderNotes] = useState('Take with water after breakfast');

  // 5. Supabase Config State
  const [supabaseUrl, setSupabaseUrl] = useState(supabaseConfig.url || '');
  const [supabaseKey, setSupabaseKey] = useState(supabaseConfig.anonKey || '');
  const [isConnecting, setIsConnecting] = useState(false);

  // --- Handlers: Personal Details ---
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatientProfile({
      fullName,
      age: Number(age),
      gender,
      bloodGroup,
      phone,
      email,
      primaryCarePhysician: primaryPhysician,
      emergencyContact: {
        name: emergencyName,
        phone: emergencyPhone,
        relationship: emergencyRelation
      }
    });
    addToast('Profile Updated', 'Personal details and emergency contact saved successfully.', 'success');
  };

  // --- Handlers: Allergies & ADR ---
  const handleAddAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newAllergyInput.trim();
    if (!clean) return;
    if (patientProfile.knownAllergies.some(a => a.toLowerCase() === clean.toLowerCase())) {
      addToast('Allergy Exists', `${clean} is already recorded.`, 'warning');
      return;
    }
    const updated = [...patientProfile.knownAllergies, clean];
    updatePatientProfile({ knownAllergies: updated });
    setNewAllergyInput('');
    addToast('Allergy Recorded', `Added ${clean} to known allergies.`, 'success');
  };

  const handleRemoveAllergy = (allergyToRemove: string) => {
    const updated = patientProfile.knownAllergies.filter(a => a !== allergyToRemove);
    updatePatientProfile({ knownAllergies: updated });
    addToast('Allergy Removed', `Removed ${allergyToRemove} from profile.`, 'info');
  };

  const handleSaveAdr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adrMedName.trim() || !adrReaction.trim()) {
      addToast('Incomplete Form', 'Please provide medicine name and reaction description.', 'warning');
      return;
    }
    addAdverseReaction({
      medicineName: adrMedName.trim(),
      reaction: adrReaction.trim(),
      severity: adrSeverity,
      dateRecorded: new Date().toISOString().split('T')[0],
      notes: adrNotes.trim()
    });
    setAdrMedName('');
    setAdrReaction('');
    setAdrNotes('');
    setIsAddingAdr(false);
    addToast('Adverse Reaction Saved', 'Recorded side effect added to patient medical history.', 'success');
  };

  // --- Handlers: Lifestyle & Substance History ---
  const handleOpenAddLifestyle = () => {
    setEditingLifestyleId(null);
    setSubstanceType('Smoking');
    setCustomSubstanceName('');
    setSubstanceStatus('Current');
    setDurationValue(5);
    setDurationUnit('years');
    setQuitDurationValue(1);
    setQuitDurationUnit('years');
    setSubstanceNotes('');
    setIsLifestyleModalOpen(true);
  };

  const handleOpenEditLifestyle = (item: LifestyleSubstanceItem) => {
    setEditingLifestyleId(item.id);
    setSubstanceType(item.substanceType);
    setCustomSubstanceName(item.customSubstanceName || '');
    setSubstanceStatus(item.status);
    setDurationValue(item.durationValue || 1);
    setDurationUnit(item.durationUnit || 'years');
    setQuitDurationValue(item.quitDurationValue || 1);
    setQuitDurationUnit(item.quitDurationUnit || 'years');
    setSubstanceNotes(item.notes || '');
    setIsLifestyleModalOpen(true);
  };

  const handleSaveLifestyle = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemData = {
      substanceType,
      customSubstanceName: substanceType === 'Other' ? customSubstanceName.trim() : undefined,
      status: substanceStatus,
      durationValue: substanceStatus !== 'Never' ? Number(durationValue) : undefined,
      durationUnit: substanceStatus !== 'Never' ? durationUnit : undefined,
      quitDurationValue: substanceStatus === 'Past' ? Number(quitDurationValue) : undefined,
      quitDurationUnit: substanceStatus === 'Past' ? quitDurationUnit : undefined,
      notes: substanceNotes.trim(),
      updatedAt: new Date().toISOString()
    };

    if (editingLifestyleId) {
      await updateLifestyleItem(editingLifestyleId, itemData);
      addToast('History Updated', 'Lifestyle and substance record updated in Supabase.', 'success');
    } else {
      await addLifestyleItem(itemData);
      addToast('History Recorded', 'New substance history record securely saved in Supabase.', 'success');
    }

    setIsLifestyleModalOpen(false);
  };

  const handleDeleteLifestyle = async (id: string) => {
    await removeLifestyleItem(id);
    addToast('Record Removed', 'Substance history item removed.', 'info');
  };

  // --- Handlers: Reminders & Notifications ---
  const handleOpenAddReminder = () => {
    setEditingReminderId(null);
    const defaultMed = medications.find(m => m.status === 'Active')?.name || '';
    setReminderMedName(defaultMed);
    setReminderTime('08:00');
    setReminderDosage('1 tablet');
    setReminderDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    setReminderNotes('Take after breakfast');
    setIsReminderModalOpen(true);
  };

  const handleOpenEditReminder = (item: MedicationReminderItem) => {
    setEditingReminderId(item.id);
    setReminderMedName(item.medicineName);
    setReminderTime(item.reminderTime);
    setReminderDosage(item.dosage || '1 tablet');
    setReminderDays(item.daysOfWeek || DAYS_OF_WEEK);
    setReminderNotes(item.notes || '');
    setIsReminderModalOpen(true);
  };

  const handleToggleDay = (day: string) => {
    setReminderDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  const handleSaveReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderMedName.trim()) {
      addToast('Medicine Required', 'Please select or enter a medicine name.', 'warning');
      return;
    }
    if (reminderDays.length === 0) {
      addToast('Select Days', 'Please select at least one day of the week.', 'warning');
      return;
    }

    const payload = {
      medicineName: reminderMedName.trim(),
      reminderTime,
      dosage: reminderDosage.trim(),
      daysOfWeek: reminderDays,
      notes: reminderNotes.trim(),
      isEnabled: true
    };

    if (editingReminderId) {
      await updateReminder(editingReminderId, payload);
      addToast('Reminder Updated', `Updated schedule for ${reminderMedName} at ${reminderTime}.`, 'success');
    } else {
      await addReminder(payload);
      addToast('Reminder Scheduled', `Reminder created for ${reminderMedName} at ${reminderTime}.`, 'success');
    }

    // Proactively request browser notification permission
    reminderService.requestNotificationPermission();
    setIsReminderModalOpen(false);
  };

  const handleDeleteReminder = async (id: string) => {
    await removeReminder(id);
    addToast('Reminder Removed', 'Scheduled reminder deleted.', 'info');
  };

  const handleTriggerTestChime = async () => {
    await reminderService.requestNotificationPermission();
    reminderService.playNotificationSound();
    reminderService.sendBrowserNotification(
      '💊 MedGap Scheduled Reminder (Test)',
      'Time to take your scheduled dose: Metformin 500 mg. (With meal)'
    );
    addToast('Notification & Audio Test', 'Dispatched test browser alert and synthesized Web Audio chime.', 'success');
  };

  // --- Handlers: Supabase Connect ---
  const handleConnectSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      addToast('Missing Credentials', 'Please provide both Supabase Project URL and Anon Key.', 'warning');
      return;
    }
    setIsConnecting(true);
    try {
      const success = await setSupabaseCredentials(supabaseUrl, supabaseKey);
      if (!success) {
        addToast('Connection Notice', 'Check Supabase URL and Anon Key and verify tables in schema.sql.', 'warning');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Settings & Patient Health Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage personal demographics, allergies & side effects, lifestyle & substance history, medication reminders, and Supabase cloud sync.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'profile'
              ? 'bg-white text-medblue-700 shadow-soft-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal Details</span>
        </button>

        <button
          onClick={() => setActiveTab('allergies')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'allergies'
              ? 'bg-white text-rose-700 shadow-soft-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Allergies & ADRs ({patientProfile.knownAllergies?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('lifestyle')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'lifestyle'
              ? 'bg-white text-amber-700 shadow-soft-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Lifestyle & Substances ({lifestyleHistory?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'reminders'
              ? 'bg-white text-medblue-700 shadow-soft-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Reminders & Notifications ({reminders?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('backend')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'backend'
              ? 'bg-white text-emerald-700 shadow-soft-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Supabase & Demo</span>
        </button>
      </div>

      {/* ==================== TAB 1: PERSONAL DETAILS ==================== */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Personal & Clinical Details</h3>
              <p className="text-xs text-slate-500">Edit demographic profile, emergency contacts, and primary physician.</p>
            </div>
            <span className="px-3 py-1 bg-medblue-50 text-medblue-800 text-xs font-bold rounded-xl border border-medblue-200">
              Patient ID: {patientProfile.id || 'PT-59201'}
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Age (Years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  min={1}
                  max={120}
                  required
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none font-bold text-rose-700"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Primary Care Physician</label>
                <input
                  type="text"
                  value={primaryPhysician}
                  onChange={(e) => setPrimaryPhysician(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Mehta, MD (Internal Medicine)"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Emergency Contact Information</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600">Contact Name</label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-medblue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600">Relationship</label>
                  <input
                    type="text"
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-medblue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600">Emergency Phone</label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-medblue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-medblue-600 hover:bg-medblue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-medblue-600/25 active:scale-95 transition-all flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Personal Details</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== TAB 2: ALLERGIES & ADRS ==================== */}
      {activeTab === 'allergies' && (
        <div className="space-y-6">
          {/* Known Drug Allergies */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recorded Medicine Allergies</h3>
                <p className="text-xs text-slate-500">
                  Critical safety flags used by Safety Checker to prevent anaphylaxis and severe drug hypersensitivity.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-rose-50 text-rose-800 text-xs font-bold rounded-xl border border-rose-200">
                {patientProfile.knownAllergies?.length || 0} Recorded
              </span>
            </div>

            {/* Current Allergy Badges */}
            <div className="flex flex-wrap gap-2.5">
              {patientProfile.knownAllergies?.map((allergy) => (
                <div
                  key={allergy}
                  className="flex items-center space-x-2 px-3.5 py-2 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 shadow-sm"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>{allergy}</span>
                  <button
                    onClick={() => handleRemoveAllergy(allergy)}
                    className="p-0.5 hover:bg-rose-200 rounded-full transition-colors text-rose-600"
                    title="Remove allergy"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {(!patientProfile.knownAllergies || patientProfile.knownAllergies.length === 0) && (
                <p className="text-xs text-slate-400 italic">No drug allergies currently recorded.</p>
              )}
            </div>

            {/* Add Allergy Input */}
            <form onSubmit={handleAddAllergy} className="flex items-center space-x-2 max-w-md pt-2">
              <input
                type="text"
                value={newAllergyInput}
                onChange={(e) => setNewAllergyInput(e.target.value)}
                placeholder="Add allergy (e.g., Sulfa drugs, Cephalosporins)..."
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-rose-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                + Add Allergy
              </button>
            </form>
          </div>

          {/* Recorded Adverse Drug Reactions / Side Effects */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recorded Side Effects & Adverse Drug Reactions (ADRs)</h3>
                <p className="text-xs text-slate-500">
                  Track previous adverse events (rashes, GI bleeding, severe dizziness) to avoid re-prescription.
                </p>
              </div>
              <button
                onClick={() => setIsAddingAdr(true)}
                className="px-4 py-2 bg-medblue-600 hover:bg-medblue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Record Side Effect</span>
              </button>
            </div>

            {/* Form to Add ADR */}
            {isAddingAdr && (
              <form onSubmit={handleSaveAdr} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">New Adverse Drug Reaction Form</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingAdr(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Offending Medicine</label>
                    <input
                      type="text"
                      value={adrMedName}
                      onChange={(e) => setAdrMedName(e.target.value)}
                      placeholder="e.g. Penicillin V, Codeine"
                      required
                      className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-medblue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Reaction / Symptoms</label>
                    <input
                      type="text"
                      value={adrReaction}
                      onChange={(e) => setAdrReaction(e.target.value)}
                      placeholder="e.g. Hives, facial swelling, vomiting"
                      required
                      className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-medblue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Severity</label>
                    <select
                      value={adrSeverity}
                      onChange={(e) => setAdrSeverity(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-medblue-500"
                    >
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600">Clinical Notes</label>
                  <input
                    type="text"
                    value={adrNotes}
                    onChange={(e) => setAdrNotes(e.target.value)}
                    placeholder="e.g. Required ER visit and antihistamine injection in 2022"
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-medblue-500"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAdr(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-medblue-600 hover:bg-medblue-700 rounded-xl"
                  >
                    Save Reaction
                  </button>
                </div>
              </form>
            )}

            {/* List of ADRs */}
            <div className="space-y-3">
              {adverseReactions.map((adr) => (
                <div
                  key={adr.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-soft-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900">{adr.medicineName}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        adr.severity === 'Severe' 
                          ? 'bg-rose-100 text-rose-800' 
                          : adr.severity === 'Moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        {adr.severity} Severity
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">
                      <strong>Reaction:</strong> {adr.reaction}
                    </p>
                    {adr.notes && <p className="text-xs text-slate-500">Note: {adr.notes}</p>}
                  </div>

                  <button
                    onClick={() => removeAdverseReaction(adr.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all self-end sm:self-center"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: LIFESTYLE & SUBSTANCE HISTORY ==================== */}
      {activeTab === 'lifestyle' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold text-slate-900">Lifestyle & Substance History</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Record smoking, alcohol, tobacco, or other substances with status, duration, and time since quitting. Securely stored per patient in Supabase and displayed in medical history / doctor QR view.
              </p>
            </div>

            <button
              onClick={handleOpenAddLifestyle}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 active:scale-95 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Record Substance History</span>
            </button>
          </div>

          {/* Substance History List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lifestyleHistory.map((item) => {
              const displayName = item.substanceType === 'Other' && item.customSubstanceName
                ? item.customSubstanceName
                : item.substanceType;

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 shadow-soft-sm hover:shadow-card transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">
                          {item.substanceType === 'Smoking' ? '🚬' : item.substanceType === 'Alcohol' ? '🍷' : item.substanceType === 'Tobacco' ? '🌿' : '🏷️'}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{displayName}</h4>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {item.substanceType} Record
                          </span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.status === 'Current'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : item.status === 'Past'
                            ? 'bg-medblue-100 text-medblue-800 border border-medblue-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {item.status} User
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-1">
                      {item.status !== 'Never' && item.durationValue && (
                        <p>
                          <strong>Duration:</strong> {item.durationValue} {item.durationUnit}
                        </p>
                      )}
                      {item.status === 'Past' && item.quitDurationValue && (
                        <p className="text-medblue-800 font-semibold">
                          <strong>Time Since Quitting:</strong> {item.quitDurationValue} {item.quitDurationUnit} ago
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-slate-500 italic bg-slate-100/70 p-2 rounded-xl text-[11px]">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      Sync: Supabase RLS Active
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditLifestyle(item)}
                        className="p-1.5 text-slate-500 hover:text-medblue-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit entry"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLifestyle(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {lifestyleHistory.length === 0 && (
              <div className="md:col-span-2 p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-sm font-semibold text-slate-600">No lifestyle or substance history recorded.</p>
                <button
                  onClick={handleOpenAddLifestyle}
                  className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow"
                >
                  + Record Smoking / Alcohol / Substance History
                </button>
              </div>
            )}
          </div>

          {/* Modal to Add / Edit Lifestyle Item */}
          {isLifestyleModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">
                    {editingLifestyleId ? 'Edit Substance Record' : 'Record Lifestyle & Substance History'}
                  </h3>
                  <button
                    onClick={() => setIsLifestyleModalOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveLifestyle} className="space-y-4">
                  {/* Substance Type */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Substance Type
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['Smoking', 'Alcohol', 'Tobacco', 'Other'] as SubstanceType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSubstanceType(type)}
                          className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                            substanceType === type
                              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* If Other: Custom Name */}
                  {substanceType === 'Other' && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Substance / Habit Name</label>
                      <input
                        type="text"
                        value={customSubstanceName}
                        onChange={(e) => setCustomSubstanceName(e.target.value)}
                        placeholder="e.g. Betel nut / Areca, Vaping, Cannabis, Caffeine"
                        required
                        className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}

                  {/* Status: Current / Past / Never */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Usage Status
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Current', 'Past', 'Never'] as SubstanceStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setSubstanceStatus(st)}
                          className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                            substanceStatus === st
                              ? st === 'Current'
                                ? 'bg-rose-600 text-white border-rose-600'
                                : st === 'Past'
                                  ? 'bg-medblue-600 text-white border-medblue-600'
                                  : 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration (if not Never) */}
                  {substanceStatus !== 'Never' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Duration</label>
                        <input
                          type="number"
                          value={durationValue}
                          onChange={(e) => setDurationValue(Number(e.target.value))}
                          min={1}
                          required
                          className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Unit</label>
                        <select
                          value={durationUnit}
                          onChange={(e) => setDurationUnit(e.target.value as DurationUnit)}
                          className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500"
                        >
                          <option value="days">Days</option>
                          <option value="months">Months</option>
                          <option value="years">Years</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Time since quitting (if Past) */}
                  {substanceStatus === 'Past' && (
                    <div className="p-3 bg-medblue-50/70 border border-medblue-200 rounded-2xl space-y-2">
                      <span className="text-xs font-bold text-medblue-900 block">
                        If stopped, time since quitting:
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Stopped</label>
                          <input
                            type="number"
                            value={quitDurationValue}
                            onChange={(e) => setQuitDurationValue(Number(e.target.value))}
                            min={1}
                            required
                            className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-medblue-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Unit</label>
                          <select
                            value={quitDurationUnit}
                            onChange={(e) => setQuitDurationUnit(e.target.value as DurationUnit)}
                            className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-medblue-500"
                          >
                            <option value="days">Days ago</option>
                            <option value="months">Months ago</option>
                            <option value="years">Years ago</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Clinical Notes / Frequency</label>
                    <textarea
                      value={substanceNotes}
                      onChange={(e) => setSubstanceNotes(e.target.value)}
                      placeholder="e.g. 1 pack daily, social beer on weekends, quit after cardiac stent"
                      rows={2}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsLifestyleModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-all"
                    >
                      Save to Supabase
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 4: MEDICATION REMINDERS & NOTIFICATIONS ==================== */}
      {activeTab === 'reminders' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-medblue-600" />
                <h3 className="text-lg font-bold text-slate-900">Medication Reminders & Scheduled Alerts</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Set reminder times for each medicine. Sends native browser notifications and dual-tone audio chimes at scheduled dosage times.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleTriggerTestChime}
                className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-medblue-800 border border-medblue-200 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5"
                title="Test audio chime and browser notification"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Audio & Notification</span>
              </button>

              <button
                onClick={handleOpenAddReminder}
                className="px-4 py-2 bg-medblue-600 hover:bg-medblue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-medblue-600/25 active:scale-95 transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Set Reminder</span>
              </button>
            </div>
          </div>

          {/* Reminder Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  rem.isEnabled
                    ? 'bg-white border-medblue-200 shadow-soft-sm hover:border-medblue-300'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-9 h-9 rounded-xl bg-medblue-50 text-medblue-700 flex items-center justify-center font-bold">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{rem.medicineName}</h4>
                        <span className="text-xs font-mono font-bold text-medblue-600">
                          ⏰ {rem.reminderTime}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleReminder(rem.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                        rem.isEnabled
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {rem.isEnabled ? '🔔 Active' : '🔕 Paused'}
                    </button>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p>
                      <strong>Dosage:</strong> {rem.dosage || '1 dose'}
                    </p>
                    {rem.notes && <p className="text-slate-500 italic text-[11px]">"{rem.notes}"</p>}

                    <div className="flex flex-wrap gap-1 pt-1">
                      {DAYS_OF_WEEK.map((day) => (
                        <span
                          key={day}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            rem.daysOfWeek.includes(day)
                              ? 'bg-medblue-100 text-medblue-800'
                              : 'bg-slate-100 text-slate-300'
                          }`}
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Browser & Chime alert scheduled
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditReminder(rem)}
                      className="p-1.5 text-slate-500 hover:text-medblue-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit reminder"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(rem.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {reminders.length === 0 && (
              <div className="md:col-span-2 p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-sm font-semibold text-slate-600">No scheduled medication reminders.</p>
                <button
                  onClick={handleOpenAddReminder}
                  className="mt-3 px-4 py-2 bg-medblue-600 text-white rounded-xl text-xs font-bold shadow"
                >
                  + Add Your First Medicine Reminder
                </button>
              </div>
            )}
          </div>

          {/* Modal to Add / Edit Reminder */}
          {isReminderModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">
                    {editingReminderId ? 'Edit Medication Reminder' : 'Set Medication Reminder'}
                  </h3>
                  <button
                    onClick={() => setIsReminderModalOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveReminder} className="space-y-4">
                  {/* Medicine Name with Quick Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Medicine Name
                    </label>
                    <input
                      type="text"
                      value={reminderMedName}
                      onChange={(e) => setReminderMedName(e.target.value)}
                      placeholder="e.g. Metformin, Lisinopril, Atorvastatin"
                      required
                      className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-medblue-500"
                    />

                    {medications.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        <span className="text-[10px] text-slate-400 self-center mr-1">Wallet meds:</span>
                        {medications.slice(0, 4).map(m => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setReminderMedName(m.name);
                              setReminderDosage(m.dosage || '1 tablet');
                            }}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-medblue-50 text-slate-700 hover:text-medblue-700 transition-colors"
                          >
                            + {m.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reminder Time & Dosage */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Scheduled Time</label>
                      <input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-medblue-500 font-mono font-bold text-medblue-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Dosage</label>
                      <input
                        type="text"
                        value={reminderDosage}
                        onChange={(e) => setReminderDosage(e.target.value)}
                        placeholder="e.g. 1 tablet"
                        className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-medblue-500"
                      />
                    </div>
                  </div>

                  {/* Days of Week */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Active Days of Week
                    </label>
                    <div className="flex justify-between gap-1">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleToggleDay(day)}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            reminderDays.includes(day)
                              ? 'bg-medblue-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Instructions / Notes */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Reminder Instructions / Notes</label>
                    <input
                      type="text"
                      value={reminderNotes}
                      onChange={(e) => setReminderNotes(e.target.value)}
                      placeholder="e.g. Take with water after breakfast"
                      className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-medblue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsReminderModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-medblue-600 hover:bg-medblue-700 rounded-xl shadow-md transition-all"
                    >
                      Save Reminder
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 5: BACKEND, DEMO & PRIVACY ==================== */}
      {activeTab === 'backend' && (
        <div className="space-y-6">
          {/* Backend Connection Manager */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  isSupabaseConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-slate-900">Supabase Backend Cloud Database</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isSupabaseConnected
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {isSupabaseConnected ? '🟢 Live Connected' : '🟡 In-Browser Simulator'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {isSupabaseConnected 
                      ? 'Connected to live Supabase PostgreSQL with Row Level Security (RLS) active.'
                      : (isDemoMode 
                          ? 'Running in high-fidelity demo simulator mode (preloaded with Arun Kumar, 52). Add keys below to switch to your Supabase project.'
                          : 'Running in offline vault mode. Add Supabase keys below to sync your patient data to the cloud.')}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleConnectSupabase} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Supabase Anon / Public Key
                  </label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    type="submit"
                    disabled={isConnecting}
                    className="px-5 py-2.5 bg-medblue-600 hover:bg-medblue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Cloud className="w-4 h-4" />
                    <span>{isConnecting ? 'Testing Connection...' : 'Connect to Live Supabase'}</span>
                  </button>

                  {isSupabaseConnected && (
                    <button
                      type="button"
                      onClick={disconnectSupabase}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                    >
                      Switch to Demo Simulator
                    </button>
                  )}
                </div>

                <span className="text-[11px] text-slate-400">
                  Keys are stored securely in your browser environment.
                </span>
              </div>
            </form>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                <Server className="w-4 h-4 text-medblue-600" />
                <span>Supabase Cloud Schema (16 Relational Tables with RLS)</span>
              </span>
              <p>
                Includes <code>lifestyle_substance_history</code> and <code>medication_reminders</code> with patient-level Row Level Security policies (<code>auth.uid() = user_id</code>). Run <code>supabase/schema.sql</code> in your Supabase SQL editor.
              </p>
            </div>
          </div>

          {/* Hackathon Demo & Session Controls */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
              <Lock className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Security & Account Controls</h3>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-900 block">Active Account Session</span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Signed in as <strong>{patientProfile.fullName || 'Patient'}</strong> ({patientProfile.email || 'No email'})
                </span>
              </div>

              {isDemoMode && (
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
                  <span className="text-xs font-bold text-medblue-950 block">Hackathon Demo Controls</span>
                  <p className="text-xs text-slate-600 mt-1">
                    Reset Arun Kumar's dataset back to original hackathon demonstration state (4 active medicines, 1 allergy flag, substance history, scheduled reminders).
                  </p>
                  <button
                    onClick={resetToDemoData}
                    className="mt-3 w-full py-2 px-3 bg-white hover:bg-slate-50 border border-medblue-200 text-medblue-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-soft-sm"
                  >
                    <RotateCcw className="w-4 h-4 text-medblue-600" />
                    <span>Reset Demo State (Arun Kumar)</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of MedGap</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
