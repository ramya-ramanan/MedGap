// Emergency Triage Service
// Real-time detection of high-risk red-flag symptoms and emergency warning signs.
// Triggers immediate critical escalation (911 / 112 / EMS / ED).

export interface EmergencyRedFlagAlert {
  isEmergency: boolean;
  severity: 'Immediate_Emergency' | 'Urgent_Care' | 'None';
  category: string;
  matchedKeywords: string[];
  alertHeadline: string;
  guidanceText: string;
  emergencyActions: string[];
  helplines: {
    name: string;
    number: string;
    description: string;
  }[];
}

interface RedFlagRule {
  category: string;
  keywords: string[];
  secondaryKeywords?: string[];
  severity: 'Immediate_Emergency' | 'Urgent_Care';
  headline: string;
  description: string;
  actions: string[];
}

const emergencyRules: RedFlagRule[] = [
  {
    category: 'Acute Coronary Syndrome / Cardiac Event',
    keywords: [
      'chest pain', 'chest pressure', 'crushing chest', 'pain in left arm',
      'jaw pain and chest', 'radiating to jaw', 'chest tightness and sweat',
      'heart attack symptoms', 'crushing pain in chest'
    ],
    severity: 'Immediate_Emergency',
    headline: '🚨 IMMEDIATE MEDICAL EMERGENCY: Suspected Acute Cardiac Event',
    description: 'Sudden chest pain, heaviness, tightness, or pressure radiating to the arm, neck, or jaw can be signs of a life-threatening heart attack (myocardial infarction).',
    actions: [
      'Stop all physical activity and sit down immediately in a comfortable position.',
      'Call emergency services immediately (911, 112, or your local emergency number). Do not attempt to drive yourself.',
      'If you have prescribed emergency nitroglycerin and are not taking contraindicating medicines, follow your cardiologist’s emergency protocol.',
      'Unlock your front door so first responders can enter quickly.'
    ]
  },
  {
    category: 'Acute Neurological / Stroke (FAST Criteria)',
    keywords: [
      'facial droop', 'face drooping', 'arm weakness', 'sudden numbness one side',
      'slurred speech', 'cannot speak', 'speech difficulty', 'sudden blindness',
      'thunderclap headache', 'worst headache of life', 'sudden paralysis'
    ],
    severity: 'Immediate_Emergency',
    headline: '🚨 IMMEDIATE MEDICAL EMERGENCY: Suspected Stroke / Neurological Crisis',
    description: 'Sudden facial droop, unilateral arm/leg weakness, slurred speech, or a sudden explosive "thunderclap" headache are hallmark signs of an acute stroke or intracranial hemorrhage.',
    actions: [
      'Call emergency medical services (911 / 112) without delay. Note the exact time symptoms started.',
      'Do not consume food, water, or medication (including aspirin) until evaluated at an emergency department, as swallowing may be impaired.',
      'Keep the patient lying flat or with head slightly elevated if conscious.'
    ]
  },
  {
    category: 'Severe Respiratory Distress',
    keywords: [
      'cannot breathe', 'severe shortness of breath', 'gasping for air',
      'blue lips', 'turning blue', 'choking', 'stridor', 'severe wheezing cannot talk'
    ],
    severity: 'Immediate_Emergency',
    headline: '🚨 IMMEDIATE MEDICAL EMERGENCY: Severe Respiratory Failure / Compromised Airway',
    description: 'Severe difficulty breathing, gasping for air, inability to speak words, or cyanosis (blue coloration around lips) indicates critical respiratory compromise requiring emergency oxygenation.',
    actions: [
      'Call 911 / 112 immediately for emergency paramedics with advanced airway support.',
      'Sit upright to facilitate lung expansion. Loosen any tight neckwear.',
      'If you have a rescue inhaler (e.g. Albuterol) or nebulizer prescribed for asthma/COPD, use it immediately.'
    ]
  },
  {
    category: 'Severe Allergic Reaction (Anaphylaxis)',
    keywords: [
      'throat swelling', 'throat closing', 'swollen tongue cannot breathe',
      'anaphylaxis', 'severe hives and wheezing', 'swollen throat after eating'
    ],
    severity: 'Immediate_Emergency',
    headline: '🚨 IMMEDIATE MEDICAL EMERGENCY: Suspected Severe Anaphylaxis',
    description: 'Rapid swelling of the tongue, throat, or lips accompanied by breathing difficulty or dizziness is life-threatening systemic anaphylaxis.',
    actions: [
      'If an Epinephrine auto-injector (EpiPen) is available, administer it into the outer thigh immediately.',
      'Call emergency services (911 / 112) right away even if symptoms improve after epinephrine.',
      'Lie flat with legs elevated unless breathing is labored, in which case remain seated.'
    ]
  },
  {
    category: 'Acute Internal or Massive Hemorrhage',
    keywords: [
      'coughing blood', 'vomiting blood', 'coffee ground vomit',
      'black tarry stool with dizziness', 'severe bleeding that will not stop'
    ],
    severity: 'Immediate_Emergency',
    headline: '🚨 IMMEDIATE MEDICAL EMERGENCY: Potential Major Gastrointestinal / Internal Bleeding',
    description: 'Vomiting blood, coffee-ground emesis, or coughing up significant blood can indicate acute upper GI hemorrhage or pulmonary vascular rupture.',
    actions: [
      'Seek emergency department medical attention immediately or call 911 / 112.',
      'Do not take further NSAIDs, Aspirin, or blood-thinning medications.',
      'Do not ingest food or liquids until medically examined.'
    ]
  },
  {
    category: 'High-Risk Infection / Meningeal Signs',
    keywords: [
      'stiff neck and high fever', 'fever with purple spots', 'fever confusion stiff neck',
      'cannot touch chin to chest fever'
    ],
    severity: 'Immediate_Emergency',
    headline: '🚨 URGENT EMERGENCY EVALUATION: Potential Meningitis / Severe Sepsis',
    description: 'A high fever coupled with inability to flex the neck forward (nuchal rigidity), confusion, or a non-blanching dark rash requires rapid emergency diagnostic lumbar puncture and IV antibiotic therapy.',
    actions: [
      'Proceed immediately to the nearest hospital Emergency Department.',
      'Do not delay seeking care. Bacterial meningitis requires urgent intravenous therapy within hours.'
    ]
  },
  {
    category: 'Crisis & Self-Harm Support',
    keywords: [
      'want to die', 'kill myself', 'suicide', 'end my life', 'take all my pills', 'overdose on purpose'
    ],
    severity: 'Immediate_Emergency',
    headline: '🛡️ CRISIS SUPPORT & EMERGENCY CARE: Immediate Help is Available',
    description: 'You are not alone and compassionate, confidential help is available 24/7. Please reach out to crisis responders or medical professionals immediately.',
    actions: [
      'Call or text 988 (Suicide & Crisis Lifeline - USA/Canada, free & confidential 24/7).',
      'In the UK call 111 or 999; in India call 112 or AASRA (91-9820466726); in Europe call 112.',
      'Go to the nearest emergency room or reach out to a trusted family member or physician.'
    ]
  }
];

export const emergencyTriageService = {
  // Screen user text for acute red-flag warning signs
  evaluateRedFlags(userQuery: string): EmergencyRedFlagAlert {
    if (!userQuery || !userQuery.trim()) {
      return this.getEmptyAlert();
    }

    const clean = userQuery.toLowerCase();

    for (const rule of emergencyRules) {
      const matched = rule.keywords.filter(kw => clean.includes(kw));

      if (matched.length > 0) {
        return {
          isEmergency: true,
          severity: rule.severity,
          category: rule.category,
          matchedKeywords: matched,
          alertHeadline: rule.headline,
          guidanceText: rule.description,
          emergencyActions: rule.actions,
          helplines: [
            { name: 'Emergency Medical Services (US/CA)', number: '911', description: 'Immediate paramedic emergency dispatch' },
            { name: 'Emergency Services (EU/UK/IN)', number: '112 / 999', description: 'Universal emergency assistance' },
            { name: 'National Crisis & Suicide Lifeline', number: '988', description: '24/7 free & confidential emotional support' }
          ]
        };
      }
    }

    return this.getEmptyAlert();
  },

  getEmptyAlert(): EmergencyRedFlagAlert {
    return {
      isEmergency: false,
      severity: 'None',
      category: '',
      matchedKeywords: [],
      alertHeadline: '',
      guidanceText: '',
      emergencyActions: [],
      helplines: []
    };
  }
};
