import { jsPDF } from 'jspdf';
import { SharedPatientViewData } from '../types';

export const generatePatientHistoryPDF = (data: SharedPatientViewData, token: string): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawHeaderWatermark();
    }
  };

  const drawHeaderWatermark = () => {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('MedGap Clinical Safety Portal — Confidential Medical Record', margin, y);
    doc.text(`Token: ${token}`, pageWidth - margin, y, { align: 'right' });
    y += 6;
  };

  // 1. Top Banner / Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('MedGap Clinical Health Record', margin + 6, y + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(186, 230, 253); // sky-200
  doc.text('Authorized Read-Only Clinician Medical Summary', margin + 6, y + 17);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, pageWidth - margin - 6, y + 10, { align: 'right' });
  doc.text(`Session Token: ${token}`, pageWidth - margin - 6, y + 17, { align: 'right' });

  y += 30;

  // 2. Clinical Advisory Notice
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14); // amber-800
  doc.text('CLINICAL DECISION ADVISORY:', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 53, 15);
  const disclaimerText = data.disclaimer || 'Read-only view — Medication decisions remain with qualified healthcare professionals.';
  doc.text(disclaimerText, margin + 4, y + 10);

  y += 18;

  // 3. Patient Demographics
  const patient = data.patient;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Patient Profile & Demographics', margin, y);
  y += 5;

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Full Name', margin + 4, y + 6);
  doc.text('Age / Gender', margin + 60, y + 6);
  doc.text('Contact / Email', margin + 115, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(patient?.full_name || 'No records available', margin + 4, y + 12);
  doc.text(patient ? `${patient.age ? `${patient.age} yrs` : 'N/A'} • ${patient.gender || 'N/A'}` : 'No records available', margin + 60, y + 12);
  doc.text(patient?.email || patient?.phone || 'No records available', margin + 115, y + 12);

  y += 24;

  // 4. Recorded Allergies & Existing Conditions
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Allergies & Medical Conditions', margin, y);
  y += 5;

  const colWidth = (contentWidth - 4) / 2;

  // Allergies Box
  const allergies = data.allergies || [];
  doc.setFillColor(255, 241, 242); // rose-50
  doc.setDrawColor(254, 205, 211); // rose-200
  doc.roundedRect(margin, y, colWidth, 18, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(190, 18, 60); // rose-700
  doc.text('RECORDED ALLERGIES', margin + 4, y + 6);
  doc.setFontSize(8.5);
  doc.setTextColor(159, 18, 57);
  doc.text(allergies.length > 0 ? allergies.join(', ') : 'No records available.', margin + 4, y + 12);

  // Conditions Box
  const conditions = data.conditions || [];
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin + colWidth + 4, y, colWidth, 18, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('EXISTING MEDICAL CONDITIONS', margin + colWidth + 8, y + 6);
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(conditions.length > 0 ? conditions.join(', ') : 'No records available.', margin + colWidth + 8, y + 12);

  y += 24;

  // 2B. Adverse Drug Reactions & Side Effects
  const adrs = data.adverse_reactions || [];
  if (adrs.length > 0) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`Recorded Adverse Drug Reactions & Side Effects (${adrs.length})`, margin, y);
    y += 5;

    adrs.forEach((adr) => {
      checkPageBreak(14);
      doc.setFillColor(254, 243, 199); // amber-100
      doc.setDrawColor(245, 158, 11); // amber-500
      doc.roundedRect(margin, y, contentWidth, 11, 1.5, 1.5, 'FD');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(146, 64, 14);
      doc.text(`${adr.medicine_name} — [${adr.severity} Severity]`, margin + 3, y + 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Reaction: ${adr.reaction} (${adr.date_recorded}) ${adr.notes ? `• ${adr.notes}` : ''}`, margin + 3, y + 8);
      y += 14;
    });
    y += 3;
  }

  // 3. Current Active Medicines
  const medicines = data.current_medicines || [];
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`3. Current Active Medicines (${medicines.length})`, margin, y);
  y += 5;

  if (medicines.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('No records available.', margin + 6, y + 8);
    y += 18;
  } else {
    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Medication & Generic Name', margin + 3, y + 5);
    doc.text('Dosage / Frequency', margin + 70, y + 5);
    doc.text('Prescribed By', margin + 120, y + 5);
    doc.text('Start Date', margin + 155, y + 5);
    y += 8;

    medicines.forEach((med) => {
      checkPageBreak(12);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(med.name, margin + 3, y + 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      if (med.generic_name) {
        doc.text(`(${med.generic_name})`, margin + 3, y + 8);
      }

      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(`${med.strength || med.dosage || ''} • ${med.frequency}`, margin + 70, y + 5);
      doc.text(med.prescribed_by || 'Verified Practitioner', margin + 120, y + 5);
      doc.text(med.start_date || 'Ongoing', margin + 155, y + 5);

      y += 11;
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y - 1, margin + contentWidth, y - 1);
    });
    y += 5;
  }

  // 4. Prescriptions
  const prescriptions = data.prescriptions || [];
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`4. Prescription Records (${prescriptions.length})`, margin, y);
  y += 5;

  if (prescriptions.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('No records available.', margin + 6, y + 8);
    y += 18;
  } else {
    prescriptions.forEach((rx) => {
      checkPageBreak(22);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'FD');

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${rx.doctor_name || 'Attending Physician'} — ${rx.hospital_name || 'Clinic'}`, margin + 4, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Date: ${rx.prescription_date} • Specialty: ${rx.specialty || 'General Practice'} ${rx.prescription_number ? `• Rx #: ${rx.prescription_number}` : ''}`, margin + 4, y + 10);

      const rxMeds = (rx.medicines || []).map((m: any) => `${m.name} (${m.dosage || m.frequency || ''})`).join(', ');
      doc.setTextColor(51, 65, 85);
      doc.text(`Medicines: ${rxMeds || 'None listed'}`, margin + 4, y + 14);

      y += 19;
    });
    y += 4;
  }

  // 5. Diagnostic & Lab Reports Locker
  const reports = data.medical_reports || [];
  if (reports.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`5. Diagnostic & Lab Reports Locker (${reports.length})`, margin, y);
    y += 5;

    reports.forEach((rep) => {
      checkPageBreak(18);
      doc.setFillColor(240, 253, 250); // teal-50
      doc.setDrawColor(204, 251, 241); // teal-100
      doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${rep.title} [${rep.report_type}]`, margin + 4, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Facility / Doctor: ${rep.facility_or_doctor} • Date: ${rep.date}`, margin + 4, y + 9);
      doc.setTextColor(51, 65, 85);
      doc.text(`Findings: ${rep.summary_or_findings}`, margin + 4, y + 13);

      y += 17;
    });
    y += 3;
  }

  // 6. Doctor Consultations & Visits
  const visits = data.doctor_visits || [];
  if (visits.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`6. Doctor Consultations & Visits (${visits.length})`, margin, y);
    y += 5;

    visits.forEach((v) => {
      checkPageBreak(16);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${v.doctor_name} (${v.specialty}) — ${v.clinic_or_hospital}`, margin + 4, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Date: ${v.visit_date} • Reason: ${v.reason_for_visit}`, margin + 4, y + 9);
      doc.setTextColor(51, 65, 85);
      doc.text(`Assessment: ${v.diagnosis_notes || 'Consultation documented'}${v.follow_up_date ? ` (Follow-up: ${v.follow_up_date})` : ''}`, margin + 4, y + 13);

      y += 17;
    });
    y += 3;
  }

  // 7. Medication History / Audit Log
  const history = data.medication_history || [];
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`7. Medication History & Audit Trail (${history.length})`, margin, y);
  y += 5;

  if (history.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('No records available.', margin + 6, y + 8);
    y += 18;
  } else {
    history.slice(0, 10).forEach((item) => {
      checkPageBreak(12);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`• ${item.title}`, margin + 4, y + 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      const dateStr = typeof item.created_at === 'string' ? item.created_at.split('T')[0] : 'Recorded';
      doc.text(dateStr, margin + 140, y + 4, { align: 'left' });

      doc.setTextColor(71, 85, 105);
      doc.text(item.description || '', margin + 8, y + 8);

      y += 11;
    });
  }

  // Page Footer Watermark on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `MedGap Cryptographic Health Pass • Page ${i} of ${totalPages} • Session Token: ${token}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  const cleanName = (patient?.full_name || 'Patient').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${cleanName}_MedGap_Clinical_History.pdf`);
};
