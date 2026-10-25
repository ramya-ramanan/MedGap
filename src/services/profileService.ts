import { getSupabase } from './supabase';
import { PatientProfile, TimelineEvent, AdverseReaction, DoctorVisit, MedicalReport, LifestyleSubstanceItem } from '../types';

export interface DbProfile {
  id: string;
  full_name: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Calculates display initials for user avatars.
 * - 'Arun Kumar' -> 'AK'
 * - 'John Doe' -> 'JD'
 * - 'User' -> 'U'
 * - '' / undefined -> 'U'
 */
export const getAvatarInitials = (name?: string): string => {
  if (!name || !name.trim()) return 'P';
  const clean = name.trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'P';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export interface DbPatientHealth {
  allergies?: string[];
  conditions?: string[];
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  blood_group?: string;
  primary_care_physician?: string;
}

export const profileService = {
  /**
   * Fetch profile from the Supabase 'profiles' table using the authenticated user's ID.
   */
  async getProfile(userId: string): Promise<DbProfile | null> {
    const supabase = getSupabase();
    if (!supabase || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error querying Supabase profiles table:', error.message);
        return null;
      }

      return data as DbProfile | null;
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      return null;
    }
  },

  /**
   * Update or insert user profile in Supabase 'profiles' table.
   */
  async updateProfile(userId: string, updates: Partial<DbProfile>): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !userId) return false;

    try {
      const payload: Partial<DbProfile> & { id: string; updated_at: string } = {
        id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Error updating Supabase profiles table:', error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to update user profile:', err);
      return false;
    }
  },

  /**
   * Fetch patient health record (allergies, conditions, emergency contact) from Supabase 'patient_health' table.
   */
  async getPatientHealth(userId: string): Promise<DbPatientHealth | null> {
    const supabase = getSupabase();
    if (!supabase || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('patient_health')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        // Table might not exist or be empty yet
        return null;
      }

      return data as DbPatientHealth | null;
    } catch (err) {
      console.warn('Could not query patient_health table:', err);
      return null;
    }
  },

  /**
   * Upsert patient health record in Supabase 'patient_health' table.
   */
  async updatePatientHealth(userId: string, health: DbPatientHealth): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !userId) return false;

    try {
      const { error } = await supabase
        .from('patient_health')
        .upsert({
          user_id: userId,
          allergies: health.allergies || [],
          conditions: health.conditions || [],
          emergency_contact: health.emergency_contact || { name: '', relationship: '', phone: '' },
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      return !error;
    } catch (err) {
      console.warn('Could not update patient_health table:', err);
      return false;
    }
  },

  /**
   * Fetch user's own timeline history events from Supabase 'medication_history' table.
   */
  async getUserHistory(userId: string): Promise<TimelineEvent[] | null> {
    const supabase = getSupabase();
    if (!supabase || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('medication_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error querying medication_history:', error.message);
        return null;
      }

      return (data || []).map((row: any): TimelineEvent => {
        const type: TimelineEvent['type'] = 
          row.action_type === 'prescription' ? 'prescription' :
          row.action_type === 'discontinued' ? 'discontinued' :
          row.action_type === 'scan' ? 'scan' :
          row.action_type === 'shared' ? 'shared' :
          row.action_type === 'profile_updated' ? 'profile_updated' : 'added';

        const badgeColor: TimelineEvent['badgeColor'] =
          type === 'prescription' ? 'indigo' :
          type === 'discontinued' ? 'amber' :
          type === 'scan' ? 'emerald' :
          type === 'shared' ? 'slate' :
          type === 'profile_updated' ? 'rose' : 'sky';

        return {
          id: String(row.id),
          date: row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Today',
          relativeTime: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
          title: String(row.title || 'Medication Event'),
          description: String(row.description || ''),
          type,
          badgeColor,
          metadata: row.action_type || 'Event',
        };
      });
    } catch (err) {
      console.warn('Could not fetch user history:', err);
      return null;
    }
  },

  /**
   * Fetch user's adverse drug reactions and side effects from 'adverse_reactions' table.
   */
  async getAdverseReactions(userId: string): Promise<AdverseReaction[] | null> {
    const supabase = getSupabase();
    if (!supabase || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('adverse_reactions')
        .select('*')
        .eq('user_id', userId)
        .order('date_recorded', { ascending: false });

      if (error) {
        console.warn('Error querying adverse_reactions:', error.message);
        return null;
      }

      return (data || []).map((row: any) => ({
        id: String(row.id),
        medicineName: String(row.medicine_name),
        reaction: String(row.reaction),
        severity: row.severity || 'Moderate',
        dateRecorded: row.date_recorded || 'Recently',
        notes: row.notes || undefined,
      }));
    } catch (err) {
      console.warn('Could not fetch adverse reactions:', err);
      return null;
    }
  },

  /**
   * Add adverse reaction to 'adverse_reactions' table.
   */
  async addAdverseReaction(userId: string, item: Omit<AdverseReaction, 'id'>): Promise<AdverseReaction | null> {
    const supabase = getSupabase();
    if (!supabase || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('adverse_reactions')
        .insert({
          user_id: userId,
          medicine_name: item.medicineName,
          reaction: item.reaction,
          severity: item.severity,
          date_recorded: item.dateRecorded || new Date().toISOString().split('T')[0],
          notes: item.notes || null,
        })
        .select()
        .single();

      if (error || !data) {
        console.warn('Error saving adverse reaction:', error?.message);
        return null;
      }

      return {
        id: String(data.id),
        medicineName: data.medicine_name,
        reaction: data.reaction,
        severity: data.severity,
        dateRecorded: data.date_recorded,
        notes: data.notes || undefined,
      };
    } catch (err) {
      console.warn('Could not save adverse reaction to Supabase:', err);
      return null;
    }
  },

  /**
   * Delete adverse reaction from 'adverse_reactions' table.
   */
  async removeAdverseReaction(userId: string, id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !userId) return false;

    try {
      const { error } = await supabase
        .from('adverse_reactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      return !error;
    } catch (err) {
      console.warn('Could not remove adverse reaction:', err);
      return false;
    }
  },

  /**
   * Fetch doctor visits & consultations from 'doctor_visits' table.
   */
  async getDoctorVisits(userId: string): Promise<DoctorVisit[] | null> {
    const supabase = getSupabase();
    if (!supabase || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('doctor_visits')
        .select('*')
        .eq('user_id', userId)
        .order('visit_date', { ascending: false });

      if (error) {
        console.warn('Error querying doctor_visits:', error.message);
        return null;
      }

      return (data || []).map((row: any) => ({
        id: String(row.id),
        doctorName: String(row.doctor_name),
        specialty: String(row.specialty || 'General Practitioner'),
        clinicOrHospital: String(row.clinic_or_hospital),
        visitDate: row.visit_date || 'Recently',
        reasonForVisit: String(row.reason_for_visit),
        diagnosisNotes: row.diagnosis_notes || undefined,
        followUpDate: row.follow_up_date || undefined,
      }));
    } catch (err) {
      console.warn('Could not fetch doctor visits:', err);
      return null;
    }
  },

  /**
   * Add doctor visit to 'doctor_visits' table.
   */
  async addDoctorVisit(userId: string, item: Omit<DoctorVisit, 'id'>): Promise<DoctorVisit | null> {
    const supabase = getSupabase();
    if (!supabase || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('doctor_visits')
        .insert({
          user_id: userId,
          doctor_name: item.doctorName,
          specialty: item.specialty,
          clinic_or_hospital: item.clinicOrHospital,
          visit_date: item.visitDate || new Date().toISOString().split('T')[0],
          reason_for_visit: item.reasonForVisit,
          diagnosis_notes: item.diagnosisNotes || null,
          follow_up_date: item.followUpDate || null,
        })
        .select()
        .single();

      if (error || !data) {
        console.warn('Error saving doctor visit:', error?.message);
        return null;
      }

      return {
        id: String(data.id),
        doctorName: data.doctor_name,
        specialty: data.specialty,
        clinicOrHospital: data.clinic_or_hospital,
        visitDate: data.visit_date,
        reasonForVisit: data.reason_for_visit,
        diagnosisNotes: data.diagnosis_notes || undefined,
        followUpDate: data.follow_up_date || undefined,
      };
    } catch (err) {
      console.warn('Could not save doctor visit to Supabase:', err);
      return null;
    }
  },

  /**
   * Delete doctor visit from 'doctor_visits' table.
   */
  async removeDoctorVisit(userId: string, id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !userId) return false;

    try {
      const { error } = await supabase
        .from('doctor_visits')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      return !error;
    } catch (err) {
      console.warn('Could not remove doctor visit:', err);
      return false;
    }
  },

  /**
   * Fetch medical reports (lab, radiology, pathology) from 'medical_reports' table.
   */
  async getMedicalReports(userId: string): Promise<MedicalReport[] | null> {
    const supabase = getSupabase();
    if (!supabase || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('medical_reports')
        .select('*')
        .eq('user_id', userId)
        .order('report_date', { ascending: false });

      if (error) {
        console.warn('Error querying medical_reports:', error.message);
        return null;
      }

      return (data || []).map((row: any) => ({
        id: String(row.id),
        title: String(row.title),
        reportType: row.report_type || 'Lab Test',
        date: row.report_date || 'Recently',
        facilityOrDoctor: String(row.facility_or_doctor),
        summaryOrFindings: String(row.summary_or_findings),
        fileUrl: row.file_url || undefined,
        fileName: row.title ? `${row.title}.pdf` : undefined,
      }));
    } catch (err) {
      console.warn('Could not fetch medical reports:', err);
      return null;
    }
  },

  /**
   * Add medical report to 'medical_reports' table.
   */
  async addMedicalReport(userId: string, item: Omit<MedicalReport, 'id'>): Promise<MedicalReport | null> {
    const supabase = getSupabase();
    if (!supabase || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('medical_reports')
        .insert({
          user_id: userId,
          title: item.title,
          report_type: item.reportType,
          report_date: item.date || new Date().toISOString().split('T')[0],
          facility_or_doctor: item.facilityOrDoctor,
          summary_or_findings: item.summaryOrFindings,
          file_url: item.fileUrl || null,
        })
        .select()
        .single();

      if (error || !data) {
        console.warn('Error saving medical report:', error?.message);
        return null;
      }

      return {
        id: String(data.id),
        title: data.title,
        reportType: data.report_type,
        date: data.report_date,
        facilityOrDoctor: data.facility_or_doctor,
        summaryOrFindings: data.summary_or_findings,
        fileUrl: data.file_url || undefined,
        fileName: `${data.title}.pdf`,
      };
    } catch (err) {
      console.warn('Could not save medical report to Supabase:', err);
      return null;
    }
  },

  /**
   * Delete medical report from 'medical_reports' table.
   */
  async removeMedicalReport(userId: string, id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !userId) return false;

    try {
      const { error } = await supabase
        .from('medical_reports')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      return !error;
    } catch (err) {
      console.warn('Could not remove medical report:', err);
      return false;
    }
  },

  /**
   * Fetch patient lifestyle & substance history from 'lifestyle_substance_history' table.
   */
  async getLifestyleHistory(userId: string): Promise<LifestyleSubstanceItem[] | null> {
    const supabase = getSupabase();
    if (!supabase || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('lifestyle_substance_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error querying lifestyle_substance_history:', error.message);
        return null;
      }

      return (data || []).map((row: any): LifestyleSubstanceItem => ({
        id: String(row.id),
        substanceType: row.substance_type,
        customSubstanceName: row.custom_substance_name || undefined,
        status: row.status,
        durationValue: row.duration_value != null ? Number(row.duration_value) : undefined,
        durationUnit: row.duration_unit || undefined,
        quitDurationValue: row.quit_duration_value != null ? Number(row.quit_duration_value) : undefined,
        quitDurationUnit: row.quit_duration_unit || undefined,
        notes: row.notes || undefined,
        updatedAt: row.updated_at || row.created_at,
      }));
    } catch (err) {
      console.warn('Could not fetch lifestyle history:', err);
      return null;
    }
  },

  /**
   * Add new lifestyle & substance history item.
   */
  async addLifestyleItem(userId: string, item: Omit<LifestyleSubstanceItem, 'id'>): Promise<LifestyleSubstanceItem | null> {
    const supabase = getSupabase();
    if (!supabase || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('lifestyle_substance_history')
        .insert({
          user_id: userId,
          substance_type: item.substanceType,
          custom_substance_name: item.customSubstanceName || null,
          status: item.status,
          duration_value: item.durationValue ?? null,
          duration_unit: item.durationUnit || null,
          quit_duration_value: item.quitDurationValue ?? null,
          quit_duration_unit: item.quitDurationUnit || null,
          notes: item.notes || null,
        })
        .select()
        .single();

      if (error || !data) {
        console.warn('Error saving lifestyle item:', error?.message);
        return null;
      }

      return {
        id: String(data.id),
        substanceType: data.substance_type,
        customSubstanceName: data.custom_substance_name || undefined,
        status: data.status,
        durationValue: data.duration_value != null ? Number(data.duration_value) : undefined,
        durationUnit: data.duration_unit || undefined,
        quitDurationValue: data.quit_duration_value != null ? Number(data.quit_duration_value) : undefined,
        quitDurationUnit: data.quit_duration_unit || undefined,
        notes: data.notes || undefined,
        updatedAt: data.updated_at || data.created_at,
      };
    } catch (err) {
      console.warn('Could not save lifestyle item to Supabase:', err);
      return null;
    }
  },

  /**
   * Update existing lifestyle item.
   */
  async updateLifestyleItem(userId: string, id: string, updates: Partial<LifestyleSubstanceItem>): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !userId) return false;

    try {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.substanceType) payload.substance_type = updates.substanceType;
      if (updates.customSubstanceName !== undefined) payload.custom_substance_name = updates.customSubstanceName;
      if (updates.status) payload.status = updates.status;
      if (updates.durationValue !== undefined) payload.duration_value = updates.durationValue;
      if (updates.durationUnit !== undefined) payload.duration_unit = updates.durationUnit;
      if (updates.quitDurationValue !== undefined) payload.quit_duration_value = updates.quitDurationValue;
      if (updates.quitDurationUnit !== undefined) payload.quit_duration_unit = updates.quitDurationUnit;
      if (updates.notes !== undefined) payload.notes = updates.notes;

      const { error } = await supabase
        .from('lifestyle_substance_history')
        .update(payload)
        .eq('id', id)
        .eq('user_id', userId);

      return !error;
    } catch (err) {
      console.warn('Could not update lifestyle item:', err);
      return false;
    }
  },

  /**
   * Delete lifestyle item.
   */
  async removeLifestyleItem(userId: string, id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !userId) return false;

    try {
      const { error } = await supabase
        .from('lifestyle_substance_history')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      return !error;
    } catch (err) {
      console.warn('Could not remove lifestyle item:', err);
      return false;
    }
  },
};
