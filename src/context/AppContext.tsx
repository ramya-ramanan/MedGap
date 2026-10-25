import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  NavigationPage, 
  PatientProfile, 
  Medication, 
  Prescription, 
  TimelineEvent, 
  SafetyAlert, 
  ToastMessage,
  SharingSession,
  RiskSeverity,
  AlertStatus,
  AdverseReaction,
  DoctorVisit,
  MedicalReport,
  LifestyleSubstanceItem,
  MedicationReminderItem
} from '../types';
import { 
  initialPatientProfile, 
  initialMedications, 
  initialPrescriptions, 
  initialTimelineEvents, 
  initialSafetyAlerts,
  initialAdverseReactions,
  initialDoctorVisits,
  initialMedicalReports,
  initialLifestyleHistory,
  initialReminders,
  safetyKnowledgeBase
} from '../data/mockData';
import { reminderService } from '../services/reminderService';
import { 
  getSupabaseConfig, 
  setSupabaseConfig, 
  clearSupabaseConfig, 
  isSupabaseLive, 
  getSupabase 
} from '../services/supabase';
import { medicationService } from '../services/medicationService';
import { prescriptionService } from '../services/prescriptionService';
import { safetyService } from '../services/safetyService';
import { shareService } from '../services/shareService';
import { profileService } from '../services/profileService';
import { authService } from '../services/authService';

export interface SafetyCheckResult {
  hasIssues: boolean;
  overallRisk: RiskSeverity;
  evaluatedMedicine: {
    name: string;
    strength: string;
    dosage: string;
  };
  allergyAlerts: {
    allergy: string;
    severity: RiskSeverity;
    description: string;
    clinicalNote: string;
  }[];
  adverseReactionAlerts?: {
    medicineName: string;
    reaction: string;
    severity: RiskSeverity;
    description: string;
    clinicalNote: string;
  }[];
  duplicateAlerts: {
    existingMedicine: string;
    duplicateClass: string;
    commonActiveIngredient: string;
    explanation: string;
  }[];
  interactionAlerts: {
    existingMedicine: string;
    severity: RiskSeverity;
    title: string;
    mechanism: string;
    recommendation: string;
  }[];
  conditionAlerts?: {
    condition: string;
    severity: RiskSeverity;
    description: string;
    clinicalNote: string;
  }[];
  summaryMessage: string;
  timestamp: string;
}

interface AppContextType {
  activePage: NavigationPage;
  setActivePage: (page: NavigationPage) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  patientProfile: PatientProfile;
  updatePatientProfile: (profile: Partial<PatientProfile>) => void;
  medications: Medication[];
  addMedication: (med: Omit<Medication, 'id'>) => Medication;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  toggleMedicationStatus: (id: string) => void;
  prescriptions: Prescription[];
  addPrescription: (rx: Omit<Prescription, 'id'>) => Prescription;
  timelineEvents: TimelineEvent[];
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void;
  safetyAlerts: SafetyAlert[];
  addSafetyAlert: (alert: Omit<SafetyAlert, 'id'>) => void;
  resolveSafetyAlert: (id: string) => void;
  sharingSession: SharingSession | null;
  generateSharingSession: (durationMinutes?: number) => Promise<SharingSession | null>;
  revokeSharingSession: () => void;
  runSafetyEvaluation: (medicineName: string, strength?: string, dosage?: string) => SafetyCheckResult;
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  resetToDemoData: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // Medical Locker (Adverse Reactions, Doctor Visits, Medical Reports)
  adverseReactions: AdverseReaction[];
  addAdverseReaction: (reaction: Omit<AdverseReaction, 'id'>) => AdverseReaction;
  removeAdverseReaction: (id: string) => void;
  doctorVisits: DoctorVisit[];
  addDoctorVisit: (visit: Omit<DoctorVisit, 'id'>) => DoctorVisit;
  removeDoctorVisit: (id: string) => void;
  medicalReports: MedicalReport[];
  addMedicalReport: (report: Omit<MedicalReport, 'id'>) => MedicalReport;
  removeMedicalReport: (id: string) => void;
  // Lifestyle & Substance History
  lifestyleHistory: LifestyleSubstanceItem[];
  addLifestyleItem: (item: Omit<LifestyleSubstanceItem, 'id'>) => Promise<LifestyleSubstanceItem | null>;
  updateLifestyleItem: (id: string, updates: Partial<LifestyleSubstanceItem>) => Promise<boolean>;
  removeLifestyleItem: (id: string) => Promise<boolean>;
  // Medication Reminders & Notifications
  reminders: MedicationReminderItem[];
  addReminder: (item: Omit<MedicationReminderItem, 'id'>) => Promise<MedicationReminderItem>;
  updateReminder: (id: string, updates: Partial<MedicationReminderItem>) => Promise<boolean>;
  removeReminder: (id: string) => Promise<boolean>;
  toggleReminder: (id: string) => Promise<boolean>;
  // Supabase Backend Integration
  isSupabaseConnected: boolean;
  supabaseConfig: { url: string; anonKey: string; isConfigured: boolean };
  setSupabaseCredentials: (url: string, key: string) => Promise<boolean>;
  disconnectSupabase: () => void;
  checkConnection: () => Promise<boolean>;
  // Demo Mode and Profile Sync
  isDemoMode: boolean;
  setIsDemoMode: (isDemo: boolean) => void;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
  loadSupabaseUserProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'medgap_patient_profile_v1',
  MEDICATIONS: 'medgap_medications_v1',
  PRESCRIPTIONS: 'medgap_prescriptions_v1',
  TIMELINE: 'medgap_timeline_v1',
  ALERTS: 'medgap_safety_alerts_v1',
  AUTH: 'medgap_auth_v1',
  SHARE: 'medgap_active_share_session',
  IS_DEMO: 'medgap_is_demo_v1',
  ADVERSE_REACTIONS: 'medgap_adverse_reactions_v1',
  DOCTOR_VISITS: 'medgap_doctor_visits_v1',
  MEDICAL_REPORTS: 'medgap_medical_reports_v1',
  LIFESTYLE_HISTORY: 'medgap_lifestyle_history_v1',
  REMINDERS: 'medgap_medication_reminders_v1',
};

export const defaultEmptyPatientProfile: PatientProfile = {
  id: '',
  fullName: 'Patient',
  age: 0,
  gender: 'Not specified',
  bloodGroup: 'Not specified',
  email: '',
  phone: '',
  emergencyContact: {
    name: '',
    relationship: '',
    phone: '',
  },
  knownAllergies: [],
  existingConditions: [],
  primaryCarePhysician: 'Not assigned',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Authentication
  const [activePage, setActivePage] = useState<NavigationPage>('landing');
  
  // Track if current session is demo data vs real authenticated account (default to false)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_DEMO);
    return saved ? JSON.parse(saved) : false;
  });

  // Never automatically sign in any demo patient (default to false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
    return saved ? JSON.parse(saved) : false;
  });

  // Search query global helper
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Supabase connection state
  const [supabaseConfigState, setSupabaseConfigState] = useState(() => getSupabaseConfig());
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);

  // Patient Profile - Default to Patient, never pre-fill Arun Kumar unless explicitly in demo mode
  const [patientProfile, setPatientProfile] = useState<PatientProfile>(() => {
    const savedDemo = localStorage.getItem(STORAGE_KEYS.IS_DEMO);
    const isDemo = savedDemo ? JSON.parse(savedDemo) : false;
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!isDemo && (parsed.fullName === 'Arun Kumar' || parsed.id === 'pt-arun-52')) {
          return defaultEmptyPatientProfile;
        }
        return parsed;
      } catch (e) {}
    }
    return isDemo ? initialPatientProfile : defaultEmptyPatientProfile;
  });

  // Medications
  const [medications, setMedications] = useState<Medication[]>(() => {
    const savedDemo = localStorage.getItem(STORAGE_KEYS.IS_DEMO);
    const isDemo = savedDemo ? JSON.parse(savedDemo) : false;
    const saved = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return isDemo ? initialMedications : [];
  });

  // Prescriptions
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const savedDemo = localStorage.getItem(STORAGE_KEYS.IS_DEMO);
    const isDemo = savedDemo ? JSON.parse(savedDemo) : false;
    const saved = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return isDemo ? initialPrescriptions : [];
  });

  // Timeline
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(() => {
    const savedDemo = localStorage.getItem(STORAGE_KEYS.IS_DEMO);
    const isDemo = savedDemo ? JSON.parse(savedDemo) : false;
    const saved = localStorage.getItem(STORAGE_KEYS.TIMELINE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return isDemo ? initialTimelineEvents : [];
  });

  // Safety Alerts
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>(() => {
    const savedDemo = localStorage.getItem(STORAGE_KEYS.IS_DEMO);
    const isDemo = savedDemo ? JSON.parse(savedDemo) : false;
    const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return isDemo ? initialSafetyAlerts : [];
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sharing Session
  const [sharingSession, setSharingSession] = useState<SharingSession | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHARE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.expiresAt = new Date(parsed.expiresAt);
        if (parsed.expiresAt > new Date()) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  // Digital Medical Locker: Adverse Reactions
  const [adverseReactions, setAdverseReactions] = useState<AdverseReaction[]>(() => {
    const savedDemo = localStorage.getItem(STORAGE_KEYS.IS_DEMO);
    const isDemo = savedDemo ? JSON.parse(savedDemo) : false;
    const saved = localStorage.getItem(STORAGE_KEYS.ADVERSE_REACTIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return isDemo ? initialAdverseReactions : [];
  });

  // Digital Medical Locker: Doctor Visits
  const [doctorVisits, setDoctorVisits] = useState<DoctorVisit[]>(() => {
    const savedDemo = localStorage.getItem(STORAGE_KEYS.IS_DEMO);
    const isDemo = savedDemo ? JSON.parse(savedDemo) : false;
    const saved = localStorage.getItem(STORAGE_KEYS.DOCTOR_VISITS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return isDemo ? initialDoctorVisits : [];
  });

  // Digital Medical Locker: Medical Reports
  const [medicalReports, setMedicalReports] = useState<MedicalReport[]>(() => {
    const savedDemo = localStorage.getItem(STORAGE_KEYS.IS_DEMO);
    const isDemo = savedDemo ? JSON.parse(savedDemo) : false;
    const saved = localStorage.getItem(STORAGE_KEYS.MEDICAL_REPORTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return isDemo ? initialMedicalReports : [];
  });

  // Lifestyle & Substance History
  const [lifestyleHistory, setLifestyleHistory] = useState<LifestyleSubstanceItem[]>(() => {
    const savedDemo = localStorage.getItem(STORAGE_KEYS.IS_DEMO);
    const isDemo = savedDemo ? JSON.parse(savedDemo) : false;
    const saved = localStorage.getItem(STORAGE_KEYS.LIFESTYLE_HISTORY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return isDemo ? initialLifestyleHistory : [];
  });

  // Medication Reminders
  const [reminders, setReminders] = useState<MedicationReminderItem[]>(() => {
    const savedDemo = localStorage.getItem(STORAGE_KEYS.IS_DEMO);
    const isDemo = savedDemo ? JSON.parse(savedDemo) : false;
    const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return isDemo ? initialReminders : [];
  });

  // Check Supabase connection and load profile on load
  const checkConnection = async (): Promise<boolean> => {
    const live = await isSupabaseLive();
    setIsSupabaseConnected(live);
    setSupabaseConfigState(getSupabaseConfig());
    return live;
  };

  const loadSupabaseUserProfile = async () => {
    const live = await isSupabaseLive();
    if (!live) return;

    try {
      const user = await authService.getCurrentUser();
      if (user?.id) {
        setIsAuthenticated(true);
        setIsDemoMode(false);
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(true));
        localStorage.setItem(STORAGE_KEYS.IS_DEMO, JSON.stringify(false));

        // Fetch profile using authenticated user's ID from Supabase profiles table
        const dbProfile = await profileService.getProfile(user.id);
        const health = await profileService.getPatientHealth(user.id);

        // Name resolution: profiles table full_name -> auth user signup metadata -> 'Patient'
        const rawName = dbProfile?.full_name || (user.user_metadata as any)?.full_name;
        const resolvedName = (rawName && rawName.trim()) ? rawName.trim() : 'Patient';

        let calculatedAge = 0;
        const dobStr = dbProfile?.date_of_birth || (user.user_metadata as any)?.date_of_birth;
        if (dobStr) {
          const birthYear = new Date(dobStr).getFullYear();
          if (!isNaN(birthYear)) {
            calculatedAge = new Date().getFullYear() - birthYear;
          }
        }

        const resolvedEmail = dbProfile?.email || user.email || '';
        const resolvedPhone = dbProfile?.phone || (user.user_metadata as any)?.phone || '';
        const resolvedGender = dbProfile?.gender || (user.user_metadata as any)?.gender || 'Not specified';

        const updatedProf: PatientProfile = {
          id: user.id,
          fullName: resolvedName,
          age: calculatedAge,
          gender: resolvedGender,
          bloodGroup: health?.blood_group || 'Not specified',
          email: resolvedEmail,
          phone: resolvedPhone,
          emergencyContact: health?.emergency_contact || { name: '', relationship: '', phone: '' },
          knownAllergies: health?.allergies || [],
          existingConditions: health?.conditions || [],
          primaryCarePhysician: health?.primary_care_physician || 'Not assigned',
        };

        setPatientProfile(updatedProf);
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProf));

        // Fetch user's own records from Supabase tables
        try {
          const userMeds = await medicationService.getPatientMedications(user.id);
          if (userMeds !== null) {
            setMedications(userMeds);
          }

          const userRxs = await prescriptionService.getPrescriptions(user.id);
          if (userRxs !== null) {
            setPrescriptions(userRxs);
          }

          const userAlerts = await safetyService.getSafetyAlerts(user.id);
          if (userAlerts !== null) {
            setSafetyAlerts(userAlerts);
          }

          const userTimeline = await profileService.getUserHistory(user.id);
          if (userTimeline !== null) {
            setTimelineEvents(userTimeline);
          }

          const userAdrs = await profileService.getAdverseReactions(user.id);
          if (userAdrs !== null) {
            setAdverseReactions(userAdrs);
          }

          const userVisits = await profileService.getDoctorVisits(user.id);
          if (userVisits !== null) {
            setDoctorVisits(userVisits);
          }

          const userReports = await profileService.getMedicalReports(user.id);
          if (userReports !== null) {
            setMedicalReports(userReports);
          }
        } catch (fetchErr) {
          console.warn('Could not load user records from Supabase:', fetchErr);
        }
      }
    } catch (err) {
      console.error('Failed to load user profile from Supabase:', err);
    }
  };

  useEffect(() => {
    checkConnection().then((live) => {
      if (live) {
        loadSupabaseUserProfile();
      }
    });

    const sub = authService.onAuthStateChange((event, session) => {
      if (session?.user) {
        loadSupabaseUserProfile();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsDemoMode(false);
        setPatientProfile(defaultEmptyPatientProfile);
        setMedications([]);
        setPrescriptions([]);
        setTimelineEvents([]);
        setSafetyAlerts([]);
        setAdverseReactions([]);
        setDoctorVisits([]);
        setMedicalReports([]);
      }
    });

    return () => {
      if (sub?.unsubscribe) sub.unsubscribe();
    };
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(patientProfile));
  }, [patientProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(timelineEvents));
  }, [timelineEvents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(safetyAlerts));
  }, [safetyAlerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADVERSE_REACTIONS, JSON.stringify(adverseReactions));
  }, [adverseReactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCTOR_VISITS, JSON.stringify(doctorVisits));
  }, [doctorVisits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEDICAL_REPORTS, JSON.stringify(medicalReports));
  }, [medicalReports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_DEMO, JSON.stringify(isDemoMode));
  }, [isDemoMode]);

  useEffect(() => {
    if (sharingSession) {
      localStorage.setItem(STORAGE_KEYS.SHARE, JSON.stringify(sharingSession));
    }
  }, [sharingSession]);

  // Toast Helpers
  const addToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Supabase credentials configuration
  const setSupabaseCredentials = async (url: string, key: string): Promise<boolean> => {
    setSupabaseConfig(url, key);
    setSupabaseConfigState(getSupabaseConfig());
    const isLive = await isSupabaseLive();
    setIsSupabaseConnected(isLive);
    if (isLive) {
      addToast('Supabase Connected', 'Live PostgreSQL database and Auth connected successfully.', 'success');
    } else {
      addToast('Connection Failed', 'Could not establish connection to Supabase. Check URL and Anon Key.', 'error');
    }
    return isLive;
  };

  const disconnectSupabase = () => {
    clearSupabaseConfig();
    setSupabaseConfigState(getSupabaseConfig());
    setIsSupabaseConnected(false);
    addToast('Demo Mode Active', 'Switched back to in-browser demo database.', 'info');
  };

  // Profile management
  const updatePatientProfile = async (updates: Partial<PatientProfile>) => {
    setPatientProfile((prev) => {
      const updated = { ...prev, ...updates };
      return updated;
    });

    // If connected to live Supabase and not in demo mode, persist to profiles table
    if (isSupabaseConnected && !isDemoMode) {
      try {
        const user = await authService.getCurrentUser();
        const effectiveId = user?.id || patientProfile.id;
        if (effectiveId) {
          await profileService.updateProfile(effectiveId, {
            full_name: updates.fullName,
            email: updates.email,
            phone: updates.phone,
            gender: updates.gender,
          });

          if (updates.knownAllergies || updates.existingConditions || updates.emergencyContact) {
            await profileService.updatePatientHealth(effectiveId, {
              allergies: updates.knownAllergies,
              conditions: updates.existingConditions,
              emergency_contact: updates.emergencyContact,
              blood_group: updates.bloodGroup,
            });
          }
        }
      } catch (err) {
        console.warn('Failed to sync profile update to Supabase:', err);
      }
    }

    addToast('Profile Updated', 'Patient demographic and clinical profile saved successfully.', 'success');
  };

  // Medication operations
  const addMedication = (medData: Omit<Medication, 'id'>): Medication => {
    const newMed: Medication = {
      ...medData,
      id: `med-${Date.now()}`,
    };
    setMedications((prev) => [newMed, ...prev]);

    // Record timeline event
    addTimelineEvent({
      date: 'Today',
      relativeTime: 'Just now',
      title: `Added Medication: ${newMed.name} (${newMed.strength})`,
      description: `Prescribed by ${newMed.prescribedBy}. Indication: ${newMed.indication}`,
      type: 'added',
      badgeColor: 'emerald',
      metadata: newMed.frequency,
    });

    // If Supabase is connected, asynchronously persist to database
    if (isSupabaseConnected && !isDemoMode && patientProfile.id) {
      medicationService.addMedication(patientProfile.id, newMed).catch((err) => {
        console.warn('Background Supabase sync notice:', err);
      });
    }

    addToast('Medication Added', `${newMed.name} ${newMed.strength} was added to your Medication Wallet.`, 'success');
    return newMed;
  };

  const updateMedication = (id: string, updates: Partial<Medication>) => {
    setMedications((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    if (isSupabaseConnected) {
      medicationService.updateMedication(id, updates).catch(console.warn);
    }
    addToast('Medication Updated', 'Medication details have been updated.', 'info');
  };

  const deleteMedication = (id: string) => {
    const target = medications.find((m) => m.id === id);
    setMedications((prev) => prev.filter((m) => m.id !== id));
    if (target) {
      if (isSupabaseConnected) {
        medicationService.deleteMedication(id).catch(console.warn);
      }
      addToast('Medication Removed', `${target.name} has been removed from your wallet.`, 'warning');
    }
  };

  const toggleMedicationStatus = (id: string) => {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextStatus = m.status === 'Active' ? 'Discontinued' : 'Active';
          addTimelineEvent({
            date: 'Today',
            relativeTime: 'Just now',
            title: `Status Changed: ${m.name} is now ${nextStatus}`,
            description: `Patient or clinician marked ${m.name} as ${nextStatus.toLowerCase()}.`,
            type: 'discontinued',
            badgeColor: nextStatus === 'Active' ? 'emerald' : 'amber',
            metadata: nextStatus,
          });
          if (isSupabaseConnected && !isDemoMode && patientProfile.id) {
            medicationService.discontinueMedication(patientProfile.id, id, m.name).catch(console.warn);
          }
          addToast('Status Changed', `${m.name} is now marked as ${nextStatus}.`, 'info');
          return {
            ...m,
            status: nextStatus,
            endDate: nextStatus === 'Discontinued' ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return m;
      })
    );
  };

  // Digital Medical Locker Operations
  const addAdverseReaction = (item: Omit<AdverseReaction, 'id'>): AdverseReaction => {
    const newAdr: AdverseReaction = {
      ...item,
      id: `adr-${Date.now()}`,
    };
    setAdverseReactions((prev) => [newAdr, ...prev]);

    addTimelineEvent({
      date: 'Today',
      relativeTime: 'Just now',
      title: `Logged Adverse Reaction: ${newAdr.medicineName}`,
      description: `Reported reaction: ${newAdr.reaction} (${newAdr.severity} severity).`,
      type: 'profile_updated',
      badgeColor: 'rose',
      metadata: newAdr.severity,
    });

    if (isSupabaseConnected && !isDemoMode && patientProfile.id) {
      profileService.addAdverseReaction(patientProfile.id, newAdr).catch(console.warn);
    }

    addToast('Adverse Reaction Recorded', `Hypersensitivity note for ${newAdr.medicineName} added to locker.`, 'warning');
    return newAdr;
  };

  const removeAdverseReaction = (id: string) => {
    setAdverseReactions((prev) => prev.filter((a) => a.id !== id));
    if (isSupabaseConnected && !isDemoMode && patientProfile.id) {
      profileService.removeAdverseReaction(patientProfile.id, id).catch(console.warn);
    }
    addToast('Record Removed', 'Adverse reaction entry removed from your locker.', 'info');
  };

  const addDoctorVisit = (item: Omit<DoctorVisit, 'id'>): DoctorVisit => {
    const newVisit: DoctorVisit = {
      ...item,
      id: `visit-${Date.now()}`,
    };
    setDoctorVisits((prev) => [newVisit, ...prev]);

    addTimelineEvent({
      date: 'Today',
      relativeTime: 'Just now',
      title: `Doctor Visit Recorded: ${newVisit.doctorName}`,
      description: `Consultation at ${newVisit.clinicOrHospital} for ${newVisit.reasonForVisit}.`,
      type: 'profile_updated',
      badgeColor: 'indigo',
      metadata: newVisit.specialty,
    });

    if (isSupabaseConnected && !isDemoMode && patientProfile.id) {
      profileService.addDoctorVisit(patientProfile.id, newVisit).catch(console.warn);
    }

    addToast('Consultation Saved', `Doctor visit with ${newVisit.doctorName} recorded.`, 'success');
    return newVisit;
  };

  const removeDoctorVisit = (id: string) => {
    setDoctorVisits((prev) => prev.filter((v) => v.id !== id));
    if (isSupabaseConnected && !isDemoMode && patientProfile.id) {
      profileService.removeDoctorVisit(patientProfile.id, id).catch(console.warn);
    }
    addToast('Visit Removed', 'Doctor visit record removed.', 'info');
  };

  const addMedicalReport = (item: Omit<MedicalReport, 'id'>): MedicalReport => {
    const newReport: MedicalReport = {
      ...item,
      id: `rep-${Date.now()}`,
      fileName: item.fileName || `${item.title.replace(/\s+/g, '_')}.pdf`,
    };
    setMedicalReports((prev) => [newReport, ...prev]);

    addTimelineEvent({
      date: 'Today',
      relativeTime: 'Just now',
      title: `Archived Medical Report: ${newReport.title}`,
      description: `${newReport.reportType} from ${newReport.facilityOrDoctor}.`,
      type: 'scan',
      badgeColor: 'sky',
      metadata: newReport.reportType,
    });

    if (isSupabaseConnected && !isDemoMode && patientProfile.id) {
      profileService.addMedicalReport(patientProfile.id, newReport).catch(console.warn);
    }

    addToast('Report Archived', `${newReport.title} saved to your digital medical locker.`, 'success');
    return newReport;
  };

  const removeMedicalReport = (id: string) => {
    setMedicalReports((prev) => prev.filter((r) => r.id !== id));
    if (isSupabaseConnected && !isDemoMode && patientProfile.id) {
      profileService.removeMedicalReport(patientProfile.id, id).catch(console.warn);
    }
    addToast('Report Removed', 'Medical report removed from your locker.', 'info');
  };

  // Lifestyle & Substance History Operations
  const addLifestyleItem = async (item: Omit<LifestyleSubstanceItem, 'id'>): Promise<LifestyleSubstanceItem | null> => {
    let created: LifestyleSubstanceItem | null = null;
    if (isSupabaseConnected && !isDemoMode && patientProfile.id) {
      created = await profileService.addLifestyleItem(patientProfile.id, item);
    }
    if (!created) {
      created = {
        ...item,
        id: `life-${Date.now()}`,
        updatedAt: new Date().toISOString(),
      };
    }
    setLifestyleHistory((prev) => {
      const next = [created!, ...prev.filter((p) => p.id !== created!.id)];
      localStorage.setItem(STORAGE_KEYS.LIFESTYLE_HISTORY, JSON.stringify(next));
      return next;
    });

    addTimelineEvent({
      date: 'Today',
      relativeTime: 'Just now',
      title: `Lifestyle History Logged: ${item.substanceType}`,
      description: `Status: ${item.status}. ${item.notes || ''}`,
      type: 'profile_updated',
      badgeColor: 'sky',
      metadata: item.substanceType,
    });

    addToast('Lifestyle History Saved', `Recorded ${item.substanceType} history.`, 'success');
    return created;
  };

  const updateLifestyleItem = async (id: string, updates: Partial<LifestyleSubstanceItem>): Promise<boolean> => {
    if (isSupabaseConnected && !isDemoMode && patientProfile.id) {
      await profileService.updateLifestyleItem(patientProfile.id, id, updates);
    }
    setLifestyleHistory((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item));
      localStorage.setItem(STORAGE_KEYS.LIFESTYLE_HISTORY, JSON.stringify(next));
      return next;
    });
    addToast('Lifestyle Record Updated', 'Substance history updated successfully.', 'info');
    return true;
  };

  const removeLifestyleItem = async (id: string): Promise<boolean> => {
    if (isSupabaseConnected && !isDemoMode && patientProfile.id) {
      await profileService.removeLifestyleItem(patientProfile.id, id);
    }
    setLifestyleHistory((prev) => {
      const next = prev.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEYS.LIFESTYLE_HISTORY, JSON.stringify(next));
      return next;
    });
    addToast('Record Removed', 'Lifestyle history entry removed.', 'info');
    return true;
  };

  // Medication Reminders Operations
  const addReminder = async (item: Omit<MedicationReminderItem, 'id'>): Promise<MedicationReminderItem> => {
    const effectiveUserId = patientProfile.id || 'local_patient';
    const created = await reminderService.addReminder(effectiveUserId, item);
    setReminders((prev) => {
      const next = [...prev.filter((r) => r.id !== created.id), created];
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(next));
      return next;
    });
    reminderService.requestNotificationPermission();
    addToast('Reminder Scheduled', `Scheduled reminder for ${item.medicineName} at ${item.reminderTime}.`, 'success');
    return created;
  };

  const updateReminder = async (id: string, updates: Partial<MedicationReminderItem>): Promise<boolean> => {
    const effectiveUserId = patientProfile.id || 'local_patient';
    await reminderService.updateReminder(effectiveUserId, id, updates);
    setReminders((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...updates } : r));
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(next));
      return next;
    });
    addToast('Reminder Updated', 'Medication reminder settings updated.', 'info');
    return true;
  };

  const removeReminder = async (id: string): Promise<boolean> => {
    const effectiveUserId = patientProfile.id || 'local_patient';
    await reminderService.deleteReminder(effectiveUserId, id);
    setReminders((prev) => {
      const next = prev.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(next));
      return next;
    });
    addToast('Reminder Removed', 'Medication reminder deleted.', 'info');
    return true;
  };

  const toggleReminder = async (id: string): Promise<boolean> => {
    const target = reminders.find((r) => r.id === id);
    if (!target) return false;
    const nextState = !target.isEnabled;
    return await updateReminder(id, { isEnabled: nextState });
  };

  // Background timer to check due reminders
  useEffect(() => {
    const timer = setInterval(() => {
      reminderService.checkDueReminders(reminders, (medName, dosage) => {
        addToast(
          '⏰ Medication Reminder',
          `Time to take your scheduled ${medName} (${dosage || 'prescribed dose'}).`,
          'info'
        );
      });
    }, 20000);

    return () => clearInterval(timer);
  }, [reminders]);

  // Prescription operations
  const addPrescription = (rxData: Omit<Prescription, 'id'>): Prescription => {
    const newRx: Prescription = {
      ...rxData,
      id: `rx-${Date.now()}`,
    };
    setPrescriptions((prev) => [newRx, ...prev]);

    addTimelineEvent({
      date: 'Today',
      relativeTime: 'Just now',
      title: `Prescription Uploaded: ${newRx.doctorName}`,
      description: `Extracted ${newRx.extractedMedicines.length} verified medications. Clinic: ${newRx.hospitalOrClinic}.`,
      type: 'prescription',
      badgeColor: 'indigo',
      metadata: newRx.prescriptionNumber,
    });

    addToast('Prescription Uploaded', `Record from ${newRx.doctorName} successfully digitized.`, 'success');
    return newRx;
  };

  // Timeline operations
  const addTimelineEvent = (eventData: Omit<TimelineEvent, 'id'>) => {
    const newEvt: TimelineEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
    };
    setTimelineEvents((prev) => [newEvt, ...prev]);
  };

  // Safety Alert operations
  const addSafetyAlert = (alertData: Omit<SafetyAlert, 'id'>) => {
    const newAlert: SafetyAlert = {
      ...alertData,
      id: `alert-${Date.now()}`,
    };
    setSafetyAlerts((prev) => [newAlert, ...prev]);
  };

  const resolveSafetyAlert = (id: string) => {
    setSafetyAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true, status: 'Resolved' as AlertStatus } : a)));
    if (isSupabaseConnected) {
      safetyService.updateAlertStatus(id, 'Resolved').catch(console.warn);
    }
    addToast('Alert Resolved', 'The safety alert has been marked as reviewed and resolved.', 'info');
  };

  // Sharing operations
  const generateSharingSession = async (durationMinutes: number = 30): Promise<SharingSession | null> => {
    let effectiveUserId = patientProfile.id;
    if (isSupabaseConnected && !isDemoMode) {
      try {
        const user = await authService.getCurrentUser();
        if (user?.id) {
          effectiveUserId = user.id;
        }
      } catch (err) {
        console.warn('Could not retrieve current authenticated user:', err);
      }
    }

    const session = await shareService.createShareToken(effectiveUserId, durationMinutes, 'Doctor');
    if (session) {
      setSharingSession(session);
      localStorage.setItem(STORAGE_KEYS.SHARE, JSON.stringify(session));

      addTimelineEvent({
        date: 'Today',
        relativeTime: 'Just now',
        title: 'Secure Sharing Pass Created',
        description: `Temporary ${durationMinutes}-minute QR pass created. Token: ${session.token}`,
        type: 'shared',
        badgeColor: 'sky',
        metadata: 'Active',
      });

      addToast('Secure QR Pass Ready', `Temporary ${durationMinutes}-minute doctor link generated.`, 'success');
      return session;
    }
    return null;
  };

  const revokeSharingSession = async () => {
    if (sharingSession) {
      const revoked = { ...sharingSession, isActive: false, remainingMinutes: 0 };
      setSharingSession(revoked);
      localStorage.setItem(STORAGE_KEYS.SHARE, JSON.stringify(revoked));
      await shareService.revokeShareToken(sharingSession.token).catch(console.warn);

      addTimelineEvent({
        date: 'Today',
        relativeTime: 'Just now',
        title: 'Secure Sharing Pass Revoked',
        description: `Access pass ${sharingSession.token} was revoked by the patient.`,
        type: 'shared',
        badgeColor: 'rose',
        metadata: 'Revoked',
      });

      addToast('Access Revoked', 'Temporary clinician access has been immediately invalidated.', 'warning');
    }
  };

  // 4-Dimension Medication Safety Checker Engine
  const runSafetyEvaluation = (medicineName: string, strength: string = '', dosage: string = ''): SafetyCheckResult => {
    const cleanName = medicineName.trim().toLowerCase();
    const activeMeds = medications.filter((m) => m.status === 'Active');

    const allergyAlerts: SafetyCheckResult['allergyAlerts'] = [];
    const adverseReactionAlerts: SafetyCheckResult['adverseReactionAlerts'] = [];
    const duplicateAlerts: SafetyCheckResult['duplicateAlerts'] = [];
    const interactionAlerts: SafetyCheckResult['interactionAlerts'] = [];
    const conditionAlerts: SafetyCheckResult['conditionAlerts'] = [];

    // 1. ALLERGY CHECK (Known Allergies & Cross-Reactivity)
    patientProfile.knownAllergies.forEach((allergy) => {
      const allergyLower = allergy.toLowerCase();
      const allergenGroup = safetyKnowledgeBase.allergenGroups.find(
        (g) => g.allergen.toLowerCase().includes(allergyLower) || allergyLower.includes(g.allergen.toLowerCase())
      );

      if (allergenGroup) {
        const isConflict = allergenGroup.conflictingDrugs.some(
          (drug) => cleanName.includes(drug) || drug.includes(cleanName)
        );
        if (isConflict) {
          allergyAlerts.push({
            allergy: allergenGroup.allergen,
            severity: 'High',
            description: `🚨 ALLERGY ALERT: ${medicineName} cross-reacts with recorded ${allergenGroup.allergen} allergy. ${allergenGroup.riskDescription}`,
            clinicalNote: allergenGroup.clinicalNote,
          });
        }
      } else if (cleanName.includes(allergyLower) || allergyLower.includes(cleanName)) {
        allergyAlerts.push({
          allergy,
          severity: 'High',
          description: `🚨 DIRECT ALLERGY ALERT: ${medicineName} matches patient recorded allergy: ${allergy}.`,
          clinicalNote: 'Strict hypersensitivity contraindication. Healthcare professional review required.',
        });
      }
    });

    // 2. PREVIOUS ADVERSE REACTIONS & SIDE EFFECTS (ADRs)
    adverseReactions.forEach((adr) => {
      const adrMedLower = adr.medicineName.toLowerCase();
      if (cleanName.includes(adrMedLower) || adrMedLower.includes(cleanName)) {
        const sev = adr.severity === 'Severe' || adr.severity === 'Life-Threatening' ? 'High' : 'Moderate';
        adverseReactionAlerts.push({
          medicineName: adr.medicineName,
          reaction: adr.reaction,
          severity: sev,
          description: `⚠️ PREVIOUS ADVERSE REACTION: Patient previously experienced "${adr.reaction}" with ${adr.medicineName} (${adr.dateRecorded}). Re-exposure carries significant hypersensitivity or adverse event recurrence risk.`,
          clinicalNote: adr.notes ? `Patient notes: ${adr.notes}. Clinical review required before re-administration.` : 'Clinical review required before re-administration.',
        });
      }
    });

    // 3. DUPLICATE THERAPY & DRUG INTERACTIONS (Active Regimen)
    safetyKnowledgeBase.duplicateClasses.forEach((cls) => {
      const matchesNewMed = cls.drugs.some((d) => cleanName.includes(d) || d.includes(cleanName));
      if (matchesNewMed) {
        activeMeds.forEach((existing) => {
          const existingLower = (existing.name + ' ' + existing.genericName).toLowerCase();
          const matchesExisting = cls.drugs.some((d) => existingLower.includes(d));
          if (matchesExisting) {
            duplicateAlerts.push({
              existingMedicine: existing.name,
              duplicateClass: cls.className,
              commonActiveIngredient: cls.commonActiveIngredient,
              explanation: `⚠️ DUPLICATE THERAPY: ${medicineName} and active medication ${existing.name} belong to the same therapeutic class (${cls.className}, shared active: ${cls.commonActiveIngredient}). Risk of cumulative toxicity or dose duplication.`,
            });
          }
        });
      }
    });

    safetyKnowledgeBase.drugInteractions.forEach((rule) => {
      const drugALower = rule.drugA.toLowerCase();
      const drugBLower = rule.drugB.toLowerCase();

      activeMeds.forEach((existing) => {
        const existingLower = (existing.name + ' ' + existing.genericName).toLowerCase();

        const newIsA = cleanName.includes(drugALower) || drugALower.includes(cleanName);
        const existingIsB = existingLower.includes(drugBLower);

        const newIsB = cleanName.includes(drugBLower) || drugBLower.includes(cleanName);
        const existingIsA = existingLower.includes(drugALower);

        if ((newIsA && existingIsB) || (newIsB && existingIsA)) {
          interactionAlerts.push({
            existingMedicine: existing.name,
            severity: rule.severity,
            title: rule.title,
            mechanism: `🚨 INTERACTION: ${rule.title}. ${rule.mechanism}`,
            recommendation: rule.recommendation,
          });
        }
      });
    });

    // 4. MEDICAL CONDITION CONTRAINDICATIONS
    const conditionContraindications = [
      {
        conditionKeywords: ['asthma', 'copd', 'bronchospasm'],
        drugKeywords: ['aspirin', 'ibuprofen', 'naproxen', 'diclofenac', 'propranolol', 'atenolol', 'metoprolol', 'carvedilol'],
        severity: 'High' as RiskSeverity,
        description: 'NSAIDs or non-selective beta-blockers may precipitate severe bronchospasm in patients with reactive airway disease.',
        clinicalNote: 'Cardioselective beta-blocker or paracetamol alternative recommended under clinical supervision.',
      },
      {
        conditionKeywords: ['hypertension', 'high blood pressure'],
        drugKeywords: ['pseudoephedrine', 'phenylephrine', 'ephedrine', 'oxymetazoline'],
        severity: 'Moderate' as RiskSeverity,
        description: 'Sympathomimetic decongestants cause peripheral vasoconstriction and can induce blood pressure spikes.',
        clinicalNote: 'Recommend saline sprays or non-sympathomimetic alternatives for nasal congestion.',
      },
      {
        conditionKeywords: ['peptic ulcer', 'gerd', 'gastric ulcer', 'stomach bleed'],
        drugKeywords: ['aspirin', 'ibuprofen', 'naproxen', 'ketorolac', 'diclofenac', 'indomethacin', 'meloxicam'],
        severity: 'High' as RiskSeverity,
        description: 'Non-steroidal anti-inflammatory agents impair gastric mucosal barrier prostaglandins, significantly increasing ulcer recurrence and bleeding risk.',
        clinicalNote: 'Co-prescribe PPI gastroprotection or use acetaminophen/paracetamol.',
      },
      {
        conditionKeywords: ['chronic kidney disease', 'ckd', 'renal impairment'],
        drugKeywords: ['ibuprofen', 'naproxen', 'diclofenac', 'ketorolac', 'gentamicin'],
        severity: 'High' as RiskSeverity,
        description: 'NSAIDs inhibit renal vasodilatory prostaglandins, decreasing renal perfusion and risking acute kidney injury.',
        clinicalNote: 'Monitor eGFR and serum creatinine; avoid nephrotoxic agents where possible.',
      },
      {
        conditionKeywords: ['diabetes', 'diabetic'],
        drugKeywords: ['prednisone', 'dexamethasone', 'hydrocortisone', 'methylprednisolone', 'prednisolone'],
        severity: 'Moderate' as RiskSeverity,
        description: 'Systemic corticosteroids stimulate hepatic gluconeogenesis and peripheral insulin resistance, causing marked glycemic spikes.',
        clinicalNote: 'Intensify blood glucose surveillance and adjust anti-diabetic pharmacotherapy if steroid course is necessary.',
      },
    ];

    patientProfile.existingConditions.forEach((cond) => {
      const condLower = cond.toLowerCase();
      conditionContraindications.forEach((contra) => {
        const condMatch = contra.conditionKeywords.some((ck) => condLower.includes(ck) || ck.includes(condLower));
        if (condMatch) {
          const drugMatch = contra.drugKeywords.some((dk) => cleanName.includes(dk) || dk.includes(cleanName));
          if (drugMatch) {
            conditionAlerts.push({
              condition: cond,
              severity: contra.severity,
              description: `⚠️ CONDITION CONTRAINDICATION: ${medicineName} is cautioned in patients with recorded condition "${cond}". ${contra.description}`,
              clinicalNote: contra.clinicalNote,
            });
          }
        }
      });
    });

    // Evaluate Risk Levels
    const hasHigh =
      allergyAlerts.some((a) => a.severity === 'High') ||
      adverseReactionAlerts.some((ar) => ar.severity === 'High') ||
      interactionAlerts.some((i) => i.severity === 'High') ||
      conditionAlerts.some((c) => c.severity === 'High');

    const hasModerate =
      allergyAlerts.some((a) => a.severity === 'Moderate') ||
      adverseReactionAlerts.some((ar) => ar.severity === 'Moderate') ||
      duplicateAlerts.length > 0 ||
      interactionAlerts.some((i) => i.severity === 'Moderate') ||
      conditionAlerts.some((c) => c.severity === 'Moderate');

    let overallRisk: RiskSeverity = 'Low';
    if (hasHigh) {
      overallRisk = 'High';
    } else if (hasModerate) {
      overallRisk = 'Moderate';
    }

    const hasIssues =
      allergyAlerts.length > 0 ||
      adverseReactionAlerts.length > 0 ||
      duplicateAlerts.length > 0 ||
      interactionAlerts.length > 0 ||
      conditionAlerts.length > 0;

    let summaryMessage = 'No conflicting interactions, duplicate therapy, allergy alerts, or adverse reaction conflicts detected.';
    if (overallRisk === 'High') {
      summaryMessage = '🚨 CRITICAL SAFETY ALERT: High-priority allergy, adverse reaction, or pharmacological conflict detected. Professional clinical review required before dispensing or administering.';
    } else if (overallRisk === 'Moderate') {
      summaryMessage = '⚠️ ADVISORY WARNING: Potential duplication, moderate drug interaction, or condition contraindication detected requiring clinical supervision.';
    }

    // Insert alert into state and history if issues found
    if (hasIssues) {
      if (allergyAlerts.length > 0) {
        addSafetyAlert({
          type: 'Allergy Related',
          severity: 'High',
          title: `Allergy Conflict: ${medicineName} & ${allergyAlerts[0].allergy}`,
          medicineA: medicineName,
          recordedAllergy: allergyAlerts[0].allergy,
          description: allergyAlerts[0].description,
          timestamp: 'Just now',
          status: 'Unreviewed',
          resolved: false,
        });
      }
      if (adverseReactionAlerts.length > 0) {
        addSafetyAlert({
          type: 'adverse_reaction',
          severity: adverseReactionAlerts[0].severity,
          title: `Adverse Reaction Alert: ${medicineName}`,
          medicineA: medicineName,
          adverseReaction: adverseReactionAlerts[0].reaction,
          description: adverseReactionAlerts[0].description,
          timestamp: 'Just now',
          status: 'Unreviewed',
          resolved: false,
        });
      }
      if (duplicateAlerts.length > 0) {
        addSafetyAlert({
          type: 'Possible Duplicate',
          severity: 'Moderate',
          title: `Possible Duplicate: ${medicineName} & ${duplicateAlerts[0].existingMedicine}`,
          medicineA: medicineName,
          medicineB: duplicateAlerts[0].existingMedicine,
          description: duplicateAlerts[0].explanation,
          timestamp: 'Just now',
          status: 'Unreviewed',
          resolved: false,
        });
      }
      if (interactionAlerts.length > 0) {
        addSafetyAlert({
          type: 'Drug Interaction',
          severity: interactionAlerts[0].severity,
          title: interactionAlerts[0].title,
          medicineA: medicineName,
          medicineB: interactionAlerts[0].existingMedicine,
          description: interactionAlerts[0].mechanism,
          timestamp: 'Just now',
          status: 'Unreviewed',
          resolved: false,
        });
      }
      if (conditionAlerts.length > 0) {
        addSafetyAlert({
          type: 'condition',
          severity: conditionAlerts[0].severity,
          title: `Condition Contraindication: ${medicineName} & ${conditionAlerts[0].condition}`,
          medicineA: medicineName,
          recordedCondition: conditionAlerts[0].condition,
          description: conditionAlerts[0].description,
          timestamp: 'Just now',
          status: 'Unreviewed',
          resolved: false,
        });
      }
    }

    addTimelineEvent({
      date: 'Today',
      relativeTime: 'Just now',
      title: `Safety Audit: ${medicineName} (${overallRisk} Risk)`,
      description: summaryMessage,
      type: 'scan',
      badgeColor: overallRisk === 'High' ? 'rose' : overallRisk === 'Moderate' ? 'amber' : 'emerald',
      metadata: `Risk: ${overallRisk}`,
    });

    return {
      hasIssues,
      overallRisk,
      evaluatedMedicine: {
        name: medicineName,
        strength: strength || 'Standard dose',
        dosage: dosage || 'As prescribed',
      },
      allergyAlerts,
      adverseReactionAlerts,
      duplicateAlerts,
      interactionAlerts,
      conditionAlerts,
      summaryMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // Reset demo state - keeps Arun Kumar strictly in demo data
  // Reset demo state - keeps Arun Kumar strictly in demo data
  const resetToDemoData = () => {
    setIsDemoMode(true);
    setPatientProfile(initialPatientProfile);
    setMedications(initialMedications);
    setPrescriptions(initialPrescriptions);
    setTimelineEvents(initialTimelineEvents);
    setSafetyAlerts(initialSafetyAlerts);
    setAdverseReactions(initialAdverseReactions);
    setDoctorVisits(initialDoctorVisits);
    setMedicalReports(initialMedicalReports);
    setLifestyleHistory(initialLifestyleHistory);
    setReminders(initialReminders);
    localStorage.setItem(STORAGE_KEYS.IS_DEMO, 'true');
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(initialPatientProfile));
    localStorage.removeItem(STORAGE_KEYS.MEDICATIONS);
    localStorage.removeItem(STORAGE_KEYS.PRESCRIPTIONS);
    localStorage.removeItem(STORAGE_KEYS.TIMELINE);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.ADVERSE_REACTIONS);
    localStorage.removeItem(STORAGE_KEYS.DOCTOR_VISITS);
    localStorage.removeItem(STORAGE_KEYS.MEDICAL_REPORTS);
    localStorage.removeItem(STORAGE_KEYS.LIFESTYLE_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.REMINDERS);
    addToast('Demo State Reset', "Restored Arun Kumar's initial medication dataset for demo presentation.", 'info');
  };

  // Dedicated 1-Click Demo Login
  const loginAsDemo = () => {
    setIsDemoMode(true);
    setPatientProfile(initialPatientProfile);
    setMedications(initialMedications);
    setPrescriptions(initialPrescriptions);
    setTimelineEvents(initialTimelineEvents);
    setSafetyAlerts(initialSafetyAlerts);
    setAdverseReactions(initialAdverseReactions);
    setDoctorVisits(initialDoctorVisits);
    setMedicalReports(initialMedicalReports);
    setLifestyleHistory(initialLifestyleHistory);
    setReminders(initialReminders);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.IS_DEMO, 'true');
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(initialPatientProfile));
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(true));
    addToast('Demo Access Granted', 'Logged in as Arun Kumar (52) with active demo prescriptions and allergy flags.', 'success');
  };

  // Sign out
  const logout = async () => {
    await authService.signOut();
    setIsAuthenticated(false);
    setIsDemoMode(false);
    setPatientProfile(defaultEmptyPatientProfile);
    setMedications([]);
    setPrescriptions([]);
    setTimelineEvents([]);
    setSafetyAlerts([]);
    setAdverseReactions([]);
    setDoctorVisits([]);
    setMedicalReports([]);
    setLifestyleHistory([]);
    setReminders([]);
    setSharingSession(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem(STORAGE_KEYS.IS_DEMO);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.MEDICATIONS);
    localStorage.removeItem(STORAGE_KEYS.PRESCRIPTIONS);
    localStorage.removeItem(STORAGE_KEYS.TIMELINE);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.SHARE);
    localStorage.removeItem(STORAGE_KEYS.ADVERSE_REACTIONS);
    localStorage.removeItem(STORAGE_KEYS.DOCTOR_VISITS);
    localStorage.removeItem(STORAGE_KEYS.MEDICAL_REPORTS);
    localStorage.removeItem(STORAGE_KEYS.LIFESTYLE_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.REMINDERS);
  };

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        isAuthenticated,
        setIsAuthenticated,
        patientProfile,
        updatePatientProfile,
        medications,
        addMedication,
        updateMedication,
        deleteMedication,
        toggleMedicationStatus,
        prescriptions,
        addPrescription,
        timelineEvents,
        addTimelineEvent,
        safetyAlerts,
        addSafetyAlert,
        resolveSafetyAlert,
        sharingSession,
        generateSharingSession,
        revokeSharingSession,
        runSafetyEvaluation,
        toasts,
        addToast,
        removeToast,
        resetToDemoData,
        searchQuery,
        setSearchQuery,
        adverseReactions,
        addAdverseReaction,
        removeAdverseReaction,
        doctorVisits,
        addDoctorVisit,
        removeDoctorVisit,
        medicalReports,
        addMedicalReport,
        removeMedicalReport,
        lifestyleHistory,
        addLifestyleItem,
        updateLifestyleItem,
        removeLifestyleItem,
        reminders,
        addReminder,
        updateReminder,
        removeReminder,
        toggleReminder,
        isSupabaseConnected,
        supabaseConfig: supabaseConfigState,
        setSupabaseCredentials,
        disconnectSupabase,
        checkConnection,
        isDemoMode,
        setIsDemoMode,
        loginAsDemo,
        logout,
        loadSupabaseUserProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
