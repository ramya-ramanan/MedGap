import { getSupabase } from './supabase';
import { Prescription, ExtractedMedicine } from '../types';

export const prescriptionService = {
  // Upload prescription document to Supabase Storage bucket 'prescriptions'
  async uploadPrescriptionFile(userId: string, file: File): Promise<string | null> {
    const supabase = getSupabase();
    if (!supabase) {
      // In simulation mode, generate a mock object URL
      return URL.createObjectURL(file);
    }

    try {
      const fileExt = file.name.split('.').pop() || 'pdf';
      const filePath = `${userId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

      const { data, error } = await supabase.storage
        .from('prescriptions')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.warn('Supabase storage upload error:', error.message);
        return null;
      }

      // Get signed URL for private bucket
      const { data: urlData } = await supabase.storage
        .from('prescriptions')
        .createSignedUrl(filePath, 60 * 60 * 24); // 24 hours

      return urlData?.signedUrl || filePath;
    } catch (err) {
      console.error('Prescription file upload error:', err);
      return null;
    }
  },

  // Save new prescription with extracted medicines
  async savePrescription(
    userId: string,
    rx: {
      doctorName: string;
      hospitalName: string;
      specialty?: string;
      prescriptionDate: string;
      prescriptionNumber?: string;
      fileUrl?: string;
      fileName: string;
      extractedMedicines: ExtractedMedicine[];
    }
  ): Promise<string | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    // 1. Insert into prescriptions
    const { data: rxData, error: rxError } = await supabase
      .from('prescriptions')
      .insert({
        user_id: userId,
        file_url: rx.fileUrl || '',
        doctor_name: rx.doctorName,
        hospital_name: rx.hospitalName,
        specialty: rx.specialty || 'General Medicine',
        prescription_date: rx.prescriptionDate,
        prescription_number: rx.prescriptionNumber || `RX-${Math.floor(10000 + Math.random() * 90000)}`,
        extraction_status: 'Processed',
      })
      .select('id')
      .single();

    if (rxError || !rxData) {
      console.error('Failed to create prescription row:', rxError?.message);
      return null;
    }

    const prescriptionId = rxData.id;

    // 2. Insert into prescription_medications
    if (rx.extractedMedicines.length > 0) {
      const medRows = rx.extractedMedicines.map((m) => ({
        prescription_id: prescriptionId,
        medicine_name: m.name,
        generic_name: m.genericName || m.name,
        strength: m.strength,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration || '30 days',
        confidence_score: m.confidenceScore || 95,
        confirmed: Boolean(m.confirmed),
        flagged_alert: m.flaggedAlert || null,
      }));

      await supabase.from('prescription_medications').insert(medRows);
    }

    // 3. Log to medication_history
    await supabase.from('medication_history').insert({
      user_id: userId,
      action_type: 'prescription',
      title: `Prescription Uploaded (${rx.fileName})`,
      description: `Uploaded document from ${rx.doctorName} (${rx.hospitalName}). Extracted ${rx.extractedMedicines.length} candidate medications.`,
    });

    return prescriptionId;
  },

  // Fetch all prescriptions for user
  async getPrescriptions(userId: string): Promise<Prescription[] | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        id,
        file_url,
        prescription_date,
        doctor_name,
        hospital_name,
        specialty,
        prescription_number,
        extraction_status,
        prescription_medications (
          id,
          medicine_name,
          generic_name,
          strength,
          dosage,
          frequency,
          duration,
          confidence_score,
          confirmed,
          flagged_alert
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch prescriptions:', error.message);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      doctorName: row.doctor_name,
      specialty: row.specialty || 'General Care',
      hospitalOrClinic: row.hospital_name,
      issueDate: row.prescription_date,
      prescriptionNumber: row.prescription_number || `RX-${row.id.slice(0, 8)}`,
      status: row.extraction_status,
      fileUrl: row.file_url,
      fileName: `Prescription_${row.prescription_date}.pdf`,
      extractedMedicines: (row.prescription_medications || []).map((m: any) => ({
        id: m.id,
        name: m.medicine_name,
        genericName: m.generic_name,
        strength: m.strength,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        confidenceScore: Number(m.confidence_score) || 95,
        confirmed: m.confirmed,
        flaggedAlert: m.flagged_alert,
      })),
    }));
  },
};
