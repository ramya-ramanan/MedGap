export type NavigationPage = 
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'profile'
  | 'wallet'
  | 'prescriptions'
  | 'safety'
  | 'alerts'
  | 'history'
  | 'share'
  | 'settings';

export interface AdverseReaction {
  id: string;
  medicineName: string;
  reaction: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Life-Threatening';
  dateRecorded: string;
  notes?: string;
}

export interface DoctorVisit {
  id: string;
  doctorName: string;
  specialty: string;
  clinicOrHospital: string;
  visitDate: string;
  reasonForVisit: string;
  diagnosisNotes?: string;
  followUpDate?: string;
}

export interface MedicalReport {
  id: string;
  title: string;
  reportType: 'Lab Test' | 'Radiology' | 'Pathology' | 'Discharge Summary' | 'Other';
  date: string;
  facilityOrDoctor: string;
  summaryOrFindings: string;
  fileUrl?: string;
  fileName?: string;
}

export type SubstanceType = 'Smoking' | 'Alcohol' | 'Tobacco' | 'Other';
export type SubstanceStatus = 'Current' | 'Past' | 'Never';
export type DurationUnit = 'days' | 'months' | 'years';

export interface LifestyleSubstanceItem {
  id: string;
  substanceType: SubstanceType;
  customSubstanceName?: string;
  status: SubstanceStatus;
  durationValue?: number;
  durationUnit?: DurationUnit;
  quitDurationValue?: number;
  quitDurationUnit?: DurationUnit;
  notes?: string;
  updatedAt?: string;
}

export interface MedicationReminderItem {
  id: string;
  medicationId?: string;
  medicineName: string;
  reminderTime: string; // HH:MM 24h format e.g. "08:00"
  daysOfWeek: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  isEnabled: boolean;
  dosage?: string;
  notes?: string;
  createdAt?: string;
}

export interface PatientProfile {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  bloodGroup: string;
  email: string;
  phone: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  knownAllergies: string[];
  existingConditions: string[];
  primaryCarePhysician: string;
  adverseReactions?: AdverseReaction[];
  doctorVisits?: DoctorVisit[];
  medicalReports?: MedicalReport[];
  lifestyleHistory?: LifestyleSubstanceItem[];
  reminders?: MedicationReminderItem[];
}

export type MedicationStatus = 'Active' | 'Discontinued' | 'Completed';

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  activeIngredient?: string;
  strength: string;
  dosage: string;
  frequency: string;
  timing?: string;
  status: MedicationStatus;
  prescribedBy: string;
  startDate: string;
  endDate?: string;
  indication: string;
  instructions?: string;
  category?: string;
}

export interface MasterMedication {
  id: string;
  medicine_name: string;
  generic_name: string;
  active_ingredient: string;
  strength: string;
  dosage_form: string;
}

export type RiskSeverity = 'High' | 'Moderate' | 'Low' | 'Info';

export type AlertType = 'Drug Interaction' | 'Possible Duplicate' | 'Allergy Related';
export type AlertStatus = 'Unreviewed' | 'Reviewed' | 'Resolved';

export interface SafetyAlert {
  id: string;
  type: AlertType | 'interaction' | 'duplicate' | 'allergy' | 'condition' | 'adverse_reaction';
  severity: RiskSeverity;
  title: string;
  medicineA?: string;
  medicineB?: string;
  newMedicine?: string;
  conflictingMedicine?: string;
  recordedAllergy?: string;
  recordedCondition?: string;
  adverseReaction?: string;
  description: string;
  clinicalRationale?: string;
  recommendation?: string;
  status?: AlertStatus;
  timestamp: string;
  resolved?: boolean;
}

export interface Prescription {
  id: string;
  doctorName: string;
  specialty: string;
  hospitalOrClinic: string;
  issueDate: string;
  prescriptionNumber: string;
  status: 'Processed' | 'Pending Review' | 'Archived' | 'Uploading' | 'Processing';
  fileUrl?: string;
  fileName: string;
  extractedMedicines: ExtractedMedicine[];
}

export interface ExtractedMedicine {
  id?: string;
  name: string;
  genericName?: string;
  strength: string;
  dosage: string;
  frequency: string;
  duration?: string;
  confidenceScore: number;
  flaggedAlert?: string;
  confirmed?: boolean;
}

export interface TimelineEvent {
  id: string;
  date: string;
  relativeTime: string;
  title: string;
  description: string;
  type: 'added' | 'prescription' | 'discontinued' | 'scan' | 'shared' | 'profile_updated';
  badgeColor: 'emerald' | 'sky' | 'amber' | 'rose' | 'indigo' | 'slate';
  metadata?: string;
}

export interface SharingSession {
  id: string;
  token: string;
  isActive: boolean;
  expiresAt: Date;
  remainingMinutes: number;
  recipientRole: 'Doctor' | 'Pharmacist' | 'Emergency Clinician';
  sharedScopes: {
    currentMedications: boolean;
    allergies: boolean;
    safetyAlerts: boolean;
    prescriptionHistory: boolean;
  };
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface SharedPatientViewData {
  valid: boolean;
  status?: 'active' | 'expired' | 'revoked' | 'invalid';
  error?: string;
  expires_at?: string;
  patient?: {
    full_name: string;
    age: number;
    gender: string;
    blood_group?: string;
    email?: string;
    phone?: string;
  };
  allergies?: string[];
  conditions?: string[];
  lifestyle_history?: {
    id: string;
    substance_type: string;
    custom_substance_name?: string;
    status: string;
    duration_value?: number;
    duration_unit?: string;
    quit_duration_value?: number;
    quit_duration_unit?: string;
    notes?: string;
  }[];
  adverse_reactions?: {
    id: string;
    medicine_name: string;
    reaction: string;
    severity: string;
    date_recorded: string;
    notes?: string;
  }[];
  doctor_visits?: {
    id: string;
    doctor_name: string;
    specialty: string;
    clinic_or_hospital: string;
    visit_date: string;
    reason_for_visit: string;
    diagnosis_notes?: string;
    follow_up_date?: string;
  }[];
  medical_reports?: {
    id: string;
    title: string;
    report_type: string;
    date: string;
    facility_or_doctor: string;
    summary_or_findings: string;
    file_url?: string;
  }[];
  current_medicines?: {
    name: string;
    generic_name?: string;
    strength: string;
    dosage: string;
    frequency: string;
    timing?: string;
    prescribed_by?: string;
    start_date?: string;
    indication?: string;
  }[];
  prescriptions?: {
    id: string;
    doctor_name: string;
    hospital_name: string;
    specialty?: string;
    prescription_date: string;
    prescription_number?: string;
    extraction_status?: string;
    file_url?: string;
    medicines?: {
      name: string;
      generic_name?: string;
      strength?: string;
      dosage?: string;
      frequency?: string;
      duration?: string;
    }[];
  }[];
  medication_history?: {
    id: string;
    action_type: string;
    title: string;
    description: string;
    created_at: string;
  }[];
  safety_alerts?: {
    alert_type: string;
    severity: string;
    medicine_a: string;
    medicine_b?: string;
    description: string;
  }[];
  disclaimer: string;
}
