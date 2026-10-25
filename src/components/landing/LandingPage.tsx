import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Pill, 
  Upload, 
  FileText, 
  AlertTriangle, 
  CopyCheck, 
  History, 
  QrCode, 
  Lock, 
  UserCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  HeartPulse, 
  Layers, 
  Stethoscope,
  ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsDemo } = useApp();

  const handleLaunchDemo = () => {
    loginAsDemo();
    navigate('/dashboard');
  };

  const handleGetStarted = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-medblue-600 selection:text-white">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medblue-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-medblue-600/25">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 font-sans">
                Med<span className="text-medblue-600">Gap</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                Patient Medication Safety
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#problem" className="hover:text-medblue-600 transition-colors">The Challenge</a>
            <a href="#solution" className="hover:text-medblue-600 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-medblue-600 transition-colors">Safety Features</a>
            <a href="#preview" className="hover:text-medblue-600 transition-colors">Live Mockup</a>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-medblue-700 hover:bg-slate-100 rounded-xl transition-all"
            >
              Sign In
            </button>
            <button
              onClick={handleLaunchDemo}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-medblue-600 hover:bg-medblue-700 active:scale-95 rounded-xl shadow-md shadow-medblue-600/25 transition-all flex items-center space-x-1.5"
            >
              <span>Explore Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-gradient-to-b from-white via-sky-50/30 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            
            {/* Tagline Pill */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-medblue-50 border border-medblue-200 text-medblue-800 text-xs sm:text-sm font-semibold mb-6 shadow-soft-sm">
              <Sparkles className="w-4 h-4 text-medblue-600" />
              <span>Bridging the Medication Gap. Protecting Every Prescription.</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Your Medication History.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-medblue-700 via-medblue-600 to-medteal-600">
                One Safe Place.
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              MedGap connects your medication history and helps identify potential medication safety risks before they become problems.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-medblue-600 hover:bg-medblue-700 active:scale-95 rounded-2xl shadow-lg shadow-medblue-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleLaunchDemo}
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-slate-800 bg-white hover:bg-slate-100/90 border border-slate-200/90 rounded-2xl shadow-soft transition-all flex items-center justify-center space-x-2"
              >
                <HeartPulse className="w-5 h-5 text-medteal-600" />
                <span>Explore Demo (Arun Kumar, 52)</span>
              </button>
            </div>

            {/* Trust badge */}
            <p className="mt-4 text-xs text-slate-400 flex items-center justify-center space-x-1">
              <span>Built for patient safety • Independent alert system • No prescription replacement</span>
            </p>
          </div>

          {/* Hero Visual Mockup */}
          <div id="preview" className="mt-14 max-w-5xl mx-auto relative">
            <div className="relative rounded-3xl p-3 sm:p-4 bg-gradient-to-b from-slate-200 to-slate-300 shadow-2xl border border-slate-200/80">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-inner overflow-hidden border border-slate-100">
                
                {/* Mockup top browser bar */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs text-slate-400 font-mono ml-2">medgap.health/dashboard/safety</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      🟢 Patient Profile: Arun Kumar (52)
                    </span>
                  </div>
                </div>

                {/* Mockup Dashboard Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-left">
                  
                  {/* Mockup Column 1 & 2: Active Medicines & Alert */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Mockup Alert Banner */}
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 shadow-soft-sm flex items-start space-x-3.5">
                      <div className="p-2 rounded-xl bg-rose-500 text-white shrink-0 mt-0.5">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                            Potential Risk Detected
                          </span>
                          <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                            High Priority
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 mt-1">
                          Aspirin (Cardio) + Ibuprofen: Antiplatelet Antagonism
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          Potential risk detected — please consult a qualified healthcare professional before taking Ibuprofen concurrently.
                        </p>
                      </div>
                    </div>

                    {/* Mockup Medicine cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">Metformin 500mg</h4>
                            <p className="text-[11px] text-slate-500">2 times / day • With meals</p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">Dr. R. Mehta (Endocrinology)</p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">Atorvastatin 20mg</h4>
                            <p className="text-[11px] text-slate-500">Once daily • Bedtime</p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">Dr. K. Sharma (Cardiology)</p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">Lisinopril 10mg</h4>
                            <p className="text-[11px] text-slate-500">Once daily • Morning</p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">Dr. K. Sharma (Cardiology)</p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">Aspirin (Cardio) 81mg</h4>
                            <p className="text-[11px] text-slate-500">Once daily • With lunch</p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">Cardiovascular Prophylaxis</p>
                      </div>
                    </div>
                  </div>

                  {/* Mockup Column 3: Live QR Share mini card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-medblue-950 text-white flex flex-col justify-between shadow-soft-md">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                          Doctor Sharing Access
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <h4 className="text-sm font-bold">Encrypted QR Pass</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Authorizes emergency or clinical review for 30 minutes.
                      </p>
                    </div>

                    <div className="my-4 bg-white p-3 rounded-xl mx-auto w-32 h-32 flex items-center justify-center">
                      <QrCode className="w-24 h-24 text-slate-900" />
                    </div>

                    <div className="text-center">
                      <span className="text-[11px] font-mono text-slate-300 bg-white/10 px-2.5 py-1 rounded-md">
                        TOKEN: MG-SEC-8942-AUTH
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-medblue-600">The Problem</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
              Fragmented Healthcare Leads to Dangerous Blind Spots
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Patients often visit multiple doctors, hospitals and pharmacies. Their medication information can become scattered across prescriptions and reports.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Problem Card 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-soft hover:shadow-soft-md transition-all">
              <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-6">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Scattered Medication Records</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Hospital discharge papers, clinic slips, and retail pharmacy bags rarely talk to one another, leaving patients uncertain of their full active regimen.
              </p>
            </div>

            {/* Problem Card 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-soft hover:shadow-soft-md transition-all">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-6">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Potential Drug Interactions</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                A specialist prescribing a new medicine may not know about drugs prescribed by other doctors, triggering accidental, severe contraindications.
              </p>
            </div>

            {/* Problem Card 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-soft hover:shadow-soft-md transition-all">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-6">
                <CopyCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Duplicate Medicines</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Different brand names often contain identical chemical ingredients, leading patients to unknowingly take double doses of statins or blood pressure drugs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-medteal-600">The Solution</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
              How MedGap Bridges the Gap
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              A 4-step workflow engineered to keep patients protected and healthcare providers aligned.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft relative">
              <div className="w-10 h-10 rounded-xl bg-medblue-600 text-white font-black flex items-center justify-center text-base mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Add Medication History</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Consolidate your ongoing prescriptions, vitamins, and past treatments in your private digital Medication Wallet.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft relative">
              <div className="w-10 h-10 rounded-xl bg-medteal-600 text-white font-black flex items-center justify-center text-base mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Upload Prescription</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drop in paper slips, photos, or digital PDFs. Intelligent OCR extracts medicine names, strengths, and frequencies automatically.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft relative">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-black flex items-center justify-center text-base mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Run Safety Check</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                MedGap instantly cross-references the new medicine against your recorded allergies, duplicate chemical classes, and drug interactions.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-base mb-4">
                4
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Review Alerts with Clinician</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive clear safety advisories to bring directly to your prescribing doctor or pharmacist before taking a single dose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features - 8 Feature Cards */}
      <section id="features" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-medblue-600">Comprehensive Safety</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
              8 Core Platform Pillars
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              Engineered with clinical rigor, human clarity, and strict adherence to patient safety guidelines.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-medblue-300 hover:shadow-soft-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-medblue-100 text-medblue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">1. Patient Profile</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Record demographic basics, blood group, recorded allergies, and chronic health conditions in one protected record.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-medblue-300 hover:shadow-soft-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">2. Medication Wallet</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Centralize active and discontinued medicines with strength, schedule, indication, and prescribing doctor.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-medblue-300 hover:shadow-soft-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">3. Prescription Upload</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drop in images or PDFs with realistic OCR reading, dosage identification, and verification before adding.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-medblue-300 hover:shadow-soft-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">4. Drug Interaction Checker</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Flag dangerous counteractions, antiplatelet bleeding hazards, and metabolic CYP inhibitors.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-medblue-300 hover:shadow-soft-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CopyCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">5. Duplicate Medicine Detection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Detects whether a newly prescribed brand duplicates an active generic ingredient or therapeutic statin/ACE inhibitor class.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-medblue-300 hover:shadow-soft-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">6. Allergy Alerts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cross-references active ingredients against documented allergies such as Penicillin or Sulfonamides.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="p-6 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-medblue-300 hover:shadow-soft-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">7. Medication History</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                An auditable timeline showing prescription uploads, dose adjustments, discontinuations, and safety checks.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="p-6 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-medblue-300 hover:shadow-soft-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">8. Secure Sharing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate temporary 30-minute encrypted QR codes for attending physicians or emergency department staff.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-medblue-900 via-medblue-950 to-slate-950 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 text-sky-300 text-xs font-semibold mb-6 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4" />
            <span>Medication Safety for Every Patient</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Start managing your medication information smarter.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Experience the complete patient-centric medication wallet, prescription OCR reader, and high-precision safety checker now.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleLaunchDemo}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-medblue-950 bg-white hover:bg-slate-100 active:scale-95 rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2"
            >
              <span>Open MedGap Dashboard</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            Hackathon prototype pre-loaded with patient Arun Kumar (52) • Zero setup required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-medblue-600 flex items-center justify-center text-white text-xs font-bold">
              MG
            </div>
            <span className="font-semibold text-slate-200">MedGap Health Technologies</span>
          </div>
          <div>
            <span>Potential risk detected — please consult a qualified healthcare professional.</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Hackathon Demo Edition</span>
            <span>•</span>
            <span>Privacy First</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
