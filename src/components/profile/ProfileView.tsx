import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  Heart, 
  ShieldAlert, 
  Phone, 
  Mail, 
  Calendar, 
  Save, 
  Edit3, 
  Plus, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Stethoscope,
  Trash2,
  AlertOctagon,
  Building,
  FileText
} from 'lucide-react';
import { getAvatarInitials } from '../../services/profileService';

export const ProfileView: React.FC = () => {
  const { 
    patientProfile, 
    updatePatientProfile, 
    addToast,
    adverseReactions,
    addAdverseReaction,
    removeAdverseReaction,
    doctorVisits,
    addDoctorVisit,
    removeDoctorVisit
  } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  // Locker Modals
  const [showAddAdrModal, setShowAddAdrModal] = useState(false);
  const [adrMedName, setAdrMedName] = useState('');
  const [adrReaction, setAdrReaction] = useState('');
  const [adrSeverity, setAdrSeverity] = useState<'Mild' | 'Moderate' | 'Severe' | 'Life-Threatening'>('Moderate');
  const [adrNotes, setAdrNotes] = useState('');

  const [showAddVisitModal, setShowAddVisitModal] = useState(false);
  const [visitDoctor, setVisitDoctor] = useState('');
  const [visitSpecialty, setVisitSpecialty] = useState('General Practice');
  const [visitClinic, setVisitClinic] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [visitReason, setVisitReason] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [visitFollowUp, setVisitFollowUp] = useState('');

  // Local form state
  const [fullName, setFullName] = useState(patientProfile.fullName || 'Patient');
  const [age, setAge] = useState(patientProfile.age || 0);
  const [gender, setGender] = useState(patientProfile.gender || 'Not specified');
  const [phone, setPhone] = useState(patientProfile.phone || '');
  const [email, setEmail] = useState(patientProfile.email || '');
  const [bloodGroup, setBloodGroup] = useState(patientProfile.bloodGroup || 'Not specified');
  const [allergies, setAllergies] = useState<string[]>(patientProfile.knownAllergies || []);
  const [newAllergyInput, setNewAllergyInput] = useState('');
  const [conditions, setConditions] = useState<string[]>(patientProfile.existingConditions || []);
  const [newConditionInput, setNewConditionInput] = useState('');
  const [emergencyName, setEmergencyName] = useState(patientProfile.emergencyContact?.name || '');
  const [emergencyRelationship, setEmergencyRelationship] = useState(patientProfile.emergencyContact?.relationship || '');
  const [emergencyPhone, setEmergencyPhone] = useState(patientProfile.emergencyContact?.phone || '');

  // Sync state if profile is fetched from Supabase asynchronously
  React.useEffect(() => {
    if (!isEditing) {
      setFullName(patientProfile.fullName || 'Patient');
      setAge(patientProfile.age || 0);
      setGender(patientProfile.gender || 'Not specified');
      setPhone(patientProfile.phone || '');
      setEmail(patientProfile.email || '');
      setBloodGroup(patientProfile.bloodGroup || 'Not specified');
      setAllergies(patientProfile.knownAllergies || []);
      setConditions(patientProfile.existingConditions || []);
      setEmergencyName(patientProfile.emergencyContact?.name || '');
      setEmergencyRelationship(patientProfile.emergencyContact?.relationship || '');
      setEmergencyPhone(patientProfile.emergencyContact?.phone || '');
    }
  }, [patientProfile, isEditing]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatientProfile({
      fullName,
      age: Number(age),
      gender,
      phone,
      email,
      bloodGroup,
      knownAllergies: allergies,
      existingConditions: conditions,
      emergencyContact: {
        name: emergencyName,
        relationship: emergencyRelationship,
        phone: emergencyPhone,
      }
    });
    setIsEditing(false);
  };

  const handleAddAllergy = () => {
    if (newAllergyInput.trim() && !allergies.includes(newAllergyInput.trim())) {
      setAllergies([...allergies, newAllergyInput.trim()]);
      setNewAllergyInput('');
    }
  };

  const handleRemoveAllergy = (item: string) => {
    setAllergies(allergies.filter(a => a !== item));
  };

  const handleAddCondition = () => {
    if (newConditionInput.trim() && !conditions.includes(newConditionInput.trim())) {
      setConditions([...conditions, newConditionInput.trim()]);
      setNewConditionInput('');
    }
  };

  const handleRemoveCondition = (item: string) => {
    setConditions(conditions.filter(c => c !== item));
  };

  const handleSaveAdr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adrMedName.trim() || !adrReaction.trim()) {
      addToast('Input Required', 'Please enter medicine name and observed reaction.', 'warning');
      return;
    }
    addAdverseReaction({
      medicineName: adrMedName.trim(),
      reaction: adrReaction.trim(),
      severity: adrSeverity,
      dateRecorded: new Date().toISOString().split('T')[0],
      notes: adrNotes.trim() || undefined,
    });
    setAdrMedName('');
    setAdrReaction('');
    setAdrNotes('');
    setShowAddAdrModal(false);
  };

  const handleSaveVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitDoctor.trim() || !visitReason.trim()) {
      addToast('Input Required', 'Please enter physician name and reason for visit.', 'warning');
      return;
    }
    addDoctorVisit({
      doctorName: visitDoctor.trim(),
      specialty: visitSpecialty.trim(),
      clinicOrHospital: visitClinic.trim() || 'Clinic / Hospital',
      visitDate: visitDate || new Date().toISOString().split('T')[0],
      reasonForVisit: visitReason.trim(),
      diagnosisNotes: visitNotes.trim() || undefined,
      followUpDate: visitFollowUp.trim() || undefined,
    });
    setVisitDoctor('');
    setVisitClinic('');
    setVisitReason('');
    setVisitNotes('');
    setVisitFollowUp('');
    setShowAddVisitModal(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header with edit toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Patient Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Demographic details, verified health conditions, and recorded hypersensitivities.
          </p>
        </div>

        <div>
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-medblue-600 hover:bg-medblue-700 rounded-xl shadow-sm flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-soft-sm flex items-center space-x-1.5 transition-all"
            >
              <Edit3 className="w-4 h-4 text-medblue-600" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-medblue-900 via-medblue-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft-md">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black text-white shadow-inner shrink-0">
            {getAvatarInitials(patientProfile.fullName || 'Patient')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black">{patientProfile.fullName || 'Patient'}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                Verified Patient
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-200">
                Blood Group: {patientProfile.bloodGroup || 'Not specified'}
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-2">
              Primary Care: {patientProfile.primaryCarePhysician || 'Not assigned'}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300">
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>{patientProfile.age && patientProfile.age > 0 ? `${patientProfile.age} Years Old` : 'Age: N/A'} ({patientProfile.gender || 'Not specified'})</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>{patientProfile.email || 'No email registered'}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-sky-400" />
                <span>{patientProfile.phone || 'No phone registered'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form / Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Section 1: Personal Information */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6">
          <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100">
            <User className="w-5 h-5 text-medblue-600" />
            <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-500 text-xs mb-1">Full Legal Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              ) : (
                <p className="font-semibold text-slate-900">{patientProfile.fullName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-500 text-xs mb-1">Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-semibold text-slate-900">{patientProfile.age} years</p>
                )}
              </div>
              <div>
                <label className="block font-semibold text-slate-500 text-xs mb-1">Gender</label>
                {isEditing ? (
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="font-semibold text-slate-900">{patientProfile.gender}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-500 text-xs mb-1">Blood Group</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-semibold text-slate-900">{patientProfile.bloodGroup}</p>
                )}
              </div>
              <div>
                <label className="block font-semibold text-slate-500 text-xs mb-1">Contact Phone</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-semibold text-slate-900">{patientProfile.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-500 text-xs mb-1">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              ) : (
                <p className="font-semibold text-slate-900">{patientProfile.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Health Information & Allergies */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 space-y-6">
          
          {/* Allergies */}
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">Known Allergies</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                Safety Priority
              </span>
            </div>

            {allergies.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No drug allergies recorded on file.</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-3">
                {allergies.map(allergy => (
                  <span
                    key={allergy}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>{allergy}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(allergy)}
                        className="ml-1 text-rose-400 hover:text-rose-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}

            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAllergyInput}
                  onChange={(e) => setNewAllergyInput(e.target.value)}
                  placeholder="Add allergy (e.g. Sulfa)"
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-medblue-500"
                />
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                >
                  Add
                </button>
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-2">
              Cross-referenced during every prescription upload and safety check.
            </p>
          </div>

          {/* Existing Conditions */}
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-medteal-600" />
                <h3 className="text-base font-bold text-slate-900">Existing Conditions</h3>
              </div>
            </div>

            {conditions.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No chronic medical conditions recorded.</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-3">
                {conditions.map(cond => (
                  <span
                    key={cond}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-medteal-800 text-xs font-semibold border border-teal-200"
                  >
                    <span>{cond}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCondition(cond)}
                        className="ml-1 text-teal-400 hover:text-teal-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}

            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newConditionInput}
                  onChange={(e) => setNewConditionInput(e.target.value)}
                  placeholder="Add chronic condition"
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-medblue-500"
                />
                <button
                  type="button"
                  onClick={handleAddCondition}
                  className="px-3 py-1.5 text-xs font-semibold bg-medteal-600 text-white rounded-lg hover:bg-medteal-700"
                >
                  Add
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Section 3: Emergency Contact */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6">
          <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100">
            <Phone className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Emergency Contact Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-500 text-xs mb-1">Contact Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              ) : (
                <p className="font-semibold text-slate-900">{patientProfile.emergencyContact.name}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-500 text-xs mb-1">Relationship</label>
              {isEditing ? (
                <input
                  type="text"
                  value={emergencyRelationship}
                  onChange={(e) => setEmergencyRelationship(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              ) : (
                <p className="font-semibold text-slate-900">{patientProfile.emergencyContact.relationship}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-500 text-xs mb-1">Emergency Phone</label>
              {isEditing ? (
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              ) : (
                <p className="font-semibold text-slate-900">{patientProfile.emergencyContact.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Adverse Drug Reactions & Side Effects (ADRs) */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Adverse Drug Reactions & Side Effects</h3>
                <p className="text-xs text-slate-500">Documented intolerance and hypersensitivities cross-referenced in safety checks.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAddAdrModal(true)}
              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Adverse Reaction</span>
            </button>
          </div>

          {adverseReactions.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                No adverse drug reactions or serious side effects logged yet. Recording reactions here automatically flags future prescriptions and safety evaluations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {adverseReactions.map((adr) => (
                <div
                  key={adr.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-extrabold text-slate-900">{adr.medicineName}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          adr.severity === 'Severe' || adr.severity === 'Life-Threatening'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : adr.severity === 'Moderate'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-sky-100 text-sky-800 border border-sky-200'
                        }`}
                      >
                        {adr.severity}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-rose-700 mt-1">{adr.reaction}</p>
                    {adr.notes && <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{adr.notes}</p>}
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">Logged on {adr.dateRecorded}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAdverseReaction(adr.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Doctor Visits & Consultations */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Doctor Visits & Consultations</h3>
                <p className="text-xs text-slate-500">Historical outpatient, hospital, and specialist clinical consultation trail.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAddVisitModal(true)}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Doctor Visit</span>
            </button>
          </div>

          {doctorVisits.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                No doctor visits or consultations recorded yet. Log your doctor appointments, clinical diagnosis notes, and follow-up schedules.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doctorVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">{visit.doctorName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                        {visit.specialty}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-1">
                      <Building className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{visit.clinicOrHospital}</span>
                      <span>•</span>
                      <span>{visit.visitDate}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-700 mt-1.5">
                      <strong className="text-slate-800">Reason:</strong> {visit.reasonForVisit}
                    </p>
                    {visit.diagnosisNotes && (
                      <p className="text-[11px] text-slate-600 mt-1 bg-white p-2 rounded-xl border border-slate-100">
                        {visit.diagnosisNotes}
                      </p>
                    )}
                    {visit.followUpDate && (
                      <span className="text-[10px] text-indigo-600 font-bold block mt-1.5">
                        Follow-up scheduled: {visit.followUpDate}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDoctorVisit(visit.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                    title="Delete visit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal: Add Adverse Reaction */}
      {showAddAdrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <AlertOctagon className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">Log Adverse Drug Reaction</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAdrModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdr} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ciprofloxacin, Amoxicillin, Ibuprofen"
                  value={adrMedName}
                  onChange={(e) => setAdrMedName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observed Reaction / Symptoms *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Severe Urticaria, Facial Angioedema, Tendonitis, Cough"
                  value={adrReaction}
                  onChange={(e) => setAdrReaction(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Severity</label>
                  <select
                    value={adrSeverity}
                    onChange={(e) => setAdrSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-medblue-500 focus:outline-none"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                    <option value="Life-Threatening">Life-Threatening</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Notes & Context</label>
                <textarea
                  rows={2}
                  placeholder="Notes on duration, medical care required, or confirmation by physician"
                  value={adrNotes}
                  onChange={(e) => setAdrNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAdrModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
                >
                  Save to Medical Locker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Doctor Visit */}
      {showAddVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Record Doctor Visit</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddVisitModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVisit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ramesh Mehta, MD"
                    value={visitDoctor}
                    onChange={(e) => setVisitDoctor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-medblue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specialty</label>
                  <input
                    type="text"
                    placeholder="e.g. Cardiology, Internal Medicine"
                    value={visitSpecialty}
                    onChange={(e) => setVisitSpecialty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-medblue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Clinic or Hospital</label>
                  <input
                    type="text"
                    placeholder="e.g. City General Health Center"
                    value={visitClinic}
                    onChange={(e) => setVisitClinic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-medblue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Visit Date</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-medblue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Visit / Chief Complaint *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hypertension review, Routine checkup, Persistent cough"
                  value={visitReason}
                  onChange={(e) => setVisitReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Diagnosis & Clinical Recommendations</label>
                <textarea
                  rows={2}
                  placeholder="Physician advice, dosage changes, or dietary recommendations"
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Follow-up Date (Optional)</label>
                <input
                  type="date"
                  value={visitFollowUp}
                  onChange={(e) => setVisitFollowUp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-medblue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddVisitModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Save Consultation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
