import { sendEmail } from './email'

//==============================================
// Types for appointment email variables
//==============================================

export interface AppointmentEmailData {
  patient: { email: string; name: string }
  doctor: { email: string; name: string }
  appointment: {
    date: string
    time: string
    doctorName: string
    clinicAddress?: string
    consultationType?: string
    declineReason?: string
    oldDate?: string
    oldTime?: string
    rescheduleReason?: string
    rescheduledBy?: string
    cancelledBy?: string
    cancellationReason?: string
  }
}

//==============================================
// Formatting & Variable Helpers
//==============================================

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://med-book-app.vercel.app'

function formatDoctorName(name: string): string {
  const clean = (name || 'Doctor').trim()
  if (clean.toLowerCase().startsWith('dr.') || clean.toLowerCase().startsWith('dr ')) {
    return clean
  }
  return `Dr. ${clean}`
}

function formatPatientName(name: string): string {
  const clean = (name || 'Patient').trim()
  return clean || 'Patient'
}

function getPatientVars(data: AppointmentEmailData): Record<string, string> {
  const { patient, doctor, appointment } = data
  const patientName = formatPatientName(patient.name)
  const doctorDisplayName = formatDoctorName(doctor.name || appointment.doctorName)

  return {
    patient_name: patientName,
    doctor_name: doctorDisplayName,
    doctor_display_name: doctorDisplayName,
    appointment_date: appointment.date,
    appointment_time: appointment.time,
    clinic_address: appointment.clinicAddress || 'MedBook Medical Center',
    consultation_type: appointment.consultationType || 'Video Consultation',
    recipient_name: patientName,
    dashboard_url: `${appUrl}/patient`,
    browse_doctors_url: `${appUrl}/doctors`,
    current_year: new Date().getFullYear().toString(),
  }
}

function getDoctorVars(data: AppointmentEmailData): Record<string, string> {
  const { patient, doctor, appointment } = data
  const patientName = formatPatientName(patient.name)
  const doctorDisplayName = formatDoctorName(doctor.name || appointment.doctorName)

  return {
    patient_name: patientName,
    doctor_name: doctorDisplayName,
    doctor_display_name: doctorDisplayName,
    appointment_date: appointment.date,
    appointment_time: appointment.time,
    clinic_address: appointment.clinicAddress || 'MedBook Medical Center',
    consultation_type: appointment.consultationType || 'Video Consultation',
    recipient_name: doctorDisplayName,
    dashboard_url: `${appUrl}/doctor`,
    browse_doctors_url: `${appUrl}/doctors`,
    current_year: new Date().getFullYear().toString(),
  }
}

// ============================================================
// 1. Patient Books a New Appointment
// -> Confirmation to Patient, Notification to Doctor
// ============================================================

export async function sendAppointmentBooked(data: AppointmentEmailData): Promise<void> {
  const doctorDisplayName = formatDoctorName(data.doctor.name || data.appointment.doctorName)
  const patientName = formatPatientName(data.patient.name)

  await Promise.all([
    // Patient Confirmation
    sendEmail({
      to: data.patient.email,
      subject: `[MedBook] Appointment Request Submitted — ${doctorDisplayName}`,
      templateName: 'booked',
      variables: getPatientVars(data),
    }),
    // Doctor Notification
    sendEmail({
      to: data.doctor.email,
      subject: `[MedBook] New Appointment Request from ${patientName} (Action Required)`,
      templateName: 'doctor_new_request',
      variables: getDoctorVars(data),
    }),
  ])
}

// ============================================================
// 2. Doctor Confirms an Appointment
// -> Notification to Patient
// ============================================================

export async function sendAppointmentConfirmed(data: AppointmentEmailData): Promise<void> {
  const doctorDisplayName = formatDoctorName(data.doctor.name || data.appointment.doctorName)

  await sendEmail({
    to: data.patient.email,
    subject: `[MedBook] Confirmed: Appointment with ${doctorDisplayName}`,
    templateName: 'confirmed',
    variables: getPatientVars(data),
  })
}

// ============================================================
// 3. Doctor Declines an Appointment
// -> Notification to Patient with Reason
// ============================================================

export async function sendAppointmentDeclined(data: AppointmentEmailData): Promise<void> {
  const doctorDisplayName = formatDoctorName(data.doctor.name || data.appointment.doctorName)

  await sendEmail({
    to: data.patient.email,
    subject: `[MedBook] Appointment Request Declined — ${doctorDisplayName}`,
    templateName: 'declined',
    variables: {
      ...getPatientVars(data),
      decline_reason: data.appointment.declineReason || 'Doctor is unavailable at this scheduled time.',
    },
  })
}

// ============================================================
// 4. Patient / Doctor Cancels an Appointment
// -> Distinct Cancellation notice to Patient and to Doctor
// ============================================================

export async function sendAppointmentCancelled(data: AppointmentEmailData): Promise<void> {
  const cancelledBy = data.appointment.cancelledBy || 'Patient'
  const reason = data.appointment.cancellationReason || 'No reason provided'
  const doctorDisplayName = formatDoctorName(data.doctor.name || data.appointment.doctorName)
  const patientName = formatPatientName(data.patient.name)

  await Promise.all([
    // Patient Notice
    sendEmail({
      to: data.patient.email,
      subject: `[MedBook] Appointment Cancelled — ${doctorDisplayName}`,
      templateName: 'cancelled_patient',
      variables: {
        ...getPatientVars(data),
        cancelled_by: cancelledBy,
        cancellation_reason: reason,
      },
    }),
    // Doctor Notice
    sendEmail({
      to: data.doctor.email,
      subject: `[MedBook] Appointment Cancelled by ${cancelledBy} — ${patientName}`,
      templateName: 'cancelled_doctor',
      variables: {
        ...getDoctorVars(data),
        cancelled_by: cancelledBy,
        cancellation_reason: reason,
      },
    }),
  ])
}

// ============================================================
// 5. Patient / Doctor Reschedules an Appointment
// -> Distinct Updated Details to Both Parties
// ============================================================

export async function sendAppointmentRescheduled(data: AppointmentEmailData): Promise<void> {
  const rescheduledBy = data.appointment.rescheduledBy || 'Patient'
  const reason = data.appointment.rescheduleReason || 'Schedule adjustment'
  const oldDate = data.appointment.oldDate || 'Original date'
  const oldTime = data.appointment.oldTime || 'Original time'
  const doctorDisplayName = formatDoctorName(data.doctor.name || data.appointment.doctorName)
  const patientName = formatPatientName(data.patient.name)

  const baseVars = {
    new_appointment_date: data.appointment.date,
    new_appointment_time: data.appointment.time,
    previous_appointment_date: oldDate,
    previous_appointment_time: oldTime,
    rescheduled_by: rescheduledBy,
    reschedule_reason: reason,
  }

  await Promise.all([
    // Patient Email
    sendEmail({
      to: data.patient.email,
      subject: `[MedBook] Appointment Rescheduled — ${doctorDisplayName}`,
      templateName: 'rescheduled_patient',
      variables: {
        ...getPatientVars(data),
        ...baseVars,
      },
    }),
    // Doctor Email
    sendEmail({
      to: data.doctor.email,
      subject: `[MedBook] Appointment Rescheduled by ${rescheduledBy} — ${patientName}`,
      templateName: 'rescheduled_doctor',
      variables: {
        ...getDoctorVars(data),
        ...baseVars,
      },
    }),
  ])
}

// ============================================================
// 6. Automated Visit Reminder (1 Hour Before)
// -> Distinct Reminders for Patient and Doctor
// ============================================================

export async function sendAppointmentReminder(data: AppointmentEmailData): Promise<void> {
  const doctorDisplayName = formatDoctorName(data.doctor.name || data.appointment.doctorName)
  const patientName = formatPatientName(data.patient.name)

  await Promise.all([
    // Patient Reminder
    sendEmail({
      to: data.patient.email,
      subject: `[MedBook] Reminder: Appointment in 1 hour with ${doctorDisplayName}`,
      templateName: 'reminder_patient',
      variables: getPatientVars(data),
    }),
    // Doctor Reminder
    sendEmail({
      to: data.doctor.email,
      subject: `[MedBook] Reminder: Consultation in 1 hour with ${patientName}`,
      templateName: 'reminder_doctor',
      variables: getDoctorVars(data),
    }),
  ])
}