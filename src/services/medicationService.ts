import { getSupabase } from './supabase';
import { Medication, MasterMedication } from '../types';

export const medicationService = {
  // Search the master pharmacological database
  async searchMasterMedications(query: string): Promise<MasterMedication[]> {
    const supabase = getSupabase();
    if (!supabase || !query.trim()) {
      return [];
    }

    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .or(`medicine_name.ilike.%${query}%,generic_name.ilike.%${query}%,active_ingredient.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.warn('Error querying medications master:', error.message);
      return [];
    }

    return data || [];
  },

  // Get active and discontinued patient medications
  async getPatientMedications(userId: string): Promise<Medication[] | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('patient_medications')
      .select(`
        id,
        medicine_name,
        generic_name,
        dose,
        frequency,
        timing,
        start_date,
        end_date,
        status,
        prescribed_by,
        indication,
        notes,
        medication_id,
        medications (
          medicine_name,
          generic_name,
          active_ingredient,
          strength
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch patient medications:', error.message);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.medicine_name || row.medications?.medicine_name || 'Unnamed Medication',
      genericName: row.generic_name || row.medications?.generic_name || '',
      activeIngredient: row.medications?.active_ingredient || '',
      strength: row.medications?.strength || row.dose,
      dosage: row.dose,
      frequency: row.frequency,
      timing: row.timing || '',
      status: row.status,
      prescribedBy: row.prescribed_by || 'Physician',
      startDate: row.start_date,
      endDate: row.end_date,
      indication: row.indication || '',
      instructions: row.notes || '',
      category: 'Therapeutic',
    }));
  },

  // Add medication to wallet
  async addMedication(userId: string, med: Omit<Medication, 'id'>): Promise<string | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('patient_medications')
      .insert({
        user_id: userId,
        medicine_name: med.name,
        generic_name: med.genericName,
        dose: med.dosage || med.strength,
        frequency: med.frequency,
        timing: med.timing || '',
        start_date: med.startDate,
        end_date: med.endDate || null,
        status: med.status || 'Active',
        prescribed_by: med.prescribedBy,
        indication: med.indication,
        notes: med.instructions,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to add patient medication:', error.message);
      return null;
    }

    // Log to medication_history
    await supabase.from('medication_history').insert({
      user_id: userId,
      action_type: 'added',
      title: `Medicine ${med.name} ${med.strength} Added`,
      description: `Added to active wallet with frequency ${med.frequency}. Prescribed by ${med.prescribedBy}.`,
    });

    return data?.id || null;
  },

  // Update existing medication
  async updateMedication(id: string, updates: Partial<Medication>): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const payload: Record<string, any> = {};
    if (updates.name) payload.medicine_name = updates.name;
    if (updates.genericName) payload.generic_name = updates.genericName;
    if (updates.dosage) payload.dose = updates.dosage;
    if (updates.frequency) payload.frequency = updates.frequency;
    if (updates.timing) payload.timing = updates.timing;
    if (updates.status) payload.status = updates.status;
    if (updates.prescribedBy) payload.prescribed_by = updates.prescribedBy;
    if (updates.startDate) payload.start_date = updates.startDate;
    if (updates.endDate !== undefined) payload.end_date = updates.endDate;
    if (updates.indication) payload.indication = updates.indication;
    if (updates.instructions) payload.notes = updates.instructions;
    payload.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('patient_medications')
      .update(payload)
      .eq('id', id);

    return !error;
  },

  // Discontinue medication
  async discontinueMedication(userId: string, id: string, medName: string, reason?: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { error } = await supabase
      .from('patient_medications')
      .update({
        status: 'Discontinued',
        end_date: new Date().toISOString().split('T')[0],
        notes: reason ? `Discontinued: ${reason}` : 'Discontinued by patient/clinician',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (!error) {
      await supabase.from('medication_history').insert({
        user_id: userId,
        action_type: 'discontinued',
        title: `Medicine ${medName} Discontinued`,
        description: reason || 'Medication marked as discontinued in patient profile.',
      });
    }

    return !error;
  },

  // Delete medication
  async deleteMedication(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { error } = await supabase
      .from('patient_medications')
      .delete()
      .eq('id', id);

    return !error;
  },
};
