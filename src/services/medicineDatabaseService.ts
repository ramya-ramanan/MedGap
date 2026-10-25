// Verified Pharmacological Medicine Information Service
// Provides reliable, clinically verified drug monographs from a curated formulary
// with real-time OpenFDA Drug Label API fallback. Zero hallucinations allowed.

export interface VerifiedMedicineMonograph {
  name: string;
  genericName: string;
  brandNames: string[];
  therapeuticClass: string;
  indication: string;
  standardUses: string[];
  commonSideEffects: string[];
  seriousWarnings: string[];
  contraindications: string[];
  interactionsSummary: string[];
  allergyNotice?: string;
  source: 'Verified MedGap Formulary' | 'OpenFDA Official Drug Monograph';
  fdaApproved: boolean;
}

// Curated verified reference database of widely prescribed and OTC medications
export const verifiedMedicineDatabase: Record<string, VerifiedMedicineMonograph> = {
  metformin: {
    name: 'Metformin',
    genericName: 'Metformin Hydrochloride',
    brandNames: ['Glucophage', 'Fortamet', 'Glumetza', 'Riomet'],
    therapeuticClass: 'Biguanide Antidiabetic Agent',
    indication: 'Type 2 Diabetes Mellitus glycemic management alongside diet and exercise.',
    standardUses: [
      'First-line treatment for blood glucose control in type 2 diabetes',
      'Off-label: Polycystic ovary syndrome (PCOS) insulin sensitization'
    ],
    commonSideEffects: [
      'Gastrointestinal upset (nausea, diarrhea, abdominal cramps)',
      'Metallic taste in mouth',
      'Decreased vitamin B12 absorption over prolonged therapy'
    ],
    seriousWarnings: [
      'Black Box Warning: Lactic acidosis (rare but life-threatening complication, risk increases with severe renal impairment, sepsis, or excessive alcohol use)',
      'Temporarily withhold prior to iodinated radiocontrast procedures'
    ],
    contraindications: [
      'Severe renal impairment (eGFR < 30 mL/min/1.73 m²)',
      'Acute or chronic metabolic acidosis, including diabetic ketoacidosis',
      'Severe acute hepatic dysfunction or shock'
    ],
    interactionsSummary: [
      'Iodinated contrast media (heightened risk of acute renal failure and lactic acidosis)',
      'Cimetidine / cationic drugs (may increase metformin systemic concentration)',
      'Excessive alcohol intake potentiates lactic acidosis risk'
    ],
    allergyNotice: 'Contraindicated in patients with known hypersensitivity to metformin hydrochloride.',
    source: 'Verified MedGap Formulary',
    fdaApproved: true
  },
  lisinopril: {
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    brandNames: ['Prinivil', 'Zestril', 'Qbrelis'],
    therapeuticClass: 'Angiotensin-Converting Enzyme (ACE) Inhibitor',
    indication: 'Hypertension management, adjunct in heart failure, and acute myocardial infarction recovery.',
    standardUses: [
      'Lowering elevated arterial blood pressure to prevent strokes and cardiovascular events',
      'Adjunctive therapy for congestive heart failure',
      'Hemodynamic stabilization post-myocardial infarction'
    ],
    commonSideEffects: [
      'Persistent, dry, non-productive cough (bradykinin-mediated)',
      'Dizziness or lightheadedness upon standing (orthostatic hypotension)',
      'Headache and mild fatigue'
    ],
    seriousWarnings: [
      'Black Box Warning: Fetal Toxicity. ACE inhibitors cause fetal injury and death when used during pregnancy; discontinue immediately upon pregnancy confirmation',
      'Angioedema risk (rapid swelling of face, lips, tongue, or glottis requiring emergency airway intervention)',
      'Hyperkalemia (elevation of serum potassium)'
    ],
    contraindications: [
      'History of angioedema related to previous ACE inhibitor therapy',
      'Hereditary or idiopathic angioedema',
      'Concomitant use with aliskiren in patients with diabetes mellitus',
      'Pregnancy (all trimesters)'
    ],
    interactionsSummary: [
      'Potassium supplements or potassium-sparing diuretics (high risk of hyperkalemia)',
      'NSAIDs (e.g., Ibuprofen, Naproxen) may blunt antihypertensive effect and induce acute renal impairment',
      'Lithium (increased serum lithium concentrations and toxicity)'
    ],
    allergyNotice: 'Strictly contraindicated in anyone with prior ACE inhibitor-induced hypersensitivity or angioedema.',
    source: 'Verified MedGap Formulary',
    fdaApproved: true
  },
  atorvastatin: {
    name: 'Atorvastatin',
    genericName: 'Atorvastatin Calcium',
    brandNames: ['Lipitor'],
    therapeuticClass: 'HMG-CoA Reductase Inhibitor (Statin)',
    indication: 'Primary and secondary prevention of cardiovascular atherosclerotic disease and hypercholesterolemia.',
    standardUses: [
      'Reduction of low-density lipoprotein cholesterol (LDL-C) and total cholesterol',
      'Cardiovascular risk reduction in patients with coronary heart disease or diabetes'
    ],
    commonSideEffects: [
      'Myalgia (muscle aches) and joint pain (arthralgia)',
      'Mild dyspepsia or diarrhea',
      'Transient elevation of hepatic transaminases'
    ],
    seriousWarnings: [
      'Rhabdomyolysis / Severe Myopathy: Rare breakdown of muscle tissue leading to acute kidney failure. Discontinue if markedly elevated CPK levels or severe muscle tenderness/weakness occur',
      'Immune-Mediated Necrotizing Myopathy (IMNM)',
      'Elevated blood glucose / HbA1c levels'
    ],
    contraindications: [
      'Active liver disease or unexplained persistent elevations of hepatic transaminases',
      'Known hypersensitivity to atorvastatin',
      'Pregnancy and breastfeeding (category X/contraindicated)'
    ],
    interactionsSummary: [
      'Potent CYP3A4 inhibitors (Clarithromycin, Itraconazole, Ketoconazole) markedly elevate atorvastatin levels',
      'Gemfibrozil and other fibrates multiply rhabdomyolysis risk',
      'Large quantities of grapefruit juice (>1 quart/day) inhibit intestinal CYP3A4 metabolism'
    ],
    allergyNotice: 'Contraindicated in patients with severe statin hypersensitivity reactions.',
    source: 'Verified MedGap Formulary',
    fdaApproved: true
  },
  aspirin: {
    name: 'Aspirin',
    genericName: 'Acetylsalicylic Acid (ASA)',
    brandNames: ['Bayer Aspirin', 'Ecotrin', 'Bufferin', 'Ascriptin'],
    therapeuticClass: 'Antiplatelet Agent / Salicylate NSAID',
    indication: 'Secondary prevention of recurrent myocardial infarction and transient ischemic attacks; analgesia and anti-inflammatory relief.',
    standardUses: [
      'Low-dose cardioprotection (81mg - 100mg) for antiplatelet aggregation inhibition',
      'Acute coronary syndrome management under emergency medical protocol',
      'Temporary relief of mild-to-moderate pain and fever (higher doses)'
    ],
    commonSideEffects: [
      'Dyspepsia, epigastric discomfort, and nausea',
      'Increased tendency to bleed or bruise easily',
      'Microscopic gastrointestinal blood loss'
    ],
    seriousWarnings: [
      'Severe gastrointestinal ulceration and major hemorrhage risk',
      'Reye’s Syndrome: Do NOT administer to children or adolescents recovering from viral infections (chickenpox, flu)',
      'Aspirin-Exacerbated Respiratory Disease (AERD) / triad asthma with severe bronchospasm'
    ],
    contraindications: [
      'Active peptic ulcer disease or history of recurrent GI bleeding',
      'Known salicylate or NSAID hypersensitivity / nasal polyps with asthma triad',
      'Severe bleeding diathesis or hemophilia',
      'Children and adolescents with febrile viral illness'
    ],
    interactionsSummary: [
      'Other anticoagulants / antiplatelets (Warfarin, Clopidogrel, Apixaban) dramatically increase bleeding risk',
      'NSAIDs (Ibuprofen, Naproxen) competitively block aspirin antiplatelet binding and worsen GI ulceration',
      'Systemic corticosteroids worsen gastrointestinal ulcerogenic potential'
    ],
    allergyNotice: 'Absolute contraindication in patients with aspirin allergy or NSAID-induced bronchospasm.',
    source: 'Verified MedGap Formulary',
    fdaApproved: true
  },
  amoxicillin: {
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    brandNames: ['Amoxil', 'Moxatag', 'Trimox'],
    therapeuticClass: 'Aminopenicillin Beta-Lactam Antibiotic',
    indication: 'Bacterial infections including otitis media, strep pharyngitis, sinusitis, and uncomplicated respiratory tract infections.',
    standardUses: [
      'Treatment of susceptible gram-positive and select gram-negative bacterial infections',
      'H. pylori eradication (as part of multi-agent triple therapy)',
      'Prophylaxis of infective endocarditis prior to select dental procedures'
    ],
    commonSideEffects: [
      'Diarrhea and loose stools',
      'Nausea and abdominal discomfort',
      'Non-allergic erythematous maculopapular rash (common with EBV/mononucleosis)'
    ],
    seriousWarnings: [
      'Severe anaphylaxis and hypersensitivity reactions (immediate medical emergency)',
      'Clostridioides difficile-associated diarrhea (pseudomembranous colitis)',
      'Development of drug-resistant bacteria if used for non-bacterial/viral infections'
    ],
    contraindications: [
      'History of serious hypersensitivity reaction (anaphylaxis, Stevens-Johnson syndrome) to any penicillin antibiotic',
      'Infectious mononucleosis (high frequency of severe generalized skin eruption)'
    ],
    interactionsSummary: [
      'Probenecid reduces renal tubular secretion of amoxicillin, raising serum levels',
      'Allopurinol co-administration increases the incidence of cutaneous rashes',
      'May transiently reduce effectiveness of oral estrogen-progestin contraceptives'
    ],
    allergyNotice: '🚨 Penicillin cross-reactivity: Strictly contraindicated in patients with known Penicillin hypersensitivity.',
    source: 'Verified MedGap Formulary',
    fdaApproved: true
  },
  ibuprofen: {
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    brandNames: ['Advil', 'Motrin', 'Nuprin', 'Midol Liquid Gels'],
    therapeuticClass: 'Nonsteroidal Anti-inflammatory Drug (NSAID)',
    indication: 'Relief of mild-to-moderate pain, reduction of inflammation, and fever reduction.',
    standardUses: [
      'Headache, dental pain, dysmenorrhea (menstrual cramps)',
      'Osteoarthritis and rheumatoid arthritis symptomatic relief',
      'Temporary reduction of febrile states'
    ],
    commonSideEffects: [
      'Stomach upset, heartburn, nausea, abdominal pain',
      'Mild dizziness',
      'Fluid retention or mild peripheral edema'
    ],
    seriousWarnings: [
      'Black Box Warning: Cardiovascular Thrombotic Events. NSAIDs cause an increased risk of serious, potentially fatal cardiovascular thrombotic events, myocardial infarction, and stroke',
      'Black Box Warning: Gastrointestinal Risk. Serious, potentially fatal GI bleeding, ulceration, and perforation',
      'Renal toxicity: Can cause acute kidney injury or fluid overload in vulnerable patients'
    ],
    contraindications: [
      'History of asthma, urticaria, or allergic-type reactions after taking aspirin or other NSAIDs',
      'Immediate peri-operative period in coronary artery bypass graft (CABG) surgery',
      'Severe heart failure (NYHA Class IV)',
      'Active gastrointestinal bleeding or active peptic ulcer'
    ],
    interactionsSummary: [
      'Cardioprotective Aspirin (antagonizes antiplatelet inhibition and elevates ulcer risk)',
      'Antihypertensives (ACE inhibitors, ARBs, Diuretics) – blunts blood pressure control and impairs renal hemodynamics',
      'Anticoagulants (Warfarin, Direct Oral Anticoagulants) – substantially multiplies bleeding risk'
    ],
    allergyNotice: 'Strictly contraindicated in patients with aspirin triad or known NSAID hypersensitivity.',
    source: 'Verified MedGap Formulary',
    fdaApproved: true
  },
  acetaminophen: {
    name: 'Acetaminophen (Paracetamol)',
    genericName: 'Acetaminophen / Paracetamol (APAP)',
    brandNames: ['Tylenol', 'Panadol', 'Mapap', 'Feverall'],
    therapeuticClass: 'Analgesic and Antipyretic Agent',
    indication: 'Temporary relief of minor aches and pains; reduction of fever.',
    standardUses: [
      'Mild-to-moderate headache, muscular ache, osteoarthritis joint discomfort',
      'Fever reduction in adults and pediatric patients',
      'Alternative analgesic for patients unable to tolerate NSAIDs or with GI ulcer risks'
    ],
    commonSideEffects: [
      'Generally well-tolerated at therapeutic doses',
      'Infrequent mild nausea or rash'
    ],
    seriousWarnings: [
      'Black Box Warning: Hepatotoxicity. Acetaminophen has been associated with cases of acute liver failure, at times resulting in liver transplant or death. Maximum daily dose from all sources must not exceed 3,000 mg to 4,000 mg (or 2,000 mg in hepatic compromise/chronic alcohol use)',
      'Beware of hidden acetaminophen in combination OTC cold/flu/cough formulations',
      'Severe skin reactions (rare: Stevens-Johnson syndrome, toxic epidermal necrolysis)'
    ],
    contraindications: [
      'Severe active hepatic impairment or severe active liver disease',
      'Known hypersensitivity to acetaminophen'
    ],
    interactionsSummary: [
      'Chronic alcohol consumption markedly elevates toxic NAPQI metabolite production and hepatotoxicity risk',
      'Warfarin: Chronic daily high-dose acetaminophen therapy may modestly elevate INR',
      'Other APAP-containing products (risk of accidental cumulative overdose)'
    ],
    allergyNotice: 'Contraindicated in individuals with confirmed hypersensitivity to acetaminophen.',
    source: 'Verified MedGap Formulary',
    fdaApproved: true
  },
  amlodipine: {
    name: 'Amlodipine',
    genericName: 'Amlodipine Besylate',
    brandNames: ['Norvasc', 'Katerzia'],
    therapeuticClass: 'Dihydropyridine Calcium Channel Blocker (CCB)',
    indication: 'Management of hypertension and chronic stable angina pectoris.',
    standardUses: [
      'Lowering systemic arterial blood pressure by inducing peripheral arterial vasodilation',
      'Symptom reduction and exercise tolerance in chronic stable or vasospastic angina'
    ],
    commonSideEffects: [
      'Peripheral edema (dependent bilateral ankle/foot swelling)',
      'Flushing, headache, and palpitations',
      'Fatigue and dizziness'
    ],
    seriousWarnings: [
      'Severe hypotension (particularly in patients with severe aortic stenosis)',
      'Increased frequency, duration, or severity of angina or acute myocardial infarction at initiation or dose increase in patients with obstructive CAD'
    ],
    contraindications: [
      'Known severe hypersensitivity to amlodipine or other dihydropyridines',
      'Cardiogenic shock or severe hypotension'
    ],
    interactionsSummary: [
      'Simvastatin: Amlodipine increases systemic simvastatin exposure (limit simvastatin to 20mg/day)',
      'CYP3A4 inhibitors (Ketoconazole, Itraconazole) may increase amlodipine blood concentrations',
      'Other antihypertensives (additive blood pressure lowering)'
    ],
    allergyNotice: 'Contraindicated in patients with known dihydropyridine hypersensitivity.',
    source: 'Verified MedGap Formulary',
    fdaApproved: true
  },
  omeprazole: {
    name: 'Omeprazole',
    genericName: 'Omeprazole',
    brandNames: ['Prilosec', 'Zegerid'],
    therapeuticClass: 'Proton Pump Inhibitor (PPI)',
    indication: 'Gastroesophageal reflux disease (GERD), erosive esophagitis, and duodenal/gastric ulcers.',
    standardUses: [
      'Acid suppression in GERD and healing of erosive esophagitis',
      'Gastric ulcer healing and prophylaxis against NSAID-induced mucosal damage',
      'Adjunct in H. pylori eradication'
    ],
    commonSideEffects: [
      'Headache, abdominal pain, flatulence',
      'Diarrhea or mild constipation',
      'Nausea and vomiting'
    ],
    seriousWarnings: [
      'Clostridioides difficile-associated diarrhea',
      'Bone fractures (increased risk of hip, wrist, or spine fractures with high-dose/long-term therapy)',
      'Hypomagnesemia with prolonged therapy (>1 year)',
      'Vitamin B12 deficiency with long-term acid suppression'
    ],
    contraindications: [
      'Known hypersensitivity to omeprazole or any substituted benzimidazoles',
      'Concomitant administration with rilpivirine-containing products'
    ],
    interactionsSummary: [
      'Clopidogrel: Omeprazole inhibits CYP2C19, reducing conversion of clopidogrel to its active metabolite and blunting antiplatelet protection',
      'Antiretrovirals (Atazanavir, Nelfinavir) absorption impaired by increased gastric pH',
      'Methotrexate: PPIs may elevate and prolong serum methotrexate levels'
    ],
    allergyNotice: 'Contraindicated in patients with allergic history to proton pump inhibitors.',
    source: 'Verified MedGap Formulary',
    fdaApproved: true
  },
  levothyroxine: {
    name: 'Levothyroxine',
    genericName: 'Levothyroxine Sodium',
    brandNames: ['Synthroid', 'Levoxyl', 'Tirosint', 'Unithroid'],
    therapeuticClass: 'Synthetic Thyroid Hormone (T4)',
    indication: 'Replacement or supplemental therapy in congenital or acquired hypothyroidism.',
    standardUses: [
      'Thyroid hormone replacement in primary, secondary, and tertiary hypothyroidism',
      'Pituitary TSH suppression in management of thyroid cancer and goiters'
    ],
    commonSideEffects: [
      'Generally asymptomatic at therapeutic, accurately titrated dosages',
      'Signs of over-replacement mimic hyperthyroidism: palpitations, tremor, weight loss, heat intolerance, insomnia'
    ],
    seriousWarnings: [
      'Black Box Warning: Not for treatment of obesity or for weight loss (doses in excess of replacement are ineffective and risk cardiac arrhythmias or death)',
      'Cardiovascular risk: Use with extreme caution in coronary artery disease (can provoke angina or arrhythmias)'
    ],
    contraindications: [
      'Uncorrected subclinical or overt thyrotoxicosis',
      'Acute myocardial infarction',
      'Uncorrected uncompensated adrenal cortical insufficiency'
    ],
    interactionsSummary: [
      'Calcium carbonate, iron supplements, aluminum hydroxide, and sucralfate significantly impair levothyroxine gastrointestinal absorption (separate intake by at least 4 hours)',
      'Warfarin: Levothyroxine increases catabolism of vitamin K clotting factors, potentiating anticoagulant effect',
      'Food and coffee: Must be taken on an empty stomach with plain water at least 30-60 minutes before breakfast'
    ],
    allergyNotice: 'Contraindicated in individuals allergic to synthetic levothyroxine or formulation excipients.',
    source: 'Verified MedGap Formulary',
    fdaApproved: true
  },
  azithromycin: {
    name: 'Azithromycin',
    genericName: 'Azithromycin Monohydrate',
    brandNames: ['Zithromax', 'Z-Pak', 'Zmax'],
    therapeuticClass: 'Macrolide Antibiotic (Azalide)',
    indication: 'Mild-to-moderate bacterial infections of the respiratory tract, skin, and sexually transmitted infections.',
    standardUses: [
      'Acute bacterial exacerbation of COPD, community-acquired pneumonia',
      'Streptococcal pharyngitis (alternative in penicillin-allergic individuals)',
      'Uncomplicated chlamydial urethritis and cervicitis'
    ],
    commonSideEffects: [
      'Diarrhea, abdominal cramping, and loose stools',
      'Nausea and vomiting',
      'Mild headache or temporary taste disturbance'
    ],
    seriousWarnings: [
      'QT prolongation and cardiac arrhythmias (Torsades de Pointes), especially in patients with preexisting cardiac conduction abnormalities or hypokalemia',
      'Hepatotoxicity: Abnormal liver function, hepatitis, and cholestatic jaundice',
      'Clostridioides difficile-associated diarrhea'
    ],
    contraindications: [
      'Known hypersensitivity to azithromycin, erythromycin, or any macrolide/ketolide antibiotic',
      'History of cholestatic jaundice/hepatic dysfunction associated with prior azithromycin use'
    ],
    interactionsSummary: [
      'Antiarrhythmic agents (Amiodarone, Sotalol, Quinidine) multiply QT prolongation risk',
      'Antacids containing aluminum or magnesium reduce peak serum azithromycin levels',
      'Digoxin: Macrolides can increase serum digoxin levels'
    ],
    allergyNotice: 'Strictly contraindicated in individuals allergic to macrolide antibiotics.',
    source: 'Verified MedGap Formulary',
    fdaApproved: true
  },
  losartan: {
    name: 'Losartan',
    genericName: 'Losartan Potassium',
    brandNames: ['Cozaar'],
    therapeuticClass: 'Angiotensin II Receptor Blocker (ARB)',
    indication: 'Treatment of hypertension, diabetic nephropathy in type 2 diabetes, and stroke risk reduction in hypertension with LVH.',
    standardUses: [
      'Hypertension management in adults and pediatric patients',
      'Nephroprotection in hypertensive patients with type 2 diabetes and proteinuria',
      'Alternative for patients who develop persistent cough on ACE inhibitors'
    ],
    commonSideEffects: [
      'Dizziness, upper respiratory infection, nasal congestion',
      'Back pain and fatigue',
      'Rare incidence of cough compared to ACE inhibitors'
    ],
    seriousWarnings: [
      'Black Box Warning: Fetal Toxicity. Discontinue as soon as pregnancy is detected',
      'Hyperkalemia (especially in patients with renal impairment or diabetes)',
      'Hypotension in volume- or salt-depleted patients'
    ],
    contraindications: [
      'Hypersensitivity to losartan potassium',
      'Concomitant use with aliskiren in diabetic patients',
      'Pregnancy'
    ],
    interactionsSummary: [
      'Potassium supplements or potassium-sparing diuretics (hyperkalemia risk)',
      'NSAIDs may attenuate antihypertensive action and precipitate acute renal injury',
      'Lithium toxicity risk with ARBs'
    ],
    allergyNotice: 'Contraindicated in patients with hypersensitivity to losartan potassium.',
    source: 'Verified MedGap Formulary',
    fdaApproved: true
  },
  metoprolol: {
    name: 'Metoprolol',
    genericName: 'Metoprolol Tartrate / Succinate ER',
    brandNames: ['Lopressor', 'Toprol-XL'],
    therapeuticClass: 'Cardioselective Beta-1 Adrenergic Receptor Blocker',
    indication: 'Hypertension, angina pectoris, hemodynamically stable heart failure (succinate ER), and post-MI mortality reduction.',
    standardUses: [
      'Rate control in atrial fibrillation and supraventricular arrhythmias',
      'Long-term mortality reduction in chronic systolic heart failure (succinate form)',
      'Angina symptom relief and post-myocardial infarction cardioprotection'
    ],
    commonSideEffects: [
      'Bradycardia (slow heart rate) and dizziness',
      'Fatigue and reduced exercise tolerance',
      'Cold extremities and sleep disturbance'
    ],
    seriousWarnings: [
      'Black Box Warning: Avoid Abrupt Cessation. Severe exacerbation of angina, myocardial infarction, and ventricular arrhythmias may occur upon abrupt withdrawal. Taper dosage gradually over 1 to 2 weeks',
      'Bronchospasm: High doses lose beta-1 selectivity and may trigger asthma or severe COPD exacerbations',
      'Masking of hypoglycemia signs (tachycardia and tremor) in diabetic patients'
    ],
    contraindications: [
      'Sinus bradycardia (HR < 45-50 bpm), second- or third-degree AV block without pacemaker',
      'Cardiogenic shock or decompensated heart failure requiring inotropes',
      'Severe peripheral arterial circulatory disorders'
    ],
    interactionsSummary: [
      'Other bradycardic agents (Diltiazem, Verapamil, Digoxin) multiply AV block and profound bradycardia risks',
      'CYP2D6 inhibitors (Fluoxetine, Paroxetine, Bupropion) double metoprolol blood concentrations',
      'Clonidine: Rebound hypertension risk upon sudden withdrawal'
    ],
    allergyNotice: 'Contraindicated in patients with hypersensitivity to metoprolol or other beta-blockers.',
    source: 'Verified MedGap Formulary',
    fdaApproved: true
  },
  cetirizine: {
    name: 'Cetirizine',
    genericName: 'Cetirizine Hydrochloride',
    brandNames: ['Zyrtec', 'Alleroff'],
    therapeuticClass: 'Second-Generation H1 Antihistamine',
    indication: 'Relief of symptoms associated with seasonal and perennial allergic rhinitis and chronic idiopathic urticaria.',
    standardUses: [
      'Allergic symptoms: sneezing, rhinorrhea, itchy/watery eyes, nasal pruritus',
      'Chronic hives and itching urticarial eruptions'
    ],
    commonSideEffects: [
      'Mild somnolence / drowsiness (low compared to 1st gen antihistamines, but higher than fexofenadine)',
      'Dry mouth (xerostomia)',
      'Fatigue and headache'
    ],
    seriousWarnings: [
      'Central Nervous System depression: Exercise caution when operating machinery or driving',
      'Urinary retention in predisposed patients (prostatic hypertrophy)'
    ],
    contraindications: [
      'Known hypersensitivity to cetirizine, hydroxyzine, or levocetirizine',
      'Severe end-stage renal impairment without dosage adjustment'
    ],
    interactionsSummary: [
      'Alcohol and other CNS depressants (additive sedation and impairment)',
      'Theophylline modest reduction in cetirizine clearance'
    ],
    allergyNotice: 'Contraindicated in individuals allergic to cetirizine or hydroxyzine.',
    source: 'Verified MedGap Formulary',
    fdaApproved: true
  }
};

export const medicineDatabaseService = {
  // 1. Search verified local formulary
  lookupLocalMedication(name: string): VerifiedMedicineMonograph | null {
    if (!name || !name.trim()) return null;
    const clean = name.trim().toLowerCase();

    // Exact or direct key match
    if (verifiedMedicineDatabase[clean]) {
      return verifiedMedicineDatabase[clean];
    }

    // Search by name, brand names, or active ingredient
    for (const key of Object.keys(verifiedMedicineDatabase)) {
      const entry = verifiedMedicineDatabase[key];
      const nameMatch = entry.name.toLowerCase().includes(clean) || clean.includes(entry.name.toLowerCase());
      const genericMatch = entry.genericName.toLowerCase().includes(clean) || clean.includes(entry.genericName.toLowerCase());
      const brandMatch = entry.brandNames.some(b => b.toLowerCase().includes(clean) || clean.includes(b.toLowerCase()));

      if (nameMatch || genericMatch || brandMatch) {
        return entry;
      }
    }

    return null;
  },

  // 2. Query live OpenFDA official drug label database
  async lookupOpenFDAMedication(name: string): Promise<VerifiedMedicineMonograph | null> {
    if (!name || !name.trim()) return null;
    const clean = encodeURIComponent(name.trim());

    try {
      // Query OpenFDA Drug Label endpoint
      const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${clean}"+openfda.generic_name:"${clean}"&limit=1`;
      const response = await fetch(url, { headers: { Accept: 'application/json' } });

      if (!response.ok) {
        // Try loose search if strict combination misses
        const fallbackUrl = `https://api.fda.gov/drug/label.json?search="${clean}"&limit=1`;
        const fbResponse = await fetch(fallbackUrl, { headers: { Accept: 'application/json' } });
        if (!fbResponse.ok) return null;
        const fbData = await fbResponse.json();
        return this.parseOpenFDAResponse(fbData, name);
      }

      const data = await response.json();
      return this.parseOpenFDAResponse(data, name);
    } catch (err) {
      console.warn('OpenFDA API lookup unavailable or network interrupted:', err);
      return null;
    }
  },

  // Helper: parse FDA JSON response into clean structured VerifiedMedicineMonograph
  parseOpenFDAResponse(fdaData: any, requestedName: string): VerifiedMedicineMonograph | null {
    if (!fdaData || !fdaData.results || fdaData.results.length === 0) {
      return null;
    }

    const item = fdaData.results[0];
    const openfda = item.openfda || {};

    const brandName = (openfda.brand_name && openfda.brand_name[0]) || requestedName;
    const genericName = (openfda.generic_name && openfda.generic_name[0]) || brandName;
    const pharmClass = (openfda.pharm_class_cs && openfda.pharm_class_cs[0]) || 
                       (openfda.pharm_class_epc && openfda.pharm_class_epc[0]) || 'Prescription Pharmaceutical';

    const cleanSnippet = (textArray: string[] | undefined, maxLen = 300): string => {
      if (!textArray || textArray.length === 0) return 'Refer to physician prescribing information.';
      const raw = textArray[0].replace(/\s+/g, ' ').trim();
      return raw.length > maxLen ? raw.slice(0, maxLen) + '...' : raw;
    };

    const cleanList = (textArray: string[] | undefined): string[] => {
      if (!textArray || textArray.length === 0) return ['Refer to clinical prescribing label.'];
      const raw = textArray[0].replace(/\s+/g, ' ').trim();
      return raw.split(/(?<=[.!?])\s+/).slice(0, 3).filter(s => s.length > 10);
    };

    return {
      name: brandName,
      genericName: genericName,
      brandNames: openfda.brand_name || [brandName],
      therapeuticClass: pharmClass,
      indication: cleanSnippet(item.indications_and_usage || item.purpose),
      standardUses: cleanList(item.indications_and_usage),
      commonSideEffects: cleanList(item.adverse_reactions),
      seriousWarnings: cleanList(item.boxed_warning || item.warnings || item.warnings_and_precautions),
      contraindications: cleanList(item.contraindications),
      interactionsSummary: cleanList(item.drug_interactions),
      source: 'OpenFDA Official Drug Monograph',
      fdaApproved: true
    };
  },

  // 3. Combined unified lookup: First checks curated verified database, then live OpenFDA
  async getVerifiedMonograph(name: string): Promise<VerifiedMedicineMonograph | null> {
    if (!name || !name.trim()) return null;

    // Fast local verified formulary lookup
    const local = this.lookupLocalMedication(name);
    if (local) return local;

    // Fallback to official OpenFDA API
    const fdaResult = await this.lookupOpenFDAMedication(name);
    if (fdaResult) return fdaResult;

    // Zero hallucinations: If not found in verified sources, return null
    return null;
  },

  // 4. Extract any mentioned medicines from a patient query string
  extractMentionedMedicines(text: string): string[] {
    if (!text) return [];
    const lower = text.toLowerCase();
    const found: string[] = [];

    // Check all known keys and brand names in verified database
    for (const key of Object.keys(verifiedMedicineDatabase)) {
      const entry = verifiedMedicineDatabase[key];
      if (lower.includes(entry.name.toLowerCase()) || lower.includes(entry.genericName.toLowerCase())) {
        if (!found.includes(entry.name)) found.push(entry.name);
      }
      for (const brand of entry.brandNames) {
        if (lower.includes(brand.toLowerCase())) {
          if (!found.includes(entry.name)) found.push(entry.name);
        }
      }
    }

    // Common medicine aliases / terms
    const extraMedicines = [
      'advil', 'tylenol', 'aspirin', 'motrin', 'panadol', 'zyrtec', 'claritin',
      'lipitor', 'glucophage', 'zestril', 'norvasc', 'synthroid', 'zithromax', 'amoxil'
    ];
    for (const med of extraMedicines) {
      if (lower.includes(med) && !found.some(f => f.toLowerCase().includes(med))) {
        found.push(med.charAt(0).toUpperCase() + med.slice(1));
      }
    }

    return found;
  }
};
