// Symptom-based Clinical Triage Engine
// Understands symptoms, generates relevant follow-up questions,
// explains non-definitive possible causes, provides general self-care guidance,
// and identifies when to consult a doctor.

export interface SymptomEvaluationResult {
  detectedSymptoms: string[];
  followUpQuestions: string[];
  possibleCauses: {
    name: string;
    description: string;
    commonFactors: string;
  }[];
  selfCareGuidance: string[];
  whenToConsultDoctor: {
    urgentSigns: string[];
    routineCheckupCriteria: string[];
  };
  questionsForDoctor: string[];
}

interface SymptomKnowledgeItem {
  id: string;
  name: string;
  matchKeywords: string[];
  followUpQuestions: string[];
  possibleCauses: {
    name: string;
    description: string;
    commonFactors: string;
  }[];
  selfCareGuidance: string[];
  urgentSigns: string[];
  routineCheckupCriteria: string[];
  questionsForDoctor: string[];
}

const symptomKnowledgeBase: SymptomKnowledgeItem[] = [
  {
    id: 'headache',
    name: 'Headache',
    matchKeywords: ['headache', 'head ache', 'migraine', 'throbbing head', 'head pain', 'temple pain'],
    followUpQuestions: [
      'How long have you had this headache, and did it start suddenly or gradually?',
      'Is the pain throbbing, sharp, or a dull band of pressure around your head?',
      'Are you experiencing any accompanying symptoms like nausea, light sensitivity, fever, or neck stiffness?'
    ],
    possibleCauses: [
      {
        name: 'Tension-Type Headache',
        description: 'The most common headache type, often feeling like a tight band or dull ache across forehead or temples.',
        commonFactors: 'Mental stress, lack of sleep, prolonged screen time, eye strain, or poor neck posture.'
      },
      {
        name: 'Migraine Episode',
        description: 'Recurrent throbbing or pulsing pain, typically on one side of the head, often with nausea or sensory sensitivity.',
        commonFactors: 'Hormonal fluctuations, weather changes, specific food triggers, missed meals, or bright lights.'
      },
      {
        name: 'Dehydration / Caffeine Withdrawal',
        description: 'Dull ache that often improves with adequate fluid rehydration.',
        commonFactors: 'Insufficient daily water intake, intense heat, or delayed morning caffeine consumption.'
      },
      {
        name: 'Sinus Congestion / Rhinosinusitis',
        description: 'Facial pressure and tenderness centered over cheeks, forehead, or behind eyes.',
        commonFactors: 'Seasonal allergies or resolving upper respiratory viral infections.'
      }
    ],
    selfCareGuidance: [
      'Rest in a quiet, dimly lit, and well-ventilated room.',
      'Apply a cool compress or gel ice pack to forehead, or a warm cloth to back of neck to relax muscle tension.',
      'Drink 1 to 2 large glasses of water to address any underlying dehydration.',
      'Take regular screen breaks (follow the 20-20-20 rule: look 20 feet away for 20 seconds every 20 minutes).',
      'Gently massage neck and shoulder muscles.'
    ],
    urgentSigns: [
      'Sudden explosive "worst headache of your life" (thunderclap onset)',
      'Headache accompanied by high fever, stiff neck, confusion, or difficulty speaking',
      'Headache following a recent head trauma or fall',
      'New headache weakness, numbness, or visual changes in one eye'
    ],
    routineCheckupCriteria: [
      'Headaches occurring more than 2-3 times per week',
      'Headaches that progressively worsen over weeks',
      'Headaches requiring frequent over-the-counter painkillers'
    ],
    questionsForDoctor: [
      'Could my headaches be related to any of my current medications or blood pressure?',
      'Would keeping a headache diary help identify specific triggers?',
      'Are there preventive strategies or prescription options suitable for my profile?'
    ]
  },
  {
    id: 'fever',
    name: 'Fever / Elevated Body Temperature',
    matchKeywords: ['fever', 'high temp', 'chills', 'feverish', 'temperature', 'sweating and shivering'],
    followUpQuestions: [
      'What is your measured body temperature, and how many days has it been elevated?',
      'Do you have any other symptoms such as cough, sore throat, urinary burning, or skin rash?',
      'Are you able to drink fluids and stay hydrated without vomiting?'
    ],
    possibleCauses: [
      {
        name: 'Viral Respiratory Infection',
        description: 'Common cold, influenza, COVID-19, or other viral syndromes triggering immune response.',
        commonFactors: 'Seasonal exposure, contact with symptomatic individuals.'
      },
      {
        name: 'Bacterial Infection',
        description: 'Bacterial pharyngitis (strep), urinary tract infection, or localized skin/ear infection.',
        commonFactors: 'May require clinical evaluation and targeted antibiotic therapy if confirmed.'
      },
      {
        name: 'Post-Vaccination Immune Response',
        description: 'Mild transient low-grade fever within 24-48 hours after receiving an immunization.',
        commonFactors: 'Normal physiological indicator of antibody generation.'
      }
    ],
    selfCareGuidance: [
      'Drink plenty of fluids: water, clear broths, oral rehydration solutions, or herbal teas.',
      'Rest and avoid vigorous physical exertion to let your body focus on immune recovery.',
      'Wear lightweight, breathable clothing and keep the room at a comfortable, cool temperature.',
      'Use lukewarm sponge baths if feeling overheated (avoid cold water or alcohol rubs, which cause shivering).'
    ],
    urgentSigns: [
      'Fever exceeding 103°F (39.4°C) in adults that does not respond to cooling measures',
      'Fever accompanied by severe stiff neck, confusion, extreme lethargy, or shortness of breath',
      'Fever in anyone with an immunocompromised condition or undergoing chemotherapy',
      'Any fever in an infant under 3 months of age'
    ],
    routineCheckupCriteria: [
      'Fever lasting longer than 3 consecutive days without improvement',
      'Fever that resolves for 2 days and then returns with new symptoms'
    ],
    questionsForDoctor: [
      'Do I need diagnostic lab tests (blood work, rapid strep, viral PCR) to determine the cause?',
      'Given my medical history, what specific warning thresholds should prompt emergency care?'
    ]
  },
  {
    id: 'cough',
    name: 'Cough',
    matchKeywords: ['cough', 'coughing', 'hack', 'dry cough', 'wet cough', 'phlegm', 'mucus'],
    followUpQuestions: [
      'Is the cough dry and tickly, or productive with phlegm/mucus?',
      'How long have you had this cough (under 3 weeks or chronic)?',
      'Do you experience wheezing, shortness of breath, or heartburn when lying down?'
    ],
    possibleCauses: [
      {
        name: 'Post-Viral Acute Bronchitis / Viral Cough',
        description: 'Airway inflammation following a common cold or flu, often lingering for 2-3 weeks.',
        commonFactors: 'Recent cold, dry ambient air, or environmental dust exposure.'
      },
      {
        name: 'Post-Nasal Drip / Allergic Rhinitis',
        description: 'Mucus trickling down the back of the throat triggering tickling cough reflexes, worse when lying flat.',
        commonFactors: 'Seasonal allergens, pet dander, or sinus congestion.'
      },
      {
        name: 'ACE Inhibitor Medication Side Effect',
        description: 'A characteristic dry, persistent, hacking cough caused by bradykinin accumulation with ACE inhibitor drugs.',
        commonFactors: 'Taking medicines like Lisinopril, Enalapril, or Ramipril. Does not resolve with cough syrups.'
      },
      {
        name: 'Gastroesophageal Reflux (GERD)',
        description: 'Stomach acid irritating the lower esophagus and laryngeal nerves, frequently worse at bedtime.',
        commonFactors: 'Eating heavy or spicy meals close to sleep, lying supine.'
      }
    ],
    selfCareGuidance: [
      'Use a cool-mist room humidifier or take a warm steamy shower to soothe airway irritation.',
      'Sip warm water with honey and lemon (note: honey is strictly for individuals over 1 year of age).',
      'Stay well-hydrated to help thin respiratory secretions.',
      'Elevate your head with an extra pillow when resting to reduce post-nasal drip pooling.'
    ],
    urgentSigns: [
      'Coughing up blood or rust-colored sputum',
      'Severe difficulty breathing, persistent wheezing, or chest pain',
      'High fever with shaking chills and drenching sweats'
    ],
    routineCheckupCriteria: [
      'Cough persisting longer than 3 to 4 weeks without improvement',
      'Unexplained weight loss or night sweats accompanying the cough',
      'Cough starting shortly after initiating a new blood pressure medicine'
    ],
    questionsForDoctor: [
      'Could my cough be a known side effect of my ACE inhibitor (e.g. Lisinopril)?',
      'Would an alternative medication (such as an ARB) be appropriate if this cough is drug-induced?',
      'Is an in-person chest auscultation or X-ray indicated?'
    ]
  },
  {
    id: 'sore_throat',
    name: 'Sore Throat / Pharyngitis',
    matchKeywords: ['sore throat', 'throat pain', 'pain swallowing', 'scratchy throat', 'tonsils hurt'],
    followUpQuestions: [
      'How severe is the throat discomfort on a 1-10 scale when swallowing?',
      'Do you have a fever, swollen neck glands, or white patches on your tonsils?',
      'Do you have a cough or runny nose as well?'
    ],
    possibleCauses: [
      {
        name: 'Viral Pharyngitis',
        description: 'Responsible for >80% of sore throats, accompanied by typical cold symptoms like runny nose or mild cough.',
        commonFactors: 'Rhinovirus, coronavirus, adenovirus, or influenza.'
      },
      {
        name: 'Streptococcal Pharyngitis (Strep Throat)',
        description: 'Bacterial infection marked by abrupt severe throat pain, high fever, swollen tender anterior cervical lymph nodes, and lack of cough.',
        commonFactors: 'Group A Streptococcus; requires clinical throat swab and antibiotic prescription.'
      },
      {
        name: 'Dry Air / Mouth Breathing',
        description: 'Irritation from breathing dry indoor heated air or nasal congestion forcing nocturnal mouth breathing.',
        commonFactors: 'Waking up with sore throat that improves after drinking fluids.'
      }
    ],
    selfCareGuidance: [
      'Gargle with warm salt water (1/2 teaspoon salt dissolved in 8 oz warm water) 3-4 times daily.',
      'Drink warm soothing liquids like broth, caffeine-free herbal tea, or cool water.',
      'Suck on throat lozenges or fruit ice pops to numb local throat nerve endings.',
      'Use a bedroom humidifier to keep mucous membranes moist overnight.'
    ],
    urgentSigns: [
      'Difficulty breathing, inability to swallow your own saliva, or drooling',
      'Severe swelling on one side of the throat causing asymmetrical uvula displacement (peritonsillar abscess)',
      'Inability to fully open your mouth (trismus)'
    ],
    routineCheckupCriteria: [
      'Sore throat lasting longer than 5-7 days',
      'Severe pain accompanied by high fever and absence of cough'
    ],
    questionsForDoctor: [
      'Should we perform a rapid antigen throat swab to rule out bacterial Strep?',
      'If antibiotics are required, do my allergy records (such as Penicillin allergy) guide the safe choice?'
    ]
  },
  {
    id: 'abdominal_pain',
    name: 'Abdominal Discomfort / Stomach Pain',
    matchKeywords: ['stomach pain', 'belly pain', 'abdominal pain', 'cramps in stomach', 'gut ache', 'stomach ache'],
    followUpQuestions: [
      'Where specifically is the pain located (upper middle, lower right, around navel)?',
      'Is the pain sharp, cramping, burning, or constant and dull?',
      'Are you having nausea, vomiting, diarrhea, constipation, or fever?'
    ],
    possibleCauses: [
      {
        name: 'Gastritis / Peptic Irritation',
        description: 'Burning epigastric ache in the upper abdomen, often related to acid, NSAID use, or dietary triggers.',
        commonFactors: 'Frequent use of painkillers (ibuprofen, aspirin), spicy foods, or stress.'
      },
      {
        name: 'Gastroenteritis (Stomach Bug)',
        description: 'Cramping abdominal pain accompanied by watery diarrhea, nausea, and mild fever.',
        commonFactors: 'Foodborne pathogens, norovirus, or rotavirus.'
      },
      {
        name: 'Functional Dyspepsia / Indigestion / Gas Bloating',
        description: 'Transient postprandial fullness, bloating, and crampy discomfort.',
        commonFactors: 'Eating too quickly, carbonated beverages, fatty meals.'
      }
    ],
    selfCareGuidance: [
      'Sip clear fluids (electrolyte solutions, diluted clear broth) to stay hydrated.',
      'Follow a gentle, bland diet for 24-48 hours (bananas, rice, applesauce, toast - BRAT guidelines).',
      'Avoid gastrointestinal irritants: NSAID painkillers, alcohol, caffeine, dairy, and heavy greasy meals.',
      'Apply a warm heating pad across the abdomen to relax cramping abdominal wall muscles.'
    ],
    urgentSigns: [
      'Severe, sudden acute pain, especially localized in the lower right abdomen (possible appendicitis)',
      'Abdomen that feels rigid, rock-hard, or severely tender to light touch (peritoneal signs)',
      'Vomiting blood or noticing black, tarry bowel movements',
      'High fever accompanying severe abdominal cramping'
    ],
    routineCheckupCriteria: [
      'Abdominal pain recurring consistently after eating over several weeks',
      'Unexplained weight loss or changes in bowel habits lasting >2 weeks'
    ],
    questionsForDoctor: [
      'Could my stomach symptoms be related to my medications (e.g. Metformin GI upset or NSAID irritation)?',
      'Would testing for H. pylori or an abdominal ultrasound be helpful?'
    ]
  },
  {
    id: 'dizziness',
    name: 'Dizziness / Lightheadedness',
    matchKeywords: ['dizziness', 'dizzy', 'lightheaded', 'room spinning', 'vertigo', 'feeling faint', 'unsteady'],
    followUpQuestions: [
      'Does the room feel like it is spinning (vertigo), or do you feel lightheaded as if you might faint?',
      'Does it happen primarily when standing up quickly from a sitting or lying position?',
      'Have you been drinking enough fluids, and what has your blood pressure been recently?'
    ],
    possibleCauses: [
      {
        name: 'Orthostatic Hypotension (Postural Drop)',
        description: 'Transient drop in arterial blood pressure upon standing up quickly, causing brief lightheadedness.',
        commonFactors: 'Antihypertensive medications (e.g. Lisinopril, Amlodipine), dehydration, prolonged bed rest.'
      },
      {
        name: 'Benign Paroxysmal Positional Vertigo (BPPV) / Inner Ear',
        description: 'Brief spinning sensation triggered by head position changes (turning in bed, looking up).',
        commonFactors: 'Displaced inner ear otoconia crystals; vestibular irritation.'
      },
      {
        name: 'Mild Dehydration or Hypoglycemia',
        description: 'Weakness and lightheadedness due to low fluid volume or skipped meals.',
        commonFactors: 'Hot weather, diabetes medications, delayed meals.'
      }
    ],
    selfCareGuidance: [
      'Sit down or lie flat immediately when feeling dizzy to prevent accidental falls.',
      'Change positions gradually: sit on the edge of the bed for 1-2 minutes before standing up.',
      'Stay consistently hydrated with water and electrolyte-containing beverages.',
      'Avoid sudden rapid head turns while feeling unsteady.'
    ],
    urgentSigns: [
      'Dizziness accompanied by chest pain, irregular heart palpitations, or shortness of breath',
      'Sudden dizziness with facial droop, slurred speech, double vision, or weakness in an arm/leg (stroke FAST)',
      'Actual loss of consciousness (syncope / fainting episode)'
    ],
    routineCheckupCriteria: [
      'Frequent episodes of lightheadedness upon standing',
      'Dizziness that began shortly after starting or adjusting blood pressure medications'
    ],
    questionsForDoctor: [
      'Is my blood pressure reading optimal, or could my antihypertensive dosage need adjustment?',
      'Can we measure my orthostatic vitals (blood pressure lying down vs. standing)?'
    ]
  }
];

export const symptomTriageService = {
  // Evaluates symptoms mentioned in patient query
  evaluateSymptoms(query: string): SymptomEvaluationResult | null {
    if (!query || !query.trim()) return null;
    const clean = query.toLowerCase();

    const matchedItems: SymptomKnowledgeItem[] = [];

    for (const item of symptomKnowledgeBase) {
      const hasMatch = item.matchKeywords.some(kw => clean.includes(kw));
      if (hasMatch) {
        matchedItems.push(item);
      }
    }

    if (matchedItems.length === 0) {
      return null;
    }

    // Merge detected symptoms and guidance
    const detectedNames = matchedItems.map(m => m.name);
    const followUps = Array.from(new Set(matchedItems.flatMap(m => m.followUpQuestions))).slice(0, 3);
    const causes = matchedItems.flatMap(m => m.possibleCauses).slice(0, 4);
    const selfCare = Array.from(new Set(matchedItems.flatMap(m => m.selfCareGuidance))).slice(0, 5);
    const urgentSigns = Array.from(new Set(matchedItems.flatMap(m => m.urgentSigns))).slice(0, 4);
    const routineCriteria = Array.from(new Set(matchedItems.flatMap(m => m.routineCheckupCriteria))).slice(0, 3);
    const questionsForDoc = Array.from(new Set(matchedItems.flatMap(m => m.questionsForDoctor))).slice(0, 3);

    return {
      detectedSymptoms: detectedNames,
      followUpQuestions: followUps,
      possibleCauses: causes,
      selfCareGuidance: selfCare,
      whenToConsultDoctor: {
        urgentSigns,
        routineCheckupCriteria: routineCriteria
      },
      questionsForDoctor: questionsForDoc
    };
  }
};
