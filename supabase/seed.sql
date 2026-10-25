-- ==============================================================================
-- MedGap: Verified Drug Safety Knowledge Base & Prototype Demo Seed Data
-- ==============================================================================

-- 1. SEED MASTER MEDICATIONS DIRECTORY
INSERT INTO public.medications (medicine_name, generic_name, active_ingredient, strength, dosage_form)
VALUES
('Metformin', 'Metformin Hydrochloride', 'Metformin', '500 mg', 'Tablet'),
('Glucophage', 'Metformin Hydrochloride', 'Metformin', '500 mg', 'Tablet'),
('Atorvastatin', 'Atorvastatin Calcium', 'Atorvastatin', '20 mg', 'Tablet'),
('Lipitor', 'Atorvastatin Calcium', 'Atorvastatin', '20 mg', 'Tablet'),
('Rosuvastatin', 'Rosuvastatin Calcium', 'Rosuvastatin', '10 mg', 'Tablet'),
('Crestor', 'Rosuvastatin Calcium', 'Rosuvastatin', '10 mg', 'Tablet'),
('Lisinopril', 'Lisinopril', 'Lisinopril', '10 mg', 'Tablet'),
('Zestril', 'Lisinopril', 'Lisinopril', '10 mg', 'Tablet'),
('Enalapril', 'Enalapril Maleate', 'Enalapril', '5 mg', 'Tablet'),
('Aspirin', 'Acetylsalicylic Acid', 'Aspirin', '81 mg', 'Enteric-Coated Tablet'),
('Amlodipine', 'Amlodipine Besylate', 'Amlodipine', '5 mg', 'Tablet'),
('Norvasc', 'Amlodipine Besylate', 'Amlodipine', '5 mg', 'Tablet'),
('Ibuprofen', 'Ibuprofen', 'Ibuprofen', '400 mg', 'Tablet'),
('Advil', 'Ibuprofen', 'Ibuprofen', '200 mg', 'Tablet'),
('Motrin', 'Ibuprofen', 'Ibuprofen', '400 mg', 'Tablet'),
('Naproxen', 'Naproxen Sodium', 'Naproxen', '500 mg', 'Tablet'),
('Aleve', 'Naproxen Sodium', 'Naproxen', '220 mg', 'Tablet'),
('Amoxicillin', 'Amoxicillin Trihydrate', 'Amoxicillin', '500 mg', 'Capsule'),
('Augmentin', 'Amoxicillin and Clavulanate Potassium', 'Amoxicillin', '625 mg', 'Tablet'),
('Clarithromycin', 'Clarithromycin', 'Clarithromycin', '500 mg', 'Tablet'),
('Biaxin', 'Clarithromycin', 'Clarithromycin', '500 mg', 'Tablet'),
('Warfarin', 'Warfarin Sodium', 'Warfarin', '5 mg', 'Tablet'),
('Coumadin', 'Warfarin Sodium', 'Warfarin', '5 mg', 'Tablet'),
('Vitamin D3', 'Cholecalciferol', 'Cholecalciferol', '2000 IU', 'Softgel'),
('Omeprazole', 'Omeprazole', 'Omeprazole', '20 mg', 'Delayed-Release Capsule');

-- 2. SEED VERIFIED DRUG INTERACTIONS
INSERT INTO public.drug_interactions (medicine_a, medicine_b, severity, description, source)
VALUES
('aspirin', 'ibuprofen', 'High', 
 'Ibuprofen competitively inhibits the irreversible antiplatelet action of cardioprotective low-dose aspirin and multiplies gastrointestinal bleeding risk.', 
 'FDA Safety Alert & Clinical Pharmacopeia'),

('aspirin', 'warfarin', 'High', 
 'Concurrent antiplatelet and anticoagulant therapy dramatically magnifies systemic hemorrhagic risk and severe GI bleeding.', 
 'American College of Cardiology Guidelines'),

('lisinopril', 'ibuprofen', 'Moderate', 
 'NSAIDs blunt the renal prostaglandin-mediated antihypertensive effect of ACE inhibitors and increase the risk of acute renal impairment and hyperkalemia.', 
 'Hypertension Clinical Practice Guidelines'),

('atorvastatin', 'clarithromycin', 'High', 
 'Clarithromycin is a potent CYP3A4 inhibitor that markedly increases systemic bioavailability of atorvastatin, dramatically elevating risk of severe myopathy and rhabdomyolysis.', 
 'Statin Safety Pharmacovigilance Advisory'),

('warfarin', 'amoxicillin', 'Moderate', 
 'Broad-spectrum penicillins may alter gut flora synthesizing vitamin K, potentiating anticoagulant response and increasing INR.', 
 'Clinical Hematology Safety Database'),

('lisinopril', 'potassium', 'Moderate', 
 'ACE inhibitors reduce aldosterone secretion, impairing potassium excretion. Concomitant potassium supplements risk hyperkalemia and cardiac dysrhythmias.', 
 'Renal Pharmacology Monograph');

-- 3. SEED MEDICATION DUPLICATES
INSERT INTO public.medication_duplicates (medicine_a, medicine_b, active_ingredient, description, source)
VALUES
('atorvastatin', 'lipitor', 'Atorvastatin Calcium', 
 'Both medications are identical statin therapies containing Atorvastatin. Concurrent administration causes overdose toxicity and heightened rhabdomyolysis risk.', 
 'Therapeutic Equivalence Monograph'),

('atorvastatin', 'rosuvastatin', 'HMG-CoA Reductase Inhibitor', 
 'Both medications are high-potency statins. Dual statin therapy offers no clinical benefit and drastically elevates liver enzyme toxicity and myopathy.', 
 'Cardiology Consensus Guidelines'),

('metformin', 'glucophage', 'Metformin Hydrochloride', 
 'Both medications share the identical active biguanide ingredient Metformin. Concurrent use leads to severe hypoglycemia and lactic acidosis risk.', 
 'Endocrine Society Clinical Practice Guidelines'),

('lisinopril', 'zestril', 'Lisinopril', 
 'Both brand and generic formulations contain Lisinopril. Double dosing risks acute symptomatic hypotension, syncope, and renal dysfunction.', 
 'FDA Orange Book Therapeutic Equivalence'),

('lisinopril', 'enalapril', 'ACE Inhibitor', 
 'Both medications are Angiotensin Converting Enzyme inhibitors. Dual ACE inhibition increases severe hypotension and hyperkalemia without added efficacy.', 
 'Cardiorenal Clinical Guidelines'),

('ibuprofen', 'advil', 'Ibuprofen', 
 'Both medications are identical NSAID analgesics. Duplicate administration increases gastrointestinal ulceration and renal toxicity.', 
 'OTC Safety Advisory Panel'),

('ibuprofen', 'motrin', 'Ibuprofen', 
 'Both brand and generic formulations contain Ibuprofen. Duplicate dosing leads to NSAID toxic accumulation.', 
 'OTC Safety Advisory Panel');

-- 4. DEMO PATIENT DATA SEEDING HELPER (For demo user Arun Kumar, 52)
-- In a live Supabase environment, run this after signing up or to populate Arun Kumar:
/*
-- Replace YOUR_USER_ID with your actual auth.users UUID:
DO $$
DECLARE
    demo_uid UUID := 'YOUR_USER_ID';
BEGIN
    -- Update Profile
    UPDATE public.profiles
    SET full_name = 'Arun Kumar',
        date_of_birth = '1974-04-12',
        gender = 'Male',
        phone = '+1 (555) 382-9014'
    WHERE id = demo_uid;

    -- Update Health
    UPDATE public.patient_health
    SET allergies = ARRAY['Penicillin'],
        conditions = ARRAY['Hypertension', 'Type 2 Diabetes Mellitus', 'Hyperlipidemia'],
        emergency_contact = '{"name":"Priya Kumar","relationship":"Spouse","phone":"+1 (555) 382-9015"}'::JSONB
    WHERE user_id = demo_uid;

    -- Add Active Medications
    INSERT INTO public.patient_medications (user_id, medicine_name, generic_name, dose, frequency, timing, start_date, status, prescribed_by, indication)
    VALUES
    (demo_uid, 'Metformin', 'Metformin Hydrochloride', '500 mg', '2 times / day', 'With meals', '2023-04-10', 'Active', 'Dr. Ramesh Mehta, MD', 'Type 2 Diabetes'),
    (demo_uid, 'Atorvastatin', 'Atorvastatin Calcium', '20 mg', 'Once daily', 'Bedtime', '2023-11-15', 'Active', 'Dr. K. Sharma, MD', 'Hyperlipidemia'),
    (demo_uid, 'Lisinopril', 'Lisinopril', '10 mg', 'Once daily', 'Morning', '2024-01-08', 'Active', 'Dr. K. Sharma, MD', 'Hypertension'),
    (demo_uid, 'Aspirin', 'Acetylsalicylic Acid (Enteric Coated)', '81 mg', 'Once daily', 'With lunch', '2023-11-15', 'Active', 'Dr. K. Sharma, MD', 'Cardiovascular Prophylaxis');

    -- Add Discontinued Medication
    INSERT INTO public.patient_medications (user_id, medicine_name, generic_name, dose, frequency, start_date, end_date, status, prescribed_by, indication, notes)
    VALUES
    (demo_uid, 'Amlodipine', 'Amlodipine Besylate', '5 mg', 'Once daily', '2023-01-12', '2024-01-05', 'Discontinued', 'Dr. Ramesh Mehta, MD', 'Hypertension', 'Discontinued due to mild peripheral ankle edema.');

    -- Add Initial Safety Alert
    INSERT INTO public.safety_alerts (user_id, alert_type, severity, medicine_a, medicine_b, description, status)
    VALUES
    (demo_uid, 'Drug Interaction', 'Moderate', 'Lisinopril', 'Potassium / NSAIDs', 
     'Concomitant use with potassium supplements or chronic NSAIDs may elevate serum potassium or impair renal clearance.', 'Unreviewed');

    -- Add Initial History Timeline
    INSERT INTO public.medication_history (user_id, action_type, title, description)
    VALUES
    (demo_uid, 'scan', 'Profile Safety Audit Completed', 'Automated safety scan verified 4 active medications against Penicillin allergy.'),
    (demo_uid, 'prescription', 'Prescription RX-78921-CARD Processed', 'Cardiology follow-up records validated from Metro Heart Institute.'),
    (demo_uid, 'discontinued', 'Amlodipine 5mg Discontinued', 'Physician authorized discontinuation due to minor ankle edema. Switched to Lisinopril.'),
    (demo_uid, 'added', 'Lisinopril 10mg Initiated', 'Prescribed by Dr. K. Sharma for optimized blood pressure regulation.');
END $$;
*/
