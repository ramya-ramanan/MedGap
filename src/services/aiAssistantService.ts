// AI Medical Information & Triage Assistant Service
// Safe, reliable clinical assistant adhering to strict medical guardrails,
// verified pharmacology lookups, emergency triage, and MedGap profile locker integration.

import { emergencyTriageService, EmergencyRedFlagAlert } from './emergencyTriageService';
import { symptomTriageService, SymptomEvaluationResult } from './symptomTriageService';
import { medicineDatabaseService, VerifiedMedicineMonograph } from './medicineDatabaseService';
import { safetyService } from './safetyService';
import { PatientProfile, Medication, AdverseReaction, RiskSeverity } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  emergencyAlert?: EmergencyRedFlagAlert;
  symptomEvaluation?: SymptomEvaluationResult;
  verifiedMonographs?: VerifiedMedicineMonograph[];
  profileSafetyAlerts?: {
    type: 'allergy' | 'interaction' | 'duplicate' | 'condition' | 'adverse_reaction';
    severity: RiskSeverity;
    title: string;
    description: string;
    recommendation: string;
  }[];
  interactiveFollowUps?: string[];
  suggestedDoctorQuestions?: string[];
  disclaimer: string;
}

export interface ConversationThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

const STORAGE_THREADS_KEY = 'medgap_assistant_threads_v1';
const STORAGE_ACTIVE_THREAD_KEY = 'medgap_assistant_active_thread_id';
const STORAGE_LOCKER_AUTH_KEY = 'medgap_assistant_locker_auth_v1';

export const MANDATORY_CLINICAL_DISCLAIMER =
  'MedGap provides general medical information and safety guidance; it does not replace a qualified healthcare professional.';

export const aiAssistantService = {
  // Authorization state for MedGap Medical Locker access
  isLockerAuthorized(): boolean {
    const val = localStorage.getItem(STORAGE_LOCKER_AUTH_KEY);
    return val === null ? true : val === 'true'; // Default enabled for seamless patient safety, user can toggle off
  },

  setLockerAuthorized(authorized: boolean): void {
    localStorage.setItem(STORAGE_LOCKER_AUTH_KEY, authorized ? 'true' : 'false');
  },

  // Conversation thread management
  getThreads(): ConversationThread[] {
    try {
      const data = localStorage.getItem(STORAGE_THREADS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveThreads(threads: ConversationThread[]): void {
    try {
      localStorage.setItem(STORAGE_THREADS_KEY, JSON.stringify(threads));
    } catch (e) {
      console.warn('Failed to persist assistant conversation threads:', e);
    }
  },

  getActiveThreadId(): string | null {
    return localStorage.getItem(STORAGE_ACTIVE_THREAD_KEY);
  },

  setActiveThreadId(id: string): void {
    localStorage.setItem(STORAGE_ACTIVE_THREAD_KEY, id);
  },

  createNewThread(title = 'New Consultation'): ConversationThread {
    const newThread: ConversationThread = {
      id: 'thread-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'welcome-msg',
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Hello! I am your MedGap AI Medical Assistant. I can help answer medical questions in simple language, understand symptoms, explain possible causes, provide self-care guidance, check verified medicine information, and alert you to potential safety concerns.

How can I help you today?`,
          interactiveFollowUps: [
            'I have a headache and mild fever',
            'Tell me about Metformin uses and side effects',
            'Can I take Ibuprofen with my current medicines?',
            'What are emergency warning signs for chest pain?'
          ],
          disclaimer: MANDATORY_CLINICAL_DISCLAIMER
        }
      ]
    };

    const threads = this.getThreads();
    threads.unshift(newThread);
    this.saveThreads(threads);
    this.setActiveThreadId(newThread.id);
    return newThread;
  },

  // Main processing pipeline for a user message
  async processUserMessage(
    userText: string,
    patientContext?: {
      patientProfile?: PatientProfile;
      activeMedications?: Medication[];
      adverseReactions?: AdverseReaction[];
      isLockerAuthorized?: boolean;
    }
  ): Promise<ChatMessage> {
    const cleanQuery = userText.trim();
    const lower = cleanQuery.toLowerCase();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Emergency Warning-Sign / Red-Flag Detection
    const emergencyCheck = emergencyTriageService.evaluateRedFlags(cleanQuery);

    // 2. Strict Prescribing & Dosage Guardrail Checks
    const isPrescriptionRequest =
      /\b(prescribe|write (me a )?prescription|give me a prescription|order me antibiotics|prescribe me)\b/i.test(lower);
    const isDosageChangeRequest =
      /\b(double my dose|increase my dose|change my dose|should i stop taking|can i stop taking|cut in half|what dose should i take|how many mg should i take)\b/i.test(lower);

    // 3. Symptom-based Triage
    const symptomEval = symptomTriageService.evaluateSymptoms(cleanQuery);

    // 4. Medicine Mentions & Verified Monograph Lookup
    const mentionedMeds = medicineDatabaseService.extractMentionedMedicines(cleanQuery);
    const monographs: VerifiedMedicineMonograph[] = [];
    let unverifiedMedicineName: string | null = null;

    // Check if user specifically asked about medicine information
    const isMedicineQuery =
      /\b(medicine|drug|tablet|pill|side effect|contraindication|uses|dosage|take|safe|reaction)\b/i.test(lower) ||
      mentionedMeds.length > 0;

    if (mentionedMeds.length > 0) {
      for (const med of mentionedMeds) {
        const monograph = await medicineDatabaseService.getVerifiedMonograph(med);
        if (monograph) {
          monographs.push(monograph);
        }
      }
    } else if (isMedicineQuery) {
      // If user queried a specific unknown medicine word
      const words = cleanQuery.split(/[\s,?.!]+/).filter(w => w.length > 3);
      for (const w of words) {
        const mono = await medicineDatabaseService.getVerifiedMonograph(w);
        if (mono) {
          monographs.push(mono);
          break;
        }
      }
      // If user specifically asked about a medicine that was not found
      if (monographs.length === 0 && /\b(about|take|effects of|uses of|dose of)\s+([a-zA-Z]+)/i.test(cleanQuery)) {
        const match = cleanQuery.match(/\b(about|take|effects of|uses of|dose of)\s+([a-zA-Z]+)/i);
        if (match && match[2] && !['the', 'my', 'this', 'your', 'some', 'these'].includes(match[2].toLowerCase())) {
          unverifiedMedicineName = match[2];
        }
      }
    }

    // 5. Patient Profile & Safety Integration (If authorized)
    const isAuthorized = patientContext?.isLockerAuthorized ?? this.isLockerAuthorized();
    const profileSafetyAlerts: ChatMessage['profileSafetyAlerts'] = [];

    if (isAuthorized && patientContext?.patientProfile) {
      const profile = patientContext.patientProfile;
      const activeMeds = patientContext.activeMedications || [];
      const adrs = patientContext.adverseReactions || profile.adverseReactions || [];

      // Evaluate any mentioned medicines against patient safety records
      for (const med of mentionedMeds) {
        const safetyResult = await safetyService.checkMedicationSafety(
          profile.id,
          med,
          '',
          '',
          {
            knownAllergies: profile.knownAllergies,
            adverseReactions: adrs,
            activeMedicines: activeMeds,
            conditions: profile.existingConditions
          }
        );

        // Allergy alerts
        safetyResult.allergyAlerts.forEach(a => {
          profileSafetyAlerts.push({
            type: 'allergy',
            severity: a.severity,
            title: `Recorded Allergy Conflict: ${a.allergy}`,
            description: a.description,
            recommendation: 'Strictly avoid re-exposure. Contact your physician or pharmacist immediately.'
          });
        });

        // Adverse reaction alerts
        if (safetyResult.adverseReactionAlerts) {
          safetyResult.adverseReactionAlerts.forEach(adr => {
            profileSafetyAlerts.push({
              type: 'adverse_reaction',
              severity: adr.severity,
              title: `Previous Adverse Reaction to ${adr.medicineName}`,
              description: adr.description,
              recommendation: adr.clinicalNote
            });
          });
        }

        // Duplicate alerts
        safetyResult.duplicateAlerts.forEach(d => {
          profileSafetyAlerts.push({
            type: 'duplicate',
            severity: 'Moderate',
            title: `Duplicate Therapy with Active Medicine ${d.existingMedicine}`,
            description: d.explanation,
            recommendation: 'Consult your prescribing doctor before taking duplicate therapeutic classes.'
          });
        });

        // Interaction alerts
        safetyResult.interactionAlerts.forEach(i => {
          profileSafetyAlerts.push({
            type: 'interaction',
            severity: i.severity,
            title: i.title,
            description: i.mechanism,
            recommendation: i.recommendation
          });
        });

        // Condition contraindications
        if (safetyResult.conditionAlerts) {
          safetyResult.conditionAlerts.forEach(c => {
            profileSafetyAlerts.push({
              type: 'condition',
              severity: c.severity,
              title: `Caution with Condition: ${c.condition}`,
              description: c.description,
              recommendation: c.clinicalNote
            });
          });
        }
      }
    }

    // 6. Formulate Synthesized Response Text
    let responseText = '';
    const followUps: string[] = [];
    const doctorQuestions: string[] = [];

    // Emergency branch
    if (emergencyCheck.isEmergency) {
      responseText = `### 🚨 EMERGENCY WARNING DETECTED: PLEASE ACT IMMEDIATELY

Based on the symptoms you reported (**${emergencyCheck.category}**), this situation may represent an acute medical emergency that requires **immediate in-person emergency evaluation**.

> **Immediate Action Required**: Call **911**, **112**, or your local emergency telephone number immediately, or have someone drive you to the nearest hospital Emergency Department right away.

**Why immediate emergency care is critical:**
${emergencyCheck.guidanceText}

**What to do right now:**
${emergencyCheck.emergencyActions.map(a => `- ${a}`).join('\n')}

*Please do not delay seeking emergency care or attempt to self-treat.*`;
    }
    // Guardrail branch: Prescribing or Dosage Change
    else if (isPrescriptionRequest || isDosageChangeRequest) {
      responseText = `### 👨‍⚕️ Clinical Medication Safety Guidance

${
  isPrescriptionRequest
    ? `**MedGap is an AI safety & information assistant and cannot write prescriptions or independently prescribe medications.**`
    : `**MedGap must not independently start, stop, adjust, or change any medication or dosage.**`
}

Prescription medications, specific dosages, and treatment regimens require an in-person physical assessment, diagnostic review, and clinical authorization by a licensed physician or healthcare professional.

**Important Safety Principles:**
1. **Never alter your dosage independently:** Changing or stopping prescribed medications (such as blood pressure, heart, or diabetes medicines) abruptly can cause dangerous rebound spikes, complications, or adverse reactions.
2. **Consult your prescribing physician:** If you are experiencing side effects, feel a dose is ineffective, or need a prescription refill, please contact your prescribing doctor or speak with a licensed pharmacist.
3. **Bring your MedGap Locker records:** You can use MedGap's **Doctor Portal Share** to show your physician your complete list of verified medications and allergy history.`;

      followUps.push('How can I share my medications with my doctor?');
      followUps.push('What are the potential side effects of my current medicines?');
      doctorQuestions.push('Is my current medication dose appropriate for my symptoms?');
      doctorQuestions.push('Are there non-pharmacological adjustments that could support my care?');
    }
    // Unverified medicine safety branch (Zero hallucinations)
    else if (unverifiedMedicineName && monographs.length === 0 && !symptomEval) {
      responseText = `### 💊 Verified Medicine Information Lookup

I searched our pharmacological databases and live FDA monographs for **"${unverifiedMedicineName}"**, but could not find a verified clinical record matching that name.

> **Reliability Safeguard**: To protect patient safety, MedGap strictly uses verified medical databases and **never invents or guesses medicine information**.

**Recommended Next Steps:**
- Check the spelling on your prescription label or medicine package.
- Ensure you are searching the active generic name or registered brand name.
- Consult a licensed pharmacist or your prescribing physician for authoritative guidance regarding this medicine.`;

      followUps.push('Show verified information on common medications');
      followUps.push('Check interactions for active medicines in my locker');
    }
    // Symptom Triage branch
    else if (symptomEval) {
      const detectedList = symptomEval.detectedSymptoms.join(', ');
      responseText = `### 🩺 Symptom Guidance & Triage Evaluation

I understand you are experiencing symptoms related to **${detectedList}**. Here is clinical guidance to help you understand possible causes and safe next steps.

#### Possible Causes (General Considerations, Not a Definitive Diagnosis)
${symptomEval.possibleCauses
  .map(
    c => `- **${c.name}**: ${c.description}\n  *Common factors*: ${c.commonFactors}`
  )
  .join('\n')}

#### 🌿 Evidence-Based Self-Care Guidance
${symptomEval.selfCareGuidance.map(s => `- ${s}`).join('\n')}

#### ⚠️ When You Should Consult a Doctor
- **Seek Urgent Medical Care if you experience:**
${symptomEval.whenToConsultDoctor.urgentSigns.map(u => `  - ${u}`).join('\n')}
- **Schedule a Routine Doctor Appointment if:**
${symptomEval.whenToConsultDoctor.routineCheckupCriteria.map(r => `  - ${r}`).join('\n')}`;

      // Append profile-specific safety warnings if any were detected
      if (profileSafetyAlerts.length > 0) {
        responseText += `\n\n---\n### ⚠️ MedGap Profile Safety Alerts for Your Active Locker\n`;
        profileSafetyAlerts.forEach(a => {
          responseText += `\n> **${a.title}** (${a.severity} Priority)\n> ${a.description}\n> *Recommendation*: ${a.recommendation}\n`;
        });
      } else if (isAuthorized) {
        responseText += `\n\n*🔒 MedGap Locker Active: No direct allergy or duplicate conflicts detected for your active profile.*`;
      }

      followUps.push(...symptomEval.followUpQuestions);
      doctorQuestions.push(...symptomEval.questionsForDoctor);
    }
    // Medicine Monograph branch
    else if (monographs.length > 0) {
      const mono = monographs[0];
      responseText = `### 💊 Verified Medicine Information: ${mono.name} (${mono.genericName})

**Class:** ${mono.therapeuticClass}  
**Source:** ${mono.source} (FDA Approved Monograph)

#### Standard Uses & Approved Indications
${mono.standardUses.map(u => `- ${u}`).join('\n')}

#### Common Side Effects
${mono.commonSideEffects.map(s => `- ${s}`).join('\n')}

#### ⚠️ Serious Warnings & Precautions
${mono.seriousWarnings.map(w => `- ${w}`).join('\n')}

#### Contraindications & When to Avoid
${mono.contraindications.map(c => `- ${c}`).join('\n')}

#### Key Interactions to Discuss with Your Doctor
${mono.interactionsSummary.map(i => `- ${i}`).join('\n')}`;

      if (profileSafetyAlerts.length > 0) {
        responseText += `\n\n---\n### ⚠️ Safety Alerts for Your Profile Locker\n`;
        profileSafetyAlerts.forEach(a => {
          responseText += `\n> **${a.title}** (${a.severity} Priority)\n> ${a.description}\n> *Clinical Guidance*: ${a.recommendation}\n`;
        });
      }

      followUps.push(`Can I take ${mono.name} with food?`);
      followUps.push(`What should I do if I experience side effects from ${mono.name}?`);
      doctorQuestions.push(`Is ${mono.name} the most appropriate choice given my medical history?`);
      doctorQuestions.push(`What monitoring lab tests are needed while taking ${mono.name}?`);
    }
    // General conversational fallback
    else {
      responseText = `Thank you for your question. I am here to help you navigate medical questions safely and simply.

You can ask me to:
- **Analyze symptoms**: Describe what you are feeling (e.g. *"I have a dry cough and mild fever"* or *"My stomach hurts after eating"*).
- **Look up medicines**: Ask for verified clinical facts, common side effects, and precautions (e.g. *"Tell me about Lisinopril"* or *"What are Metformin side effects?"*).
- **Check safety interactions**: When connected to your MedGap locker, I cross-reference recorded allergies and active medications to explain safety considerations.

${
  isAuthorized
    ? '🔒 *Your MedGap Profile Locker is connected (allergies & active medicines are actively protected).*'
    : '🔓 *MedGap Profile Locker is currently disconnected. General information only.*'
}`;

      followUps.push('I have a headache and mild fever');
      followUps.push('Tell me about Lisinopril side effects');
      followUps.push('Can I take Aspirin with Ibuprofen?');
      followUps.push('What are warning signs for high blood pressure?');
    }

    return {
      id: 'msg-' + Date.now(),
      sender: 'assistant',
      timestamp: now,
      text: responseText,
      emergencyAlert: emergencyCheck.isEmergency ? emergencyCheck : undefined,
      symptomEvaluation: symptomEval || undefined,
      verifiedMonographs: monographs.length > 0 ? monographs : undefined,
      profileSafetyAlerts: profileSafetyAlerts.length > 0 ? profileSafetyAlerts : undefined,
      interactiveFollowUps: followUps.slice(0, 4),
      suggestedDoctorQuestions: doctorQuestions.slice(0, 3),
      disclaimer: MANDATORY_CLINICAL_DISCLAIMER
    };
  },

  // Export conversation as clean formatted markdown transcript for doctor consultations
  exportConversationTranscript(thread: ConversationThread, patientName = 'Patient'): string {
    let transcript = `# MedGap AI Medical Assistant - Consultation Summary\n\n`;
    transcript += `**Patient:** ${patientName}\n`;
    transcript += `**Date:** ${new Date(thread.createdAt).toLocaleDateString()} ${new Date(thread.createdAt).toLocaleTimeString()}\n`;
    transcript += `**Topic:** ${thread.title}\n\n`;
    transcript += `> **Clinical Notice:** ${MANDATORY_CLINICAL_DISCLAIMER}\n\n`;
    transcript += `---\n\n`;

    thread.messages.forEach(msg => {
      const role = msg.sender === 'user' ? 'Patient' : 'MedGap AI Assistant';
      transcript += `### [${msg.timestamp}] ${role}:\n${msg.text}\n\n`;
    });

    return transcript;
  }
};
