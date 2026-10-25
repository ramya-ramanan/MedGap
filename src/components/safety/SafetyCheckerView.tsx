import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { SafetyCheckResult } from '../../context/AppContext';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CopyCheck, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw, 
  Printer, 
  ExternalLink, 
  HeartHandshake, 
  Stethoscope, 
  Pill, 
  Info,
  ChevronRight
} from 'lucide-react';

export const SafetyCheckerView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    runSafetyEvaluation, 
    patientProfile, 
    medications, 
    adverseReactions, 
    addMedication, 
    addToast, 
    isDemoMode 
  } = useApp();

  // Form Inputs
  const [medicineName, setMedicineName] = useState('');
  const [strength, setStrength] = useState('');
  const [dosage, setDosage] = useState('1 tablet');
  const [frequency, setFrequency] = useState('Once daily');

  // Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);

  // Result State
  const [safetyResult, setSafetyResult] = useState<SafetyCheckResult | null>(null);

  const scanSteps = [
    '1. Cross-referencing recorded allergies & cross-reactivity matrix...',
    '2. Auditing previous adverse drug reactions & side effects (ADRs)...',
    '3. Analyzing active medications for interactions & duplicates...',
    '4. Checking chronic conditions & clinical contraindications...'
  ];

  const handleRunCheck = (nameOverride?: string, strengthOverride?: string, dosageOverride?: string) => {
    const targetName = nameOverride || medicineName;
    const targetStrength = strengthOverride || strength;
    const targetDosage = dosageOverride || dosage;

    if (!targetName.trim()) {
      addToast('Input Required', 'Please enter a medicine name to evaluate.', 'warning');
      return;
    }

    setIsScanning(true);
    setScanStepIndex(0);
    setSafetyResult(null);

    // Multi-stage scan animation
    setTimeout(() => setScanStepIndex(1), 500);
    setTimeout(() => setScanStepIndex(2), 1100);
    setTimeout(() => setScanStepIndex(3), 1700);

    setTimeout(() => {
      setIsScanning(false);
      const result = runSafetyEvaluation(targetName, targetStrength, targetDosage);
      setSafetyResult(result);
    }, 2400);
  };

  // Automatically evaluate medicine when navigated from Manual Entry or Prescription OCR
  useEffect(() => {
    const autoCheck = (location.state as any)?.autoCheckMedicine;
    if (autoCheck && autoCheck.name) {
      const targetName = autoCheck.name;
      const targetStrength = autoCheck.strength || '';
      const targetDosage = autoCheck.dosage || '1 tablet';
      setMedicineName(targetName);
      setStrength(targetStrength);
      setDosage(targetDosage);
      if (autoCheck.frequency) setFrequency(autoCheck.frequency);

      setIsScanning(true);
      setScanStepIndex(0);
      setSafetyResult(null);

      setTimeout(() => setScanStepIndex(1), 400);
      setTimeout(() => setScanStepIndex(2), 900);
      setTimeout(() => setScanStepIndex(3), 1400);

      setTimeout(() => {
        setIsScanning(false);
        const result = runSafetyEvaluation(targetName, targetStrength, targetDosage);
        setSafetyResult(result);
        addToast(
          'Safety Check Performed',
          `Automated audit completed for newly added ${targetName}. Review clinical alerts below.`,
          result.hasIssues ? 'warning' : 'success'
        );
      }, 1900);
    }
  }, [location.state]);

  // Preset Scenario Handlers
  const handleLoadScenarioA = () => {
    setMedicineName('Amoxicillin');
    setStrength('500 mg');
    setDosage('1 capsule');
    setFrequency('3 times / day');
    handleRunCheck('Amoxicillin', '500 mg', '1 capsule');
  };

  const handleLoadScenarioB = () => {
    setMedicineName('Ciprofloxacin');
    setStrength('500 mg');
    setDosage('1 tablet');
    setFrequency('Twice daily');
    handleRunCheck('Ciprofloxacin', '500 mg', '1 tablet');
  };

  const handleLoadScenarioC = () => {
    setMedicineName('Lipitor');
    setStrength('20 mg');
    setDosage('1 tablet');
    setFrequency('Once daily (bedtime)');
    handleRunCheck('Lipitor', '20 mg', '1 tablet');
  };

  const handleLoadScenarioD = () => {
    setMedicineName('Ibuprofen');
    setStrength('400 mg');
    setDosage('1 tablet');
    setFrequency('Every 8 hours as needed');
    handleRunCheck('Ibuprofen', '400 mg', '1 tablet');
  };

  const handleLoadScenarioE = () => {
    setMedicineName('Vitamin D3 / Cholecalciferol');
    setStrength('2000 IU');
    setDosage('1 softgel');
    setFrequency('Once daily with meal');
    handleRunCheck('Vitamin D3', '2000 IU', '1 softgel');
  };

  const handleAddEvaluatedToList = () => {
    if (!safetyResult) return;
    addMedication({
      name: safetyResult.evaluatedMedicine.name,
      genericName: safetyResult.evaluatedMedicine.name,
      strength: safetyResult.evaluatedMedicine.strength,
      dosage: safetyResult.evaluatedMedicine.dosage,
      frequency: frequency || 'Once daily',
      status: 'Active',
      prescribedBy: 'Evaluated Candidate Medication',
      startDate: new Date().toISOString().split('T')[0],
      indication: 'Added following safety audit',
      category: 'Evaluated Rx'
    });
    navigate('/medications');
  };

  const handlePrintSummary = () => {
    window.print();
  };

  const activeMedsCount = medications.filter(m => m.status === 'Active').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Medication Safety Checker
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
              4-Dimension Safety Matrix
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Automated pharmacovigilance screening against allergies, adverse reactions, active medications, and chronic conditions.
          </p>
        </div>

        {safetyResult && (
          <button
            onClick={() => { setSafetyResult(null); setMedicineName(''); }}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center space-x-1.5 self-start sm:self-auto shadow-soft-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Safety Scan</span>
          </button>
        )}
      </div>

      {/* Prominent Hackathon Test Scenarios Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-medblue-950 to-slate-900 text-white p-5 rounded-3xl shadow-soft-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
              Hackathon Instant Scenarios
            </span>
          </div>
          <span className="text-[11px] text-slate-300 hidden sm:inline">
            {isDemoMode
              ? 'Demo Patient: Arun Kumar (52) • Allergies & ADRs Active'
              : `Patient: ${patientProfile.fullName || 'Patient'} • Allergies: ${patientProfile.knownAllergies?.length ? patientProfile.knownAllergies.join(', ') : 'None'}`}
          </span>
        </div>

        <p className="text-xs text-slate-300 mb-3">
          Test all 4 clinical safety algorithms with 1-click presets:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <button
            onClick={handleLoadScenarioA}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all hover:scale-[1.02]"
          >
            <span className="text-[11px] font-bold text-rose-300 block">🚨 S1: Allergy</span>
            <span className="text-xs font-bold text-white block mt-0.5 truncate">Amoxicillin 500mg</span>
            <span className="text-[10px] text-slate-300 block truncate">Penicillin Allergy Alert</span>
          </button>

          <button
            onClick={handleLoadScenarioB}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all hover:scale-[1.02]"
          >
            <span className="text-[11px] font-bold text-amber-300 block">⚠️ S2: Prior ADR</span>
            <span className="text-xs font-bold text-white block mt-0.5 truncate">Cipro 500mg</span>
            <span className="text-[10px] text-slate-300 block truncate">Tendonitis Reaction</span>
          </button>

          <button
            onClick={handleLoadScenarioC}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all hover:scale-[1.02]"
          >
            <span className="text-[11px] font-bold text-amber-300 block">🟡 S3: Duplicate</span>
            <span className="text-xs font-bold text-white block mt-0.5 truncate">Lipitor 20mg</span>
            <span className="text-[10px] text-slate-300 block truncate">Duplicate Statin Class</span>
          </button>

          <button
            onClick={handleLoadScenarioD}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all hover:scale-[1.02]"
          >
            <span className="text-[11px] font-bold text-rose-300 block">🔴 S4: Interaction</span>
            <span className="text-xs font-bold text-white block mt-0.5 truncate">Ibuprofen 400mg</span>
            <span className="text-[10px] text-slate-300 block truncate">Aspirin & Ulcer Risk</span>
          </button>

          <button
            onClick={handleLoadScenarioE}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all hover:scale-[1.02] col-span-2 sm:col-span-1"
          >
            <span className="text-[11px] font-bold text-emerald-300 block">🟢 S5: Safe</span>
            <span className="text-xs font-bold text-white block mt-0.5 truncate">Vitamin D3 2000IU</span>
            <span className="text-[10px] text-slate-300 block truncate">Clear Safety Profile</span>
          </button>
        </div>
      </div>

      {/* Step 1: Input Form (if not scanning) */}
      {!safetyResult && !isScanning && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 sm:p-8 space-y-5">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-medblue-50 text-medblue-600 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Step 1: Enter New Medicine to Evaluate
              </h2>
              <p className="text-xs text-slate-500">
                Type any new prescription or over-the-counter medicine to cross-reference against your current regimen.
              </p>
            </div>
          </div>

          {/* 4 Active Dimensions Mini-Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-slate-600">Allergies:</span>
              <strong className="text-slate-900">{patientProfile.knownAllergies?.length || 0}</strong>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-slate-600">Prior ADRs:</span>
              <strong className="text-slate-900">{adverseReactions?.length || 0}</strong>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-medblue-500"></span>
              <span className="text-slate-600">Active Meds:</span>
              <strong className="text-slate-900">{activeMedsCount}</strong>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-medteal-500"></span>
              <span className="text-slate-600">Conditions:</span>
              <strong className="text-slate-900">{patientProfile.existingConditions?.length || 0}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="sm:col-span-1">
              <label className="block font-bold text-slate-700 text-xs mb-1">
                Medicine Name *
              </label>
              <input
                type="text"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                placeholder="e.g. Amoxicillin, Lipitor, Cipro"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1">
                Strength
              </label>
              <input
                type="text"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                placeholder="e.g. 500 mg or 20 mg"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1">
                Dosage
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 1 tablet"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-medblue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Evaluates simultaneously across <strong>4 safety dimensions</strong> before medication ingestion.
            </p>

            <button
              onClick={() => handleRunCheck()}
              className="w-full sm:w-auto px-8 py-3.5 bg-medblue-600 hover:bg-medblue-700 active:scale-95 text-white rounded-2xl text-sm font-bold shadow-lg shadow-medblue-600/25 transition-all flex items-center justify-center space-x-2"
            >
              <ShieldAlert className="w-5 h-5 text-sky-200" />
              <span>Run Safety Check</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading State: Animated Scanner */}
      {isScanning && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-lg p-10 sm:p-14 text-center max-w-xl mx-auto space-y-6 animate-in fade-in">
          
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-medblue-600 text-white flex items-center justify-center shadow-lg shadow-medblue-600/30 animate-pulse">
              <ShieldAlert className="w-10 h-10 text-white" />
            </div>
            <div className="absolute inset-0 rounded-3xl border-2 border-medblue-400 animate-ping opacity-25" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Analyzing Medication Safety Profile
            </h3>
            <p className="text-xs font-mono text-medblue-700 mt-1">
              Evaluating candidate: <span className="font-bold">{medicineName} {strength}</span>
            </p>
          </div>

          {/* Sequential Checklist Animation */}
          <div className="space-y-3 max-w-sm mx-auto text-left text-xs">
            {scanSteps.map((step, idx) => {
              const isCompleted = scanStepIndex > idx;
              const isCurrent = scanStepIndex === idx;

              return (
                <div
                  key={idx}
                  className={`flex items-center space-x-3 p-2.5 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-sky-50 text-medblue-900 font-bold border border-sky-200'
                      : isCompleted
                      ? 'text-slate-700'
                      : 'text-slate-300'
                  }`}
                >
                  <div className="shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-medblue-600 border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300" />
                    )}
                  </div>
                  <span>{step}</span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400">
            Applying clinical pharmacovigilance heuristics • Non-diagnostic validation
          </p>
        </div>
      )}

      {/* Safety Checker Result Screen - THE VISUAL HIGHLIGHT */}
      {safetyResult && (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
          
          {/* Main Risk Banner */}
          <div className={`rounded-3xl p-6 sm:p-8 border shadow-soft-lg transition-all ${
            safetyResult.overallRisk === 'High'
              ? 'bg-gradient-to-br from-rose-50 via-rose-100/40 to-white border-rose-300 text-rose-950'
              : safetyResult.overallRisk === 'Moderate'
              ? 'bg-gradient-to-br from-amber-50 via-amber-100/40 to-white border-amber-300 text-amber-950'
              : 'bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border-emerald-300 text-emerald-950'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-start space-x-4">
                <div className={`p-4 rounded-2xl shrink-0 text-white shadow-md ${
                  safetyResult.overallRisk === 'High'
                    ? 'bg-rose-600'
                    : safetyResult.overallRisk === 'Moderate'
                    ? 'bg-amber-600'
                    : 'bg-emerald-600'
                }`}>
                  {safetyResult.overallRisk === 'High' ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : safetyResult.overallRisk === 'Moderate' ? (
                    <AlertCircle className="w-8 h-8" />
                  ) : (
                    <ShieldCheck className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      safetyResult.overallRisk === 'High'
                        ? 'bg-rose-200 text-rose-900'
                        : safetyResult.overallRisk === 'Moderate'
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-emerald-200 text-emerald-900'
                    }`}>
                      Risk Level: {safetyResult.overallRisk}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Audited at {safetyResult.timestamp}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                    {safetyResult.overallRisk === 'High' && '🔴 Potential High-Risk Safety Issue Detected'}
                    {safetyResult.overallRisk === 'Moderate' && '🟡 Possible Moderate Risk / Duplicate Therapy Flagged'}
                    {safetyResult.overallRisk === 'Low' && '🟢 Profile Safe: No Conflicts Flagged'}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-700 mt-2 font-medium max-w-2xl leading-relaxed">
                    {safetyResult.summaryMessage}
                  </p>
                </div>
              </div>

              {/* Action shortcuts */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handlePrintSummary}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-soft-sm transition-all flex items-center space-x-1.5"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>

            {/* Mandatory Medical Recommendation Box */}
            <div className="mt-6 p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-soft-sm flex items-start space-x-3">
              <Stethoscope className="w-5 h-5 text-medblue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Required Clinical Advisory
                </h4>
                <p className="text-xs sm:text-sm font-bold text-medblue-950 mt-0.5">
                  Potential risk detected — please consult a qualified healthcare professional before making changes to medication.
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  MedGap alerts are generated for patient safety awareness and do not replace licensed clinical judgment.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Alert Cards Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* 1. Allergy Conflicts (Section 10) */}
            {safetyResult.allergyAlerts.length > 0 && (
              <div className="md:col-span-2 bg-white rounded-3xl border-2 border-rose-300 p-6 shadow-soft space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-rose-700">
                        🚨 Allergy-Related Alert
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Conflict with Recorded Allergy: {safetyResult.allergyAlerts[0].allergy}
                      </h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-600 text-white">
                    High Risk
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm pt-1">
                  <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100">
                    <span className="text-[11px] font-bold text-slate-500 block">Recorded Patient Allergy:</span>
                    <span className="text-base font-extrabold text-rose-800 block mt-0.5">
                      {safetyResult.allergyAlerts[0].allergy}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 block">Evaluated Medication:</span>
                    <span className="text-base font-extrabold text-slate-900 block mt-0.5">
                      {safetyResult.evaluatedMedicine.name} ({safetyResult.evaluatedMedicine.strength})
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed pt-1">
                  <strong>Risk Assessment:</strong> {safetyResult.allergyAlerts[0].description}
                </p>
                <p className="text-xs text-slate-500 italic">
                  {safetyResult.allergyAlerts[0].clinicalNote}
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-700">
                    This medication may require professional review based on the recorded allergy.
                  </span>
                  <button
                    onClick={() => navigate('/share')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Consult Professional
                  </button>
                </div>
              </div>
            )}

            {/* 2. Adverse Drug Reaction / Side Effects Alerts */}
            {safetyResult.adverseReactionAlerts && safetyResult.adverseReactionAlerts.length > 0 && (
              safetyResult.adverseReactionAlerts.map((adr, idx) => (
                <div key={idx} className="md:col-span-2 bg-white rounded-3xl border-2 border-amber-300 p-6 shadow-soft space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-amber-700">
                          ⚠️ Previous Adverse Drug Reaction (Side Effect)
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                          Prior Adverse Reaction with {adr.medicineName}: {adr.reaction}
                        </h3>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                      adr.severity === 'High' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {adr.severity} Risk
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm pt-1">
                    <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100">
                      <span className="text-[11px] font-bold text-slate-500 block">Previously Recorded Reaction:</span>
                      <span className="text-base font-extrabold text-amber-900 block mt-0.5">
                        {adr.reaction}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 block">Candidate Re-exposure:</span>
                      <span className="text-base font-extrabold text-slate-900 block mt-0.5">
                        {safetyResult.evaluatedMedicine.name} ({safetyResult.evaluatedMedicine.strength})
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed pt-1">
                    <strong>Risk Assessment:</strong> {adr.description}
                  </p>
                  {adr.clinicalNote && (
                    <p className="text-xs text-slate-500 italic">
                      {adr.clinicalNote}
                    </p>
                  )}

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-800">
                      Re-exposure may trigger hypersensitivity recurrence or adverse toxicity.
                    </span>
                    <button
                      onClick={() => navigate('/share')}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Consult Professional
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* 3. Drug-Drug Interactions (Section 8) */}
            {safetyResult.interactionAlerts.map((interaction, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-soft space-y-3"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block">
                        🔴 Potential Interaction Detected
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{interaction.title}</h4>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                    {interaction.severity}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">New Medicine</span>
                    <span className="font-bold text-slate-900 block truncate">
                      {safetyResult.evaluatedMedicine.name}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Existing Active Drug</span>
                    <span className="font-bold text-slate-900 block truncate">
                      {interaction.existingMedicine}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Pharmacological Mechanism
                  </span>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {interaction.mechanism}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700">
                  <strong className="text-slate-900">Recommendation:</strong>{' '}
                  {interaction.recommendation}
                </div>
              </div>
            ))}

            {/* 4. Duplicate Medicine Detection (Section 9) */}
            {safetyResult.duplicateAlerts.map((dup, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-amber-200 p-6 shadow-soft space-y-3"
              >
                <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                      <CopyCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                        🟡 Possible Duplicate Medicine
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{dup.duplicateClass}</h4>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    Duplicate Class
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-amber-50/60">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">Candidate Brand</span>
                    <span className="font-bold text-slate-900 block truncate">
                      {safetyResult.evaluatedMedicine.name}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50/60">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">Active In Wallet</span>
                    <span className="font-bold text-slate-900 block truncate">
                      {dup.existingMedicine}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-900">Active Ingredient Overlap:</strong>{' '}
                  {dup.commonActiveIngredient}
                  <p className="mt-1">{dup.explanation}</p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Both medicines may contain the same active ingredient.
                  </span>
                  <button
                    onClick={() => navigate('/medications')}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                  >
                    Review Wallet
                  </button>
                </div>
              </div>
            ))}

            {/* 5. Medical Condition Contraindications */}
            {safetyResult.conditionAlerts && safetyResult.conditionAlerts.length > 0 && (
              safetyResult.conditionAlerts.map((ca, idx) => (
                <div key={idx} className="bg-white rounded-3xl border border-amber-300 p-6 shadow-soft space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                          ⚠️ Medical Condition Contraindication
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">Contraindicated in {ca.condition}</h4>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      ca.severity === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ca.severity} Risk
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs text-slate-700">
                    <strong className="text-amber-900">Clinical Warning:</strong>{' '}
                    {ca.description}
                  </div>

                  <p className="text-xs text-slate-500 italic">
                    {ca.clinicalNote}
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Review medical condition compatibility.
                    </span>
                    <button
                      onClick={() => navigate('/profile')}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                    >
                      View Conditions
                    </button>
                  </div>
                </div>
              ))
            )}

          </div>

          {/* Bottom Decision Actions */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Next Steps for This Prescription</h4>
              <p className="text-xs text-slate-500">
                Share this audit with your doctor or store in your wallet.
              </p>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/share')}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-medblue-600 hover:bg-medblue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-medblue-600/20 transition-all flex items-center justify-center space-x-1.5"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Consult Healthcare Professional</span>
              </button>

              <button
                onClick={handleAddEvaluatedToList}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-xl transition-all"
              >
                Add to Medication List
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
