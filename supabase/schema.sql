-- ==============================================================================
-- MedGap: Unified Medication Safety Platform Database Schema
-- Supabase PostgreSQL with Row Level Security (RLS) & Stored Procedures
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    date_of_birth DATE,
    gender TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. PATIENT HEALTH (Allergies, conditions, emergency contact)
CREATE TABLE IF NOT EXISTS public.patient_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    allergies TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    conditions TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    emergency_contact JSONB DEFAULT '{"name":"","relationship":"","phone":""}'::JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. MEDICATIONS (Master pharmacological directory)
CREATE TABLE IF NOT EXISTS public.medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_name TEXT NOT NULL,
    generic_name TEXT,
    active_ingredient TEXT,
    strength TEXT,
    dosage_form TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. PATIENT MEDICATIONS (User active and historical wallet medications)
CREATE TABLE IF NOT EXISTS public.patient_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    medication_id UUID REFERENCES public.medications(id) ON DELETE SET NULL,
    medicine_name TEXT, -- Fallback / custom name if not in master directory
    generic_name TEXT,
    dose TEXT NOT NULL,
    frequency TEXT NOT NULL,
    timing TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT CHECK (status IN ('Active', 'Discontinued', 'Completed')) DEFAULT 'Active' NOT NULL,
    prescribed_by TEXT,
    indication TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. PRESCRIPTIONS (Uploaded clinical document records)
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_url TEXT,
    prescription_date DATE NOT NULL,
    doctor_name TEXT NOT NULL,
    hospital_name TEXT NOT NULL,
    specialty TEXT,
    prescription_number TEXT,
    extraction_status TEXT CHECK (extraction_status IN ('Uploading', 'Processing', 'Extracted', 'Processed', 'Failed')) DEFAULT 'Processed' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. PRESCRIPTION MEDICATIONS (Extracted candidate medicines from OCR)
CREATE TABLE IF NOT EXISTS public.prescription_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE NOT NULL,
    medicine_name TEXT NOT NULL,
    generic_name TEXT,
    strength TEXT,
    dosage TEXT,
    frequency TEXT,
    duration TEXT,
    confidence_score NUMERIC DEFAULT 95.0,
    confirmed BOOLEAN DEFAULT false NOT NULL,
    flagged_alert TEXT
);

-- 7. DRUG INTERACTIONS (Verified drug-to-drug interaction knowledge base)
CREATE TABLE IF NOT EXISTS public.drug_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_a TEXT NOT NULL,
    medicine_b TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('Low', 'Moderate', 'High')) NOT NULL,
    description TEXT NOT NULL,
    source TEXT DEFAULT 'Clinical Pharmacopoeia & Evidence Dataset',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8. MEDICATION DUPLICATES (Active ingredient duplication detection catalog)
CREATE TABLE IF NOT EXISTS public.medication_duplicates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_a TEXT NOT NULL,
    medicine_b TEXT NOT NULL,
    active_ingredient TEXT NOT NULL,
    description TEXT NOT NULL,
    source TEXT DEFAULT 'Therapeutic Class & Active Ingredient Equivalence'
);

-- 9. SAFETY ALERTS (Generated patient alerts)
CREATE TABLE IF NOT EXISTS public.safety_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    alert_type TEXT CHECK (alert_type IN ('Drug Interaction', 'Possible Duplicate', 'Allergy Related')) NOT NULL,
    severity TEXT CHECK (severity IN ('Low', 'Moderate', 'High')) NOT NULL,
    medicine_a TEXT NOT NULL,
    medicine_b TEXT,
    description TEXT NOT NULL,
    status TEXT CHECK (status IN ('Unreviewed', 'Reviewed', 'Resolved')) DEFAULT 'Unreviewed' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 10. ACCESS SHARES (Temporary QR & doctor view tokens)
CREATE TABLE IF NOT EXISTS public.access_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    share_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    access_type TEXT DEFAULT 'read_only' NOT NULL,
    recipient_role TEXT DEFAULT 'Doctor',
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 11. MEDICATION HISTORY (Immutable audit log of patient actions)
CREATE TABLE IF NOT EXISTS public.medication_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 12. ADVERSE REACTIONS (Logged allergies, side effects & hypersensitivities)
CREATE TABLE IF NOT EXISTS public.adverse_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    medicine_name TEXT NOT NULL,
    reaction TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('Mild', 'Moderate', 'Severe', 'Life-Threatening')) DEFAULT 'Moderate' NOT NULL,
    date_recorded DATE DEFAULT CURRENT_DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 13. DOCTOR VISITS (Clinical consultations & provider notes)
CREATE TABLE IF NOT EXISTS public.doctor_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    doctor_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    clinic_or_hospital TEXT NOT NULL,
    visit_date DATE NOT NULL,
    reason_for_visit TEXT NOT NULL,
    diagnosis_notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 14. MEDICAL REPORTS (Diagnostic, laboratory & pathology reports)
CREATE TABLE IF NOT EXISTS public.medical_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    report_type TEXT CHECK (report_type IN ('Lab Test', 'Radiology', 'Pathology', 'Discharge Summary', 'Other')) DEFAULT 'Lab Test' NOT NULL,
    report_date DATE NOT NULL,
    facility_or_doctor TEXT NOT NULL,
    summary_or_findings TEXT NOT NULL,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 15. LIFESTYLE & SUBSTANCE HISTORY (Smoking, alcohol, tobacco, other)
CREATE TABLE IF NOT EXISTS public.lifestyle_substance_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    substance_type TEXT CHECK (substance_type IN ('Smoking', 'Alcohol', 'Tobacco', 'Other')) NOT NULL,
    custom_substance_name TEXT,
    status TEXT CHECK (status IN ('Current', 'Past', 'Never')) NOT NULL,
    duration_value NUMERIC,
    duration_unit TEXT CHECK (duration_unit IN ('days', 'months', 'years')),
    quit_duration_value NUMERIC,
    quit_duration_unit TEXT CHECK (quit_duration_unit IN ('days', 'months', 'years')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 16. MEDICATION REMINDERS (User reminder schedules & times)
CREATE TABLE IF NOT EXISTS public.medication_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    medication_id UUID REFERENCES public.patient_medications(id) ON DELETE SET NULL,
    medicine_name TEXT NOT NULL,
    reminder_time TIME NOT NULL,
    days_of_week TEXT[] DEFAULT '{"Mon","Tue","Wed","Thu","Fri","Sat","Sun"}'::TEXT[] NOT NULL,
    is_enabled BOOLEAN DEFAULT true NOT NULL,
    dosage TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all user data tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adverse_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifestyle_substance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_reminders ENABLE ROW LEVEL SECURITY;

-- Lifestyle Substance History policies
CREATE POLICY "Users can view own lifestyle history" ON public.lifestyle_substance_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lifestyle history" ON public.lifestyle_substance_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lifestyle history" ON public.lifestyle_substance_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lifestyle history" ON public.lifestyle_substance_history
    FOR DELETE USING (auth.uid() = user_id);

-- Medication Reminders policies
CREATE POLICY "Users can view own reminders" ON public.medication_reminders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders" ON public.medication_reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON public.medication_reminders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" ON public.medication_reminders
    FOR DELETE USING (auth.uid() = user_id);

-- Reference catalogs (readable by all authenticated or anonymous users)
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_duplicates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for master medications" ON public.medications
    FOR SELECT USING (true);

CREATE POLICY "Public read for drug interactions" ON public.drug_interactions
    FOR SELECT USING (true);

CREATE POLICY "Public read for medication duplicates" ON public.medication_duplicates
    FOR SELECT USING (true);

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Patient Health policies
CREATE POLICY "Users can view own health" ON public.patient_health
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own health" ON public.patient_health
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health" ON public.patient_health
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Patient Medications policies
CREATE POLICY "Users can manage own medications" ON public.patient_medications
    FOR ALL USING (auth.uid() = user_id);

-- Prescriptions policies
CREATE POLICY "Users can manage own prescriptions" ON public.prescriptions
    FOR ALL USING (auth.uid() = user_id);

-- Prescription Medications policies
CREATE POLICY "Users can view own rx medications" ON public.prescription_medications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.prescriptions
            WHERE prescriptions.id = prescription_medications.prescription_id
            AND prescriptions.user_id = auth.uid()
        )
    );

-- Safety Alerts policies
CREATE POLICY "Users can manage own safety alerts" ON public.safety_alerts
    FOR ALL USING (auth.uid() = user_id);

-- Access Shares policies
CREATE POLICY "Users can manage own share tokens" ON public.access_shares
    FOR ALL USING (auth.uid() = user_id);

-- Medication History policies
CREATE POLICY "Users can manage own medication history" ON public.medication_history
    FOR ALL USING (auth.uid() = user_id);

-- Adverse Reactions policies
CREATE POLICY "Users can manage own adverse reactions" ON public.adverse_reactions
    FOR ALL USING (auth.uid() = user_id);

-- Doctor Visits policies
CREATE POLICY "Users can manage own doctor visits" ON public.doctor_visits
    FOR ALL USING (auth.uid() = user_id);

-- Medical Reports policies
CREATE POLICY "Users can manage own medical reports" ON public.medical_reports
    FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, date_of_birth, gender, phone)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Patient'),
        new.email,
        COALESCE((new.raw_user_meta_data->>'date_of_birth')::DATE, '1980-01-01'::DATE),
        COALESCE(new.raw_user_meta_data->>'gender', 'Not Specified'),
        COALESCE(new.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.patient_health (user_id, allergies, conditions, emergency_contact)
    VALUES (
        new.id,
        ARRAY[]::TEXT[],
        ARRAY[]::TEXT[],
        '{"name":"","relationship":"","phone":""}'::JSONB
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- SECURE DOCTOR VIEW RPC (SECURITY DEFINER)
-- Allows public/doctor portal read-only access STRICTLY via an active share_token
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_shared_profile(p_share_token TEXT)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_is_active BOOLEAN;
    v_expires_at TIMESTAMPTZ;
    v_result JSONB;
BEGIN
    -- Look up token
    SELECT user_id, is_active, expires_at 
    INTO v_user_id, v_is_active, v_expires_at
    FROM public.access_shares
    WHERE share_token = p_share_token;

    -- Validate existence
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'valid', false,
            'status', 'invalid',
            'error', 'Invalid access token. This secure link does not exist.'
        );
    END IF;

    -- Validate revocation
    IF NOT v_is_active THEN
        RETURN jsonb_build_object(
            'valid', false,
            'status', 'revoked',
            'error', 'This access pass has been revoked by the patient.'
        );
    END IF;

    -- Validate expiration
    IF v_expires_at < now() THEN
        RETURN jsonb_build_object(
            'valid', false,
            'status', 'expired',
            'error', 'This temporary access pass has expired.'
        );
    END IF;

    -- Build sanitized read-only medical profile
    SELECT jsonb_build_object(
        'valid', true,
        'status', 'active',
        'expires_at', v_expires_at,
        'patient', (
            SELECT jsonb_build_object(
                'full_name', p.full_name,
                'age', EXTRACT(YEAR FROM age(COALESCE(p.date_of_birth, '1974-01-01'::DATE))),
                'gender', p.gender,
                'email', p.email,
                'phone', p.phone
            )
            FROM public.profiles p WHERE p.id = v_user_id
        ),
        'allergies', (
            SELECT COALESCE(ph.allergies, '{}'::TEXT[])
            FROM public.patient_health ph WHERE ph.user_id = v_user_id
        ),
        'conditions', (
            SELECT COALESCE(ph.conditions, '{}'::TEXT[])
            FROM public.patient_health ph WHERE ph.user_id = v_user_id
        ),
        'current_medicines', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'name', COALESCE(pm.medicine_name, m.medicine_name),
                    'generic_name', COALESCE(pm.generic_name, m.generic_name),
                    'strength', COALESCE(m.strength, pm.dose),
                    'dosage', pm.dose,
                    'frequency', pm.frequency,
                    'timing', pm.timing,
                    'prescribed_by', pm.prescribed_by,
                    'start_date', pm.start_date,
                    'indication', pm.indication
                )
            ), '[]'::JSONB)
            FROM public.patient_medications pm
            LEFT JOIN public.medications m ON pm.medication_id = m.id
            WHERE pm.user_id = v_user_id AND pm.status = 'Active'
        ),
        'prescriptions', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', pr.id,
                    'doctor_name', pr.doctor_name,
                    'hospital_name', pr.hospital_name,
                    'specialty', pr.specialty,
                    'prescription_date', pr.prescription_date,
                    'prescription_number', pr.prescription_number,
                    'extraction_status', pr.extraction_status,
                    'file_url', pr.file_url,
                    'medicines', (
                        SELECT COALESCE(jsonb_agg(
                            jsonb_build_object(
                                'name', rxm.medicine_name,
                                'generic_name', rxm.generic_name,
                                'strength', rxm.strength,
                                'dosage', rxm.dosage,
                                'frequency', rxm.frequency,
                                'duration', rxm.duration
                            )
                        ), '[]'::JSONB)
                        FROM public.prescription_medications rxm
                        WHERE rxm.prescription_id = pr.id
                    )
                ) ORDER BY pr.prescription_date DESC
            ), '[]'::JSONB)
            FROM public.prescriptions pr
            WHERE pr.user_id = v_user_id
        ),
        'medication_history', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', mh.id,
                    'action_type', mh.action_type,
                    'title', mh.title,
                    'description', mh.description,
                    'created_at', mh.created_at
                ) ORDER BY mh.created_at DESC
            ), '[]'::JSONB)
            FROM public.medication_history mh
            WHERE mh.user_id = v_user_id
        ),
        'safety_alerts', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'alert_type', sa.alert_type,
                    'severity', sa.severity,
                    'medicine_a', sa.medicine_a,
                    'medicine_b', sa.medicine_b,
                    'description', sa.description
                )
            ), '[]'::JSONB)
            FROM public.safety_alerts sa
            WHERE sa.user_id = v_user_id AND sa.status != 'Resolved'
        ),
        'adverse_reactions', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', ar.id,
                    'medicine_name', ar.medicine_name,
                    'reaction', ar.reaction,
                    'severity', ar.severity,
                    'date_recorded', ar.date_recorded,
                    'notes', ar.notes
                ) ORDER BY ar.date_recorded DESC
            ), '[]'::JSONB)
            FROM public.adverse_reactions ar
            WHERE ar.user_id = v_user_id
        ),
        'doctor_visits', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', dv.id,
                    'doctor_name', dv.doctor_name,
                    'specialty', dv.specialty,
                    'clinic_or_hospital', dv.clinic_or_hospital,
                    'visit_date', dv.visit_date,
                    'reason_for_visit', dv.reason_for_visit,
                    'diagnosis_notes', dv.diagnosis_notes,
                    'follow_up_date', dv.follow_up_date
                ) ORDER BY dv.visit_date DESC
            ), '[]'::JSONB)
            FROM public.doctor_visits dv
            WHERE dv.user_id = v_user_id
        ),
        'medical_reports', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', mr.id,
                    'title', mr.title,
                    'report_type', mr.report_type,
                    'date', mr.report_date,
                    'facility_or_doctor', mr.facility_or_doctor,
                    'summary_or_findings', mr.summary_or_findings,
                    'file_url', mr.file_url
                ) ORDER BY mr.report_date DESC
            ), '[]'::JSONB)
            FROM public.medical_reports mr
            WHERE mr.user_id = v_user_id
        ),
        'disclaimer', 'Read-only view — Medication decisions remain with qualified healthcare professionals.'
    ) INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- SECURE ACCESS PASS GENERATION RPC (SECURITY DEFINER)
-- Associates randomly generated token with authenticated patient user ID
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_access_share(
    p_duration_minutes INT DEFAULT 30,
    p_recipient_role TEXT DEFAULT 'Doctor'
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_token TEXT;
    v_expires_at TIMESTAMPTZ;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Generate unique cryptographically random token
    v_token := 'mg_sec_' || lower(encode(gen_random_bytes(12), 'hex'));
    v_expires_at := now() + (p_duration_minutes || ' minutes')::INTERVAL;

    -- Deactivate older active tokens for this user
    UPDATE public.access_shares
    SET is_active = false
    WHERE user_id = v_user_id AND is_active = true;

    -- Insert new share token record
    INSERT INTO public.access_shares (
        user_id,
        share_token,
        expires_at,
        access_type,
        recipient_role,
        is_active
    ) VALUES (
        v_user_id,
        v_token,
        v_expires_at,
        'read_only',
        p_recipient_role,
        true
    );

    -- Log to medication history audit trail
    INSERT INTO public.medication_history (
        user_id,
        action_type,
        title,
        description
    ) VALUES (
        v_user_id,
        'shared',
        'Secure QR Access Pass Created',
        'Temporary ' || p_duration_minutes || '-minute QR pass generated for ' || p_recipient_role || '.'
    );

    RETURN jsonb_build_object(
        'share_token', v_token,
        'expires_at', v_expires_at,
        'duration_minutes', p_duration_minutes,
        'recipient_role', p_recipient_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- SECURE ACCESS PASS REVOCATION RPC (SECURITY DEFINER)
-- Allows patient to revoke an active pass
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.revoke_access_share(p_share_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    UPDATE public.access_shares
    SET is_active = false
    WHERE share_token = p_share_token AND user_id = v_user_id;

    -- Log revocation in medication history
    INSERT INTO public.medication_history (
        user_id,
        action_type,
        title,
        description
    ) VALUES (
        v_user_id,
        'shared',
        'Secure QR Pass Revoked',
        'Temporary clinician access pass was revoked by the patient.'
    );

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- DATABASE-LEVEL SAFETY CHECK RPC (SECURITY DEFINER)
-- Checks new medicine against active patient meds, allergies, and interactions
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.check_medication_safety(
    p_user_id UUID,
    p_new_medicine TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_allergies TEXT[];
    v_active_meds TEXT[];
    v_alerts JSONB := '[]'::JSONB;
    v_allergy_record RECORD;
    v_interaction_record RECORD;
    v_duplicate_record RECORD;
    v_overall_status TEXT := 'safe';
BEGIN
    -- 1. Fetch patient's recorded allergies
    SELECT COALESCE(allergies, '{}'::TEXT[]) INTO v_allergies
    FROM public.patient_health WHERE user_id = p_user_id;

    -- 2. Fetch patient's active medicines
    SELECT ARRAY_AGG(LOWER(COALESCE(pm.medicine_name, m.medicine_name, '')))
    INTO v_active_meds
    FROM public.patient_medications pm
    LEFT JOIN public.medications m ON pm.medication_id = m.id
    WHERE pm.user_id = p_user_id AND pm.status = 'Active';

    -- 3. Check Allergy Conflicts
    IF 'penicillin' = ANY(ARRAY(SELECT LOWER(unnest(v_allergies)))) AND 
       LOWER(p_new_medicine) ~* '(amoxicillin|ampicillin|augmentin|penicillin|piperacillin)' THEN
        v_overall_status := 'high_risk';
        v_alerts := v_alerts || jsonb_build_object(
            'type', 'Allergy Related',
            'severity', 'High',
            'medicine_a', p_new_medicine,
            'description', 'Potential allergy-related concern detected based on the patient''s recorded allergy information.'
        );
        -- Insert alert record
        INSERT INTO public.safety_alerts (user_id, alert_type, severity, medicine_a, description, status)
        VALUES (p_user_id, 'Allergy Related', 'High', p_new_medicine, 
                'Potential allergy-related concern detected based on the patient''s recorded allergy information.', 'Unreviewed');
    END IF;

    -- 4. Check Drug Interactions
    FOR v_interaction_record IN 
        SELECT medicine_a, medicine_b, severity, description 
        FROM public.drug_interactions
        WHERE (LOWER(medicine_a) = LOWER(p_new_medicine) AND LOWER(medicine_b) = ANY(v_active_meds))
           OR (LOWER(medicine_b) = LOWER(p_new_medicine) AND LOWER(medicine_a) = ANY(v_active_meds))
    LOOP
        IF v_interaction_record.severity = 'High' THEN
            v_overall_status := 'high_risk';
        ELSIF v_overall_status = 'safe' THEN
            v_overall_status := 'warning';
        END IF;

        v_alerts := v_alerts || jsonb_build_object(
            'type', 'Drug Interaction',
            'severity', v_interaction_record.severity,
            'medicine_a', p_new_medicine,
            'medicine_b', CASE WHEN LOWER(v_interaction_record.medicine_a) = LOWER(p_new_medicine) 
                               THEN v_interaction_record.medicine_b ELSE v_interaction_record.medicine_a END,
            'description', v_interaction_record.description
        );

        INSERT INTO public.safety_alerts (user_id, alert_type, severity, medicine_a, medicine_b, description, status)
        VALUES (p_user_id, 'Drug Interaction', v_interaction_record.severity, p_new_medicine,
                CASE WHEN LOWER(v_interaction_record.medicine_a) = LOWER(p_new_medicine) 
                     THEN v_interaction_record.medicine_b ELSE v_interaction_record.medicine_a END,
                v_interaction_record.description, 'Unreviewed');
    END LOOP;

    -- 5. Check Duplicates
    FOR v_duplicate_record IN 
        SELECT medicine_a, medicine_b, active_ingredient, description 
        FROM public.medication_duplicates
        WHERE (LOWER(medicine_a) = LOWER(p_new_medicine) AND LOWER(medicine_b) = ANY(v_active_meds))
           OR (LOWER(medicine_b) = LOWER(p_new_medicine) AND LOWER(medicine_a) = ANY(v_active_meds))
    LOOP
        IF v_overall_status = 'safe' THEN
            v_overall_status := 'warning';
        END IF;

        v_alerts := v_alerts || jsonb_build_object(
            'type', 'Possible Duplicate',
            'severity', 'Moderate',
            'medicine_a', p_new_medicine,
            'medicine_b', CASE WHEN LOWER(v_duplicate_record.medicine_a) = LOWER(p_new_medicine) 
                               THEN v_duplicate_record.medicine_b ELSE v_duplicate_record.medicine_a END,
            'description', 'These medicines may contain the same active ingredient. Please verify with your doctor or pharmacist.'
        );

        INSERT INTO public.safety_alerts (user_id, alert_type, severity, medicine_a, medicine_b, description, status)
        VALUES (p_user_id, 'Possible Duplicate', 'Moderate', p_new_medicine,
                CASE WHEN LOWER(v_duplicate_record.medicine_a) = LOWER(p_new_medicine) 
                     THEN v_duplicate_record.medicine_b ELSE v_duplicate_record.medicine_a END,
                'These medicines may contain the same active ingredient. Please verify with your doctor or pharmacist.', 'Unreviewed');
    END LOOP;

    RETURN jsonb_build_object(
        'status', v_overall_status,
        'alerts', v_alerts,
        'disclaimer', 'This is a potential safety alert, not a diagnosis or prescription recommendation. Consult a qualified healthcare professional before making medication changes.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- STORAGE BUCKET CREATION FOR PRESCRIPTIONS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('prescriptions', 'prescriptions', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload own prescriptions"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'prescriptions' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated users can view own prescriptions"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'prescriptions' AND (storage.foldername(name))[1] = auth.uid()::text);
