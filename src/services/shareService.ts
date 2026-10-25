import { getSupabase } from './supabase';
import { SharedPatientViewData, SharingSession } from '../types';

export const shareService = {
  // Generate cryptographically random secure token
  generateSecureToken(): string {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let code = 'mg_sec_';
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(16);
      window.crypto.getRandomValues(array);
      for (let i = 0; i < 16; i++) {
        code += chars.charAt(array[i] % chars.length);
      }
    } else {
      for (let i = 0; i < 16; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    return code;
  },

  // Create temporary access share on backend associated with authenticated patient's Supabase user ID
  async createShareToken(
    userId: string,
    durationMinutes: number = 30,
    recipientRole: 'Doctor' | 'Pharmacist' | 'Emergency Clinician' = 'Doctor'
  ): Promise<SharingSession | null> {
    const supabase = getSupabase();
    let token = this.generateSecureToken();
    let expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    if (supabase) {
      try {
        // First attempt using the secure backend RPC
        const { data: rpcData, error: rpcError } = await supabase.rpc('create_access_share', {
          p_duration_minutes: durationMinutes,
          p_recipient_role: recipientRole,
        });

        if (!rpcError && rpcData?.share_token) {
          token = rpcData.share_token;
          expiresAt = new Date(rpcData.expires_at);
        } else {
          // Direct insert fallback under RLS (using user_id = auth.uid())
          const { error: insertError } = await supabase
            .from('access_shares')
            .insert({
              user_id: userId,
              share_token: token,
              expires_at: expiresAt.toISOString(),
              access_type: 'read_only',
              recipient_role: recipientRole,
              is_active: true,
            });

          if (!insertError) {
            await supabase.from('medication_history').insert({
              user_id: userId,
              action_type: 'shared',
              title: 'Secure QR Access Pass Created',
              description: `Temporary ${durationMinutes}-minute QR pass created for ${recipientRole}.`,
            });
          } else {
            console.warn('Could not persist share token to Supabase table:', insertError.message);
          }
        }
      } catch (err) {
        console.warn('Error creating share token in Supabase:', err);
      }
    }

    const session: SharingSession = {
      id: 'session-' + Date.now(),
      token,
      isActive: true,
      expiresAt,
      remainingMinutes: durationMinutes,
      recipientRole,
      sharedScopes: {
        currentMedications: true,
        allergies: true,
        safetyAlerts: true,
        prescriptionHistory: true,
      },
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('medgap_active_share_session', JSON.stringify(session));
    }

    return session;
  },

  // Retrieve read-only authorized data for doctor via share_token
  async getSharedProfile(token: string): Promise<SharedPatientViewData> {
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('get_shared_profile', {
          p_share_token: token,
        });

        if (!error && data) {
          return data as SharedPatientViewData;
        }
      } catch (err) {
        console.warn('RPC get_shared_profile error:', err);
      }
    }

    // Offline / demo simulator fallback: check local storage token
    if (typeof window !== 'undefined') {
      const storedSession = localStorage.getItem('medgap_active_share_session');
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession);
          if (parsed.token === token) {
            // Check if revoked
            if (!parsed.isActive) {
              return {
                valid: false,
                status: 'revoked',
                error: 'This access pass has been revoked by the patient.',
                disclaimer: 'Read-only view — Medication decisions remain with qualified healthcare professionals.',
              };
            }

            // Check if expired
            const exp = new Date(parsed.expiresAt);
            if (exp <= new Date()) {
              return {
                valid: false,
                status: 'expired',
                error: 'This temporary access pass has expired.',
                disclaimer: 'Read-only view — Medication decisions remain with qualified healthcare professionals.',
              };
            }

            // Active and valid: load dynamic patient records from localStorage
            const profileRaw = localStorage.getItem('medgap_patient_profile_v1');
            const medsRaw = localStorage.getItem('medgap_medications_v1');
            const alertsRaw = localStorage.getItem('medgap_safety_alerts_v1');
            const rxRaw = localStorage.getItem('medgap_prescriptions_v1');
            const timelineRaw = localStorage.getItem('medgap_timeline_v1');
            const adrRaw = localStorage.getItem('medgap_adverse_reactions_v1');
            const visitsRaw = localStorage.getItem('medgap_doctor_visits_v1');
            const reportsRaw = localStorage.getItem('medgap_medical_reports_v1');
            const lifestyleRaw = localStorage.getItem('medgap_lifestyle_history_v1');

            const profile = profileRaw ? JSON.parse(profileRaw) : null;
            const meds = medsRaw ? JSON.parse(medsRaw) : [];
            const alerts = alertsRaw ? JSON.parse(alertsRaw) : [];
            const rxs = rxRaw ? JSON.parse(rxRaw) : [];
            const timeline = timelineRaw ? JSON.parse(timelineRaw) : [];
            const adrs = adrRaw ? JSON.parse(adrRaw) : [];
            const visits = visitsRaw ? JSON.parse(visitsRaw) : [];
            const reports = reportsRaw ? JSON.parse(reportsRaw) : [];
            const lifestyle = lifestyleRaw ? JSON.parse(lifestyleRaw) : [];

            return {
              valid: true,
              status: 'active',
              expires_at: exp.toISOString(),
              patient: profile ? {
                full_name: profile.fullName || 'Patient',
                age: profile.age,
                gender: profile.gender,
                blood_group: profile.bloodGroup,
                email: profile.email,
                phone: profile.phone,
              } : undefined,
              allergies: profile?.knownAllergies || [],
              conditions: profile?.existingConditions || [],
              lifestyle_history: (lifestyle || []).map((l: any) => ({
                id: String(l.id),
                substance_type: l.substanceType,
                custom_substance_name: l.customSubstanceName,
                status: l.status,
                duration_value: l.durationValue,
                duration_unit: l.durationUnit,
                quit_duration_value: l.quitDurationValue,
                quit_duration_unit: l.quitDurationUnit,
                notes: l.notes,
              })),
              adverse_reactions: (adrs || []).map((ar: any) => ({
                id: ar.id,
                medicine_name: ar.medicineName,
                reaction: ar.reaction,
                severity: ar.severity,
                date_recorded: ar.dateRecorded,
                notes: ar.notes,
              })),
              doctor_visits: (visits || []).map((v: any) => ({
                id: v.id,
                doctor_name: v.doctorName,
                specialty: v.specialty,
                clinic_or_hospital: v.clinicOrHospital,
                visit_date: v.visitDate,
                reason_for_visit: v.reasonForVisit,
                diagnosis_notes: v.diagnosisNotes,
                follow_up_date: v.followUpDate,
              })),
              medical_reports: (reports || []).map((r: any) => ({
                id: r.id,
                title: r.title,
                report_type: r.reportType,
                date: r.date,
                facility_or_doctor: r.facilityOrDoctor,
                summary_or_findings: r.summaryOrFindings,
                file_url: r.fileUrl,
              })),
              current_medicines: (meds || [])
                .filter((m: any) => m.status === 'Active')
                .map((m: any) => ({
                  name: m.name,
                  generic_name: m.genericName,
                  strength: m.strength,
                  dosage: m.dosage,
                  frequency: m.frequency,
                  timing: m.timing,
                  prescribed_by: m.prescribedBy,
                  start_date: m.startDate,
                  indication: m.indication,
                })),
              prescriptions: (rxs || []).map((rx: any) => ({
                id: rx.id,
                doctor_name: rx.doctorName,
                hospital_name: rx.hospitalOrClinic,
                specialty: rx.specialty,
                prescription_date: rx.issueDate,
                prescription_number: rx.prescriptionNumber,
                extraction_status: rx.status,
                file_url: rx.fileUrl,
                medicines: (rx.extractedMedicines || []).map((em: any) => ({
                  name: em.name,
                  generic_name: em.genericName,
                  strength: em.strength,
                  dosage: em.dosage,
                  frequency: em.frequency,
                  duration: em.duration,
                })),
              })),
              medication_history: (timeline || []).map((evt: any) => ({
                id: evt.id,
                action_type: evt.type,
                title: evt.title,
                description: evt.description,
                created_at: evt.date || new Date().toISOString(),
              })),
              safety_alerts: (alerts || [])
                .filter((a: any) => !a.resolved)
                .map((a: any) => ({
                  alert_type: a.type || 'Drug Interaction',
                  severity: a.severity || 'Moderate',
                  medicine_a: a.medicineA || a.newMedicine,
                  medicine_b: a.medicineB || a.conflictingMedicine,
                  description: a.description,
                })),
              disclaimer: 'Read-only view — Medication decisions remain with qualified healthcare professionals.',
            };
          }
        } catch (e) {
          console.error('Error reading offline session:', e);
        }
      }
    }

    return {
      valid: false,
      status: 'invalid',
      error: 'Invalid access token. This secure link does not exist or has expired.',
      disclaimer: 'Read-only view — Medication decisions remain with qualified healthcare professionals.',
    };
  },

  // Revoke active share token
  async revokeShareToken(token: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('revoke_access_share', {
          p_share_token: token,
        });
        if (!error) return Boolean(data);

        await supabase
          .from('access_shares')
          .update({ is_active: false })
          .eq('share_token', token);
      } catch (err) {
        console.warn('Error revoking token in Supabase:', err);
      }
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('medgap_active_share_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.token === token) {
            parsed.isActive = false;
            localStorage.setItem('medgap_active_share_session', JSON.stringify(parsed));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    return true;
  },
};
