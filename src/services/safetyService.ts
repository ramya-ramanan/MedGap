import { getSupabase } from './supabase';
import { SafetyAlert, RiskSeverity, AlertStatus, AdverseReaction, Medication } from '../types';
import { safetyKnowledgeBase } from '../data/mockData';

export interface SafetyCheckResponse {
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
  adverseReactionAlerts: {
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
  conditionAlerts: {
    condition: string;
    severity: RiskSeverity;
    description: string;
    clinicalNote: string;
  }[];
  summaryMessage: string;
  timestamp: string;
  disclaimer: string;
}

const conditionContraindications: {
  conditionKeywords: string[];
  drugKeywords: string[];
  severity: RiskSeverity;
  description: string;
  clinicalNote: string;
}[] = [
  {
    conditionKeywords: ['asthma', 'copd', 'bronchospasm'],
    drugKeywords: ['aspirin', 'ibuprofen', 'naproxen', 'diclofenac', 'propranolol', 'atenolol', 'metoprolol', 'carvedilol', 'labetalol', 'timolol'],
    severity: 'High',
    description: 'NSAIDs or non-selective beta-blockers may precipitate severe bronchospasm in patients with reactive airway disease.',
    clinicalNote: 'Cardioselective beta-blocker or paracetamol alternative recommended under clinical supervision.',
  },
  {
    conditionKeywords: ['hypertension', 'high blood pressure'],
    drugKeywords: ['pseudoephedrine', 'phenylephrine', 'ephedrine', 'oxymetazoline'],
    severity: 'Moderate',
    description: 'Sympathomimetic decongestants cause peripheral vasoconstriction and can induce blood pressure spikes.',
    clinicalNote: 'Recommend saline sprays or non-sympathomimetic alternatives for nasal congestion.',
  },
  {
    conditionKeywords: ['peptic ulcer', 'gerd', 'gastric ulcer', 'stomach bleed', 'gi bleed'],
    drugKeywords: ['aspirin', 'ibuprofen', 'naproxen', 'ketorolac', 'diclofenac', 'indomethacin', 'meloxicam'],
    severity: 'High',
    description: 'Non-steroidal anti-inflammatory agents impair gastric mucosal barrier prostaglandins, significantly increasing ulcer recurrence and bleeding risk.',
    clinicalNote: 'Co-prescribe PPI gastroprotection or use acetaminophen/paracetamol.',
  },
  {
    conditionKeywords: ['chronic kidney disease', 'ckd', 'renal impairment', 'kidney failure'],
    drugKeywords: ['ibuprofen', 'naproxen', 'diclofenac', 'ketorolac', 'gentamicin', 'amikacin'],
    severity: 'High',
    description: 'NSAIDs inhibit renal vasodilatory prostaglandins, decreasing renal perfusion and risking acute kidney injury.',
    clinicalNote: 'Monitor eGFR and serum creatinine; avoid nephrotoxic agents where possible.',
  },
  {
    conditionKeywords: ['diabetes', 'diabetic', 'type 2 diabetes'],
    drugKeywords: ['prednisone', 'dexamethasone', 'hydrocortisone', 'methylprednisolone', 'prednisolone'],
    severity: 'Moderate',
    description: 'Systemic corticosteroids stimulate hepatic gluconeogenesis and peripheral insulin resistance, causing marked glycemic spikes.',
    clinicalNote: 'Intensify blood glucose surveillance and adjust anti-diabetic pharmacotherapy if steroid course is necessary.',
  },
];

export const safetyService = {
  // Execute safety evaluation against database and patient profile
  async checkMedicationSafety(
    userId: string,
    medicineName: string,
    strength: string = '',
    dosage: string = '',
    patientContext?: {
      knownAllergies?: string[];
      adverseReactions?: AdverseReaction[];
      activeMedicines?: Medication[];
      conditions?: string[];
    }
  ): Promise<SafetyCheckResponse> {
    const supabase = getSupabase();
    const cleanMedName = medicineName.trim().toLowerCase();

    const allergyAlerts: SafetyCheckResponse['allergyAlerts'] = [];
    const adverseReactionAlerts: SafetyCheckResponse['adverseReactionAlerts'] = [];
    const duplicateAlerts: SafetyCheckResponse['duplicateAlerts'] = [];
    const interactionAlerts: SafetyCheckResponse['interactionAlerts'] = [];
    const conditionAlerts: SafetyCheckResponse['conditionAlerts'] = [];

    // 1. Check Known Allergies & Cross-Reactivity
    const allergiesToCheck = patientContext?.knownAllergies || [];
    allergiesToCheck.forEach((allergy) => {
      const allergyLower = allergy.toLowerCase();
      const group = safetyKnowledgeBase.allergenGroups.find(
        (g) => g.allergen.toLowerCase().includes(allergyLower) || allergyLower.includes(g.allergen.toLowerCase())
      );

      if (group) {
        const isConflict = group.conflictingDrugs.some(
          (d) => cleanMedName.includes(d) || d.includes(cleanMedName)
        );
        if (isConflict) {
          allergyAlerts.push({
            allergy: group.allergen,
            severity: 'High',
            description: `🚨 ALLERGY ALERT: ${medicineName} cross-reacts with recorded ${group.allergen} hypersensitivity. ${group.riskDescription}`,
            clinicalNote: group.clinicalNote,
          });
        }
      } else if (cleanMedName.includes(allergyLower) || allergyLower.includes(cleanMedName)) {
        allergyAlerts.push({
          allergy,
          severity: 'High',
          description: `🚨 DIRECT ALLERGY ALERT: ${medicineName} matches patient recorded allergy: ${allergy}.`,
          clinicalNote: 'Strict hypersensitivity contraindication. Healthcare professional review required.',
        });
      }
    });

    // If no context allergies provided or offline fallback, check global allergen knowledge base
    if (allergyAlerts.length === 0 && (!patientContext || !patientContext.knownAllergies || patientContext.knownAllergies.length === 0)) {
      safetyKnowledgeBase.allergenGroups.forEach((group) => {
        const matchesDrug = group.conflictingDrugs.some(
          (d) => cleanMedName.includes(d) || d.includes(cleanMedName)
        );
        if (matchesDrug) {
          allergyAlerts.push({
            allergy: group.allergen,
            severity: 'High',
            description: group.riskDescription,
            clinicalNote: group.clinicalNote,
          });
        }
      });
    }

    // 2. Check Previous Adverse Reactions & Side Effects (ADRs)
    const adrsToCheck = patientContext?.adverseReactions || [];
    adrsToCheck.forEach((adr) => {
      const adrMedLower = adr.medicineName.toLowerCase();
      if (cleanMedName.includes(adrMedLower) || adrMedLower.includes(cleanMedName)) {
        adverseReactionAlerts.push({
          medicineName: adr.medicineName,
          reaction: adr.reaction,
          severity: adr.severity === 'Severe' || adr.severity === 'Life-Threatening' ? 'High' : 'Moderate',
          description: `⚠️ PREVIOUS ADVERSE REACTION: Patient previously experienced "${adr.reaction}" with ${adr.medicineName} (${adr.dateRecorded}). Re-exposure carries significant hypersensitivity or adverse event recurrence risk.`,
          clinicalNote: adr.notes ? `Patient notes: ${adr.notes}. Clinical review required before re-administration.` : 'Clinical review required before re-administration.',
        });
      }
    });

    // 3. Check Active Medications & Duplicates
    const activeMeds = patientContext?.activeMedicines || [];
    safetyKnowledgeBase.duplicateClasses.forEach((cls) => {
      const matchesNew = cls.drugs.some((d) => cleanMedName.includes(d) || d.includes(cleanMedName));
      if (matchesNew) {
        activeMeds.forEach((existing) => {
          const existingLower = (existing.name + ' ' + (existing.genericName || '')).toLowerCase();
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

    // Check Drug-Drug Interactions
    safetyKnowledgeBase.drugInteractions.forEach((interaction) => {
      const drugALower = interaction.drugA.toLowerCase();
      const drugBLower = interaction.drugB.toLowerCase();

      const newIsA = cleanMedName.includes(drugALower) || drugALower.includes(cleanMedName);
      const newIsB = cleanMedName.includes(drugBLower) || drugBLower.includes(cleanMedName);

      if (newIsA || newIsB) {
        if (activeMeds.length > 0) {
          activeMeds.forEach((existing) => {
            const existingLower = (existing.name + ' ' + (existing.genericName || '')).toLowerCase();
            const existingIsMatch = newIsA ? existingLower.includes(drugBLower) : existingLower.includes(drugALower);
            if (existingIsMatch) {
              interactionAlerts.push({
                existingMedicine: existing.name,
                severity: interaction.severity,
                title: interaction.title,
                mechanism: `🚨 INTERACTION: ${interaction.title}. ${interaction.mechanism}`,
                recommendation: interaction.recommendation,
              });
            }
          });
        } else {
          // If no active meds provided in context, record the potential interaction warning
          interactionAlerts.push({
            existingMedicine: newIsA ? interaction.drugB.toUpperCase() : interaction.drugA.toUpperCase(),
            severity: interaction.severity,
            title: interaction.title,
            mechanism: interaction.mechanism,
            recommendation: interaction.recommendation,
          });
        }
      }
    });

    // 4. Check Known Condition Contraindications
    const conditionsToCheck = patientContext?.conditions || [];
    conditionsToCheck.forEach((cond) => {
      const condLower = cond.toLowerCase();
      conditionContraindications.forEach((contra) => {
        const conditionMatches = contra.conditionKeywords.some((ck) => condLower.includes(ck) || ck.includes(condLower));
        if (conditionMatches) {
          const drugMatches = contra.drugKeywords.some((dk) => cleanMedName.includes(dk) || dk.includes(cleanMedName));
          if (drugMatches) {
            conditionAlerts.push({
              condition: cond,
              severity: contra.severity,
              description: `⚠️ CONDITION CONTRAINDICATION: ${medicineName} is contraindicated or cautioned in patients with recorded condition "${cond}". ${contra.description}`,
              clinicalNote: contra.clinicalNote,
            });
          }
        }
      });
    });

    // Determine overall risk level
    let overallRisk: RiskSeverity = 'Info';
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

    if (hasHigh) {
      overallRisk = 'High';
    } else if (hasModerate) {
      overallRisk = 'Moderate';
    } else if (allergyAlerts.length > 0 || duplicateAlerts.length > 0 || interactionAlerts.length > 0 || conditionAlerts.length > 0) {
      overallRisk = 'Low';
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

    // Persist alerts to Supabase safety_alerts if issues exist and supabase is connected
    if (hasIssues && supabase && userId) {
      try {
        const dbAlerts = [
          ...allergyAlerts.map((a) => ({
            user_id: userId,
            alert_type: 'Allergy Related' as const,
            severity: a.severity,
            medicine_a: medicineName,
            description: a.description,
            status: 'Unreviewed' as const,
          })),
          ...duplicateAlerts.map((d) => ({
            user_id: userId,
            alert_type: 'Possible Duplicate' as const,
            severity: 'Moderate' as const,
            medicine_a: medicineName,
            medicine_b: d.existingMedicine,
            description: d.explanation,
            status: 'Unreviewed' as const,
          })),
          ...interactionAlerts.map((i) => ({
            user_id: userId,
            alert_type: 'Drug Interaction' as const,
            severity: i.severity,
            medicine_a: medicineName,
            medicine_b: i.existingMedicine,
            description: i.mechanism,
            status: 'Unreviewed' as const,
          })),
        ];

        await supabase.from('safety_alerts').insert(dbAlerts);
      } catch (e) {
        console.warn('Could not persist alerts to Supabase:', e);
      }
    }

    return {
      hasIssues,
      overallRisk,
      evaluatedMedicine: {
        name: medicineName,
        strength: strength || 'Standard Dosage',
        dosage: dosage || 'Prescribed',
      },
      allergyAlerts,
      adverseReactionAlerts,
      duplicateAlerts,
      interactionAlerts,
      conditionAlerts,
      summaryMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      disclaimer:
        'This is a clinical pharmacovigilance safety alert for professional review, not a prescription replacement. Medication changes must be authorized by a qualified healthcare provider.',
    };
  },

  // Fetch all alerts for a user from Supabase
  async getSafetyAlerts(userId: string): Promise<SafetyAlert[] | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('safety_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch safety alerts:', error.message);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      type: row.alert_type,
      severity: row.severity,
      title: `${row.alert_type}: ${row.medicine_a}${row.medicine_b ? ` & ${row.medicine_b}` : ''}`,
      medicineA: row.medicine_a,
      medicineB: row.medicine_b,
      newMedicine: row.medicine_a,
      conflictingMedicine: row.medicine_b,
      description: row.description,
      status: row.status,
      timestamp: new Date(row.created_at).toLocaleDateString() + ' ' + new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      resolved: row.status === 'Resolved',
    }));
  },

  // Update alert status (Reviewed / Resolved)
  async updateAlertStatus(alertId: string, status: AlertStatus): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { error } = await supabase
      .from('safety_alerts')
      .update({ status })
      .eq('id', alertId);

    return !error;
  },
};
