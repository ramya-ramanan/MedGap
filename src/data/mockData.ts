import { 
  PatientProfile, 
  Medication, 
  Prescription, 
  TimelineEvent, 
  SafetyAlert, 
  AdverseReaction, 
  DoctorVisit, 
  MedicalReport,
  LifestyleSubstanceItem,
  MedicationReminderItem
} from '../types';

export const initialPatientProfile: PatientProfile = {
  id: 'pt-arun-52',
  fullName: 'Arun Kumar',
  age: 52,
  gender: 'Male',
  bloodGroup: 'B+',
  email: 'arun.kumar@example.com',
  phone: '+1 (555) 382-9014',
  emergencyContact: {
    name: 'Priya Kumar',
    relationship: 'Spouse',
    phone: '+1 (555) 382-9015',
  },
  knownAllergies: ['Penicillin'],
  existingConditions: ['Hypertension', 'Type 2 Diabetes Mellitus', 'Hyperlipidemia'],
  primaryCarePhysician: 'Dr. Ramesh Mehta, MD (General Medicine)',
};

export const initialMedications: Medication[] = [
  {
    id: 'med-1',
    name: 'Metformin',
    genericName: 'Metformin Hydrochloride',
    strength: '500 mg',
    dosage: '1 tablet',
    frequency: '2 times / day',
    timing: 'With morning & evening meals',
    status: 'Active',
    prescribedBy: 'Dr. Ramesh Mehta, MD',
    startDate: '2023-04-10',
    indication: 'Type 2 Diabetes glycemic management',
    instructions: 'Take with food to minimize GI upset.',
    category: 'Antidiabetic'
  },
  {
    id: 'med-2',
    name: 'Atorvastatin',
    genericName: 'Atorvastatin Calcium',
    strength: '20 mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    timing: 'At bedtime',
    status: 'Active',
    prescribedBy: 'Dr. K. Sharma, MD (Cardiology)',
    startDate: '2023-11-15',
    indication: 'Hyperlipidemia / Cardiovascular risk reduction',
    instructions: 'Avoid excessive consumption of grapefruit products.',
    category: 'Statin / Lipid-Lowering'
  },
  {
    id: 'med-3',
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    strength: '10 mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    timing: 'Every morning',
    status: 'Active',
    prescribedBy: 'Dr. K. Sharma, MD (Cardiology)',
    startDate: '2024-01-08',
    indication: 'Hypertension management',
    instructions: 'Monitor blood pressure regularly.',
    category: 'ACE Inhibitor'
  },
  {
    id: 'med-4',
    name: 'Aspirin (Cardio)',
    genericName: 'Acetylsalicylic Acid (Enteric Coated)',
    strength: '81 mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    timing: 'With lunch',
    status: 'Active',
    prescribedBy: 'Dr. K. Sharma, MD (Cardiology)',
    startDate: '2023-11-15',
    indication: 'Secondary cardiovascular prophylaxis',
    instructions: 'Do not crush enteric-coated tablets.',
    category: 'Antiplatelet'
  },
  {
    id: 'med-5',
    name: 'Amlodipine',
    genericName: 'Amlodipine Besylate',
    strength: '5 mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    timing: 'Morning',
    status: 'Discontinued',
    prescribedBy: 'Dr. Ramesh Mehta, MD',
    startDate: '2023-01-12',
    endDate: '2024-01-05',
    indication: 'Essential hypertension',
    instructions: 'Discontinued due to mild peripheral ankle edema.',
    category: 'Calcium Channel Blocker'
  },
];

export const initialSafetyAlerts: SafetyAlert[] = [
  {
    id: 'alert-initial-1',
    type: 'interaction',
    severity: 'Moderate',
    title: 'Potential Interaction: Lisinopril & Potassium / NSAIDs',
    newMedicine: 'Lisinopril',
    conflictingMedicine: 'Potassium Sparing Agents / Regular NSAIDs',
    description: 'Concomitant use with potassium supplements or chronic NSAIDs may elevate serum potassium or impair renal clearance.',
    clinicalRationale: 'ACE inhibitors reduce aldosterone secretion, leading to potential potassium retention. Periodic renal function & electrolyte monitoring is advised.',
    recommendation: 'Potential risk detected — please consult a qualified healthcare professional before taking potassium supplements or over-the-counter NSAIDs.',
    timestamp: 'Today, 08:30 AM',
    resolved: false
  }
];

export const initialPrescriptions: Prescription[] = [
  {
    id: 'rx-2024-001',
    doctorName: 'Dr. K. Sharma, MD',
    specialty: 'Cardiology & Vascular Medicine',
    hospitalOrClinic: 'Metro Heart Institute, Suite 402',
    issueDate: '2024-01-08',
    prescriptionNumber: 'RX-78921-CARD',
    status: 'Processed',
    fileName: 'Cardiology_Followup_Jan2024.pdf',
    extractedMedicines: [
      {
        name: 'Lisinopril',
        genericName: 'Lisinopril',
        strength: '10 mg',
        dosage: '1 tablet',
        frequency: 'Once daily (morning)',
        duration: '90 days',
        confidenceScore: 98,
      },
      {
        name: 'Atorvastatin',
        genericName: 'Atorvastatin Calcium',
        strength: '20 mg',
        dosage: '1 tablet',
        frequency: 'Once daily (bedtime)',
        duration: '90 days',
        confidenceScore: 99,
      }
    ]
  },
  {
    id: 'rx-2023-009',
    doctorName: 'Dr. Ramesh Mehta, MD',
    specialty: 'Internal Medicine & Endocrinology',
    hospitalOrClinic: 'Apex Healthcare Centre',
    issueDate: '2023-11-15',
    prescriptionNumber: 'RX-65402-GEN',
    status: 'Processed',
    fileName: 'Endo_Prescription_Nov2023.pdf',
    extractedMedicines: [
      {
        name: 'Metformin',
        genericName: 'Metformin Hydrochloride',
        strength: '500 mg',
        dosage: '1 tablet',
        frequency: '2 times / day with meals',
        duration: '180 days',
        confidenceScore: 96,
      },
      {
        name: 'Aspirin (Cardio)',
        genericName: 'Acetylsalicylic Acid',
        strength: '81 mg',
        dosage: '1 tablet',
        frequency: 'Once daily with meal',
        duration: '180 days',
        confidenceScore: 97,
      }
    ]
  },
  {
    id: 'rx-2023-002',
    doctorName: 'Dr. Ramesh Mehta, MD',
    specialty: 'Internal Medicine',
    hospitalOrClinic: 'Apex Healthcare Centre',
    issueDate: '2023-01-12',
    prescriptionNumber: 'RX-43109-INIT',
    status: 'Archived',
    fileName: 'Initial_Consult_Jan2023.pdf',
    extractedMedicines: [
      {
        name: 'Amlodipine',
        genericName: 'Amlodipine Besylate',
        strength: '5 mg',
        dosage: '1 tablet',
        frequency: 'Once daily',
        duration: '30 days',
        confidenceScore: 94,
      }
    ]
  }
];

export const initialTimelineEvents: TimelineEvent[] = [
  {
    id: 'evt-1',
    date: 'Today',
    relativeTime: 'Today, 09:15 AM',
    title: 'Profile Safety Check Performed',
    description: 'Routine automated safety audit completed against 4 active medications.',
    type: 'scan',
    badgeColor: 'sky',
    metadata: 'Status: Monitored'
  },
  {
    id: 'evt-2',
    date: '2 days ago',
    relativeTime: '2 days ago, 02:40 PM',
    title: 'Prescription Uploaded & Verified',
    description: 'Uploaded RX-78921-CARD from Dr. K. Sharma (Cardiology). 2 active medications validated.',
    type: 'prescription',
    badgeColor: 'indigo',
    metadata: 'OCR Confidence 98.5%'
  },
  {
    id: 'evt-3',
    date: '1 week ago',
    relativeTime: '1 week ago, 11:20 AM',
    title: 'Medicine Amlodipine 5mg Discontinued',
    description: 'Discontinuation authorized by Dr. Mehta due to minor ankle edema. Switched to Lisinopril.',
    type: 'discontinued',
    badgeColor: 'amber',
    metadata: 'Amlodipine Besylate'
  },
  {
    id: 'evt-4',
    date: '1 month ago',
    relativeTime: '1 month ago',
    title: 'Added Medicine Lisinopril 10mg',
    description: 'Initiated for blood pressure optimization following cardiovascular consult.',
    type: 'added',
    badgeColor: 'emerald',
    metadata: 'Dr. K. Sharma'
  },
  {
    id: 'evt-5',
    date: '3 months ago',
    relativeTime: '3 months ago',
    title: 'Secure Sharing Session Generated',
    description: 'Temporary encrypted QR access code provided to Metro Heart Institute pharmacy.',
    type: 'shared',
    badgeColor: 'slate',
    metadata: 'Duration: 30 Mins (Expired)'
  }
];

export const initialAdverseReactions: AdverseReaction[] = [
  {
    id: 'adr-demo-1',
    medicineName: 'Amoxicillin',
    reaction: 'Severe Urticaria, Facial Angioedema & Pruritus',
    severity: 'Severe',
    dateRecorded: '2024-05-14',
    notes: 'Beta-lactam hypersensitivity episode required emergency antihistamine & corticosteroid therapy.',
  },
  {
    id: 'adr-demo-2',
    medicineName: 'Ciprofloxacin',
    reaction: 'Bilateral Achilles Tendonitis & Joint Discomfort',
    severity: 'Moderate',
    dateRecorded: '2023-11-20',
    notes: 'Developed after 4 days of fluoroquinolone therapy for respiratory infection. Resolved post discontinuation.',
  }
];

export const initialDoctorVisits: DoctorVisit[] = [
  {
    id: 'visit-demo-1',
    doctorName: 'Dr. Ramesh Mehta, MD',
    specialty: 'Internal Medicine',
    clinicOrHospital: 'Metro Health Multispecialty Clinic',
    visitDate: '2026-02-10',
    reasonForVisit: 'Quarterly Chronic Disease Management Review',
    diagnosisNotes: 'Blood pressure 128/82 mmHg on Lisinopril 10mg. Fasting glucose well managed. Refilled active prescriptions.',
    followUpDate: '2026-05-10',
  },
  {
    id: 'visit-demo-2',
    doctorName: 'Dr. K. Sharma, MD, DM',
    specialty: 'Cardiology',
    clinicOrHospital: 'City Heart & Vascular Institute',
    visitDate: '2025-10-18',
    reasonForVisit: 'Cardiovascular Risk Stratification & Lipid Panel',
    diagnosisNotes: 'Stable coronary profile. Lipid levels target attained with Atorvastatin 20mg daily.',
    followUpDate: '2026-10-18',
  }
];

export const initialMedicalReports: MedicalReport[] = [
  {
    id: 'report-demo-1',
    title: 'Comprehensive Metabolic Panel & Lipid Profile',
    reportType: 'Lab Test',
    date: '2026-02-08',
    facilityOrDoctor: 'Quest Diagnostic Pathology Labs',
    summaryOrFindings: 'HbA1c: 6.4% (Controlled), Total Cholesterol: 168 mg/dL, LDL: 84 mg/dL, Serum Creatinine: 0.9 mg/dL, eGFR: >90 mL/min.',
    fileName: 'Comprehensive_Metabolic_Panel_Feb2026.pdf',
  },
  {
    id: 'report-demo-2',
    title: '12-Lead Rest Electrocardiogram (ECG)',
    reportType: 'Radiology',
    date: '2025-10-18',
    facilityOrDoctor: 'City Heart Institute Imaging Suite',
    summaryOrFindings: 'Normal sinus rhythm, heart rate 72 bpm. No acute ST-T segment deviation or ischemic anomalies.',
    fileName: 'Resting_12Lead_ECG_Oct2025.pdf',
  }
];

export const initialLifestyleHistory: LifestyleSubstanceItem[] = [
  {
    id: 'life-1',
    substanceType: 'Smoking',
    status: 'Past',
    durationValue: 12,
    durationUnit: 'years',
    quitDurationValue: 4,
    quitDurationUnit: 'years',
    notes: 'Smoked ~10 cigarettes/day. Successfully quit in 2022 following cardiovascular risk counseling.',
    updatedAt: '2026-02-10'
  },
  {
    id: 'life-2',
    substanceType: 'Alcohol',
    status: 'Current',
    durationValue: 20,
    durationUnit: 'years',
    notes: 'Occasional social wine consumption (1-2 drinks/week). Advised to avoid alcohol with metformin.',
    updatedAt: '2026-02-10'
  },
  {
    id: 'life-3',
    substanceType: 'Tobacco',
    status: 'Never',
    notes: 'No history of smokeless or chewing tobacco use.',
    updatedAt: '2026-02-10'
  }
];

export const initialReminders: MedicationReminderItem[] = [
  {
    id: 'rem-demo-1',
    medicationId: 'med-1',
    medicineName: 'Metformin',
    dosage: '500 mg (1 tablet)',
    reminderTime: '08:00',
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    isEnabled: true,
    notes: 'Take with morning breakfast.'
  },
  {
    id: 'rem-demo-2',
    medicationId: 'med-3',
    medicineName: 'Lisinopril',
    dosage: '10 mg (1 tablet)',
    reminderTime: '09:00',
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    isEnabled: true,
    notes: 'Morning blood pressure medication.'
  },
  {
    id: 'rem-demo-3',
    medicationId: 'med-2',
    medicineName: 'Atorvastatin',
    dosage: '20 mg (1 tablet)',
    reminderTime: '21:30',
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    isEnabled: true,
    notes: 'Take at bedtime.'
  }
];

// Drug safety knowledge base for interactions, duplicates, and allergies
export interface SafetyRuleKnowledge {
  allergenGroups: {
    allergen: string;
    conflictingDrugs: string[];
    riskDescription: string;
    clinicalNote: string;
  }[];
  duplicateClasses: {
    className: string;
    drugs: string[];
    commonActiveIngredient: string;
    explanation: string;
  }[];
  drugInteractions: {
    drugA: string;
    drugB: string;
    severity: 'High' | 'Moderate' | 'Low';
    title: string;
    mechanism: string;
    recommendation: string;
  }[];
}

export const safetyKnowledgeBase: SafetyRuleKnowledge = {
  allergenGroups: [
    {
      allergen: 'Penicillin',
      conflictingDrugs: [
        'amoxicillin',
        'ampicillin',
        'augmentin',
        'penicillin',
        'penicillin v',
        'piperacillin',
        'amoxicillin-clavulanate',
        'amoxil'
      ],
      riskDescription: 'High risk of severe hypersensitivity / allergic reaction in patients with recorded Penicillin allergy.',
      clinicalNote: 'Amoxicillin is a beta-lactam antibiotic in the penicillin class. Potential allergic manifestations include urticaria, severe rash, respiratory distress, or anaphylaxis.'
    },
    {
      allergen: 'Sulfa / Sulfonamides',
      conflictingDrugs: ['bactrim', 'septra', 'sulfamethoxazole', 'trimethoprim-sulfamethoxazole'],
      riskDescription: 'Potential cross-reactivity with recorded sulfonamide hypersensitivity.',
      clinicalNote: 'May trigger acute drug eruptions or allergic systemic symptoms.'
    }
  ],
  duplicateClasses: [
    {
      className: 'HMG-CoA Reductase Inhibitors (Statins)',
      drugs: ['atorvastatin', 'lipitor', 'rosuvastatin', 'crestor', 'simvastatin', 'zocor', 'pravastatin'],
      commonActiveIngredient: 'Atorvastatin / Statin HMG-CoA Reductase Inhibitor',
      explanation: 'Both medicines belong to the statin therapeutic class. Co-administration duplicates lipid-lowering therapy and significantly increases the risk of hepatotoxicity and severe muscle injury (rhabdomyolysis).'
    },
    {
      className: 'Biguanides (Metformin)',
      drugs: ['metformin', 'glucophage', 'fortamet', 'glumetza', 'riomet'],
      commonActiveIngredient: 'Metformin Hydrochloride',
      explanation: 'Both medicines contain Metformin as the active ingredient. Duplicate therapy can cause dangerous hypoglycemia or severe lactic acidosis.'
    },
    {
      className: 'ACE Inhibitors',
      drugs: ['lisinopril', 'zestril', 'prinivil', 'enalapril', 'vasotec', 'ramipril', 'altace'],
      commonActiveIngredient: 'Lisinopril / ACE Inhibitor',
      explanation: 'Both medicines are Angiotensin Converting Enzyme (ACE) inhibitors. Dual dosing can induce severe hypotension, acute renal dysfunction, and hyperkalemia.'
    },
    {
      className: 'NSAIDs (Nonsteroidal Anti-inflammatory Drugs)',
      drugs: ['ibuprofen', 'advil', 'motrin', 'naproxen', 'aleve', 'celecoxib', 'celebrex', 'diclofenac'],
      commonActiveIngredient: 'NSAID Cyclooxygenase Inhibitor',
      explanation: 'Both medicines are nonsteroidal anti-inflammatory agents. Combining them multiplies gastrointestinal bleeding risks, ulceration, and nephrotoxicity.'
    }
  ],
  drugInteractions: [
    {
      drugA: 'aspirin',
      drugB: 'ibuprofen',
      severity: 'High',
      title: 'Aspirin (Cardio) + Ibuprofen: Antiplatelet Antagonism & Bleeding Risk',
      mechanism: 'Ibuprofen competitively inhibits the irreversible platelet COX-1 binding of low-dose aspirin, compromising aspirin\'s cardioprotective efficacy while simultaneously multiplying upper GI ulceration and bleeding risk.',
      recommendation: 'Potential risk detected — please consult a qualified healthcare professional before taking Ibuprofen or other NSAIDs concurrently with cardioprotective Aspirin.'
    },
    {
      drugA: 'aspirin',
      drugB: 'warfarin',
      severity: 'High',
      title: 'Aspirin + Warfarin: Potentiated Hemorrhagic Risk',
      mechanism: 'Combined antiplatelet and anticoagulant therapy dramatically increases the frequency of major hemorrhagic episodes.',
      recommendation: 'Potential risk detected — please consult a qualified healthcare professional. Dual therapy requires rigorous clinical supervision and INR monitoring.'
    },
    {
      drugA: 'lisinopril',
      drugB: 'ibuprofen',
      severity: 'Moderate',
      title: 'Lisinopril + NSAID: Attenuation of Antihypertensive Effect & Renal Risk',
      mechanism: 'NSAIDs inhibit renal prostaglandins, reducing renal blood flow and attenuating the blood pressure-lowering effect of ACE inhibitors, posing heightened risk of acute kidney injury.',
      recommendation: 'Potential risk detected — please consult a qualified healthcare professional regarding alternative analgesic options.'
    },
    {
      drugA: 'atorvastatin',
      drugB: 'clarithromycin',
      severity: 'High',
      title: 'Atorvastatin + Clarithromycin: CYP3A4 Inhibition & Myopathy Risk',
      mechanism: 'Clarithromycin is a potent CYP3A4 inhibitor that markedly elevates systemic plasma concentrations of Atorvastatin, substantially escalating the risk of severe rhabdomyolysis.',
      recommendation: 'Potential risk detected — please consult a qualified healthcare professional to consider dose suspension or alternative antibiotic coverage.'
    }
  ]
};
