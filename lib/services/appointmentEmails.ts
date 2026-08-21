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
// Variable Helpers
//==============================================

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://med-book-app.vercel.app'

function getPatientVars(data: AppointmentEmailData): Record<string, string> {
  const { patient, doctor, appointment } = data
  return {
    patient_name: patient.name,
    doctor_name: doctor.name,
    appointment_date: appointment.date,
    appointment_time: appointment.time,
    clinic_address: appointment.clinicAddress || 'MedBook Medical Center',
    consultation_type: appointment.consultationType || 'Video Consultation',
    recipient_name: patient.name,
    dashboard_url: `${appUrl}/patient`,
    browse_doctors_url: `${appUrl}/doctors`,
    current_year: new Date().getFullYear().toString(),
  }
}

function getDoctorVars(data: AppointmentEmailData): Record<string, string> {
  const { patient, doctor, appointment } = data
  return {
    patient_name: patient.name,
    doctor_name: doctor.name,
    appointment_date: appointment.date,
    appointment_time: appointment.time,
    clinic_address: appointment.clinicAddress || 'MedBook Medical Center',
    consultation_type: appointment.consultationType || 'Video Consultation',
    recipient_name: `Dr. ${doctor.name}`,
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
  await Promise.all([
    // Patient Confirmation
    sendEmail({
      to: data.patient.email,
      subject: `[MedBook] Appointment Request Submitted — Dr. ${data.appointment.doctorName}`,
      templateName: 'booked',
      variables: getPatientVars(data),
    }),
    // Doctor Notification (with dedicated doctor action card)
    sendEmail({
      to: data.doctor.email,
      subject: `[MedBook] New Appointment Request from ${data.patient.name} (Action Required)`,
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
  await sendEmail({
    to: data.patient.email,
    subject: `[MedBook] Confirmed: Appointment with Dr. ${data.appointment.doctorName}`,
    templateName: 'confirmed',
    variables: getPatientVars(data),
  })
}

// ============================================================
// 3. Doctor Declines an Appointment
// -> Notification to Patient with Optional Reason
// ============================================================

export async function sendAppointmentDeclined(data: AppointmentEmailData): Promise<void> {
  await sendEmail({
    to: data.patient.email,
    subject: `[MedBook] Appointment Request Declined — Dr. ${data.appointment.doctorName}`,
    templateName: 'declined',
    variables: {
      ...getPatientVars(data),
      decline_reason: data.appointment.declineReason || 'Doctor is unavailable at this scheduled time.',
    },
  })
}

// ============================================================
// 4. Patient / Doctor Cancels an Appointment
// -> Cancellation notice to Patient, Notification to Doctor
// ============================================================

export async function sendAppointmentCancelled(data: AppointmentEmailData): Promise<void> {
  const cancelledBy = data.appointment.cancelledBy || 'Patient'
  const reason = data.appointment.cancellationReason || 'No reason provided'

  await Promise.all([
    // Patient Notice
    sendEmail({
      to: data.patient.email,
      subject: `[MedBook] Appointment Cancelled — Dr. ${data.appointment.doctorName}`,
      templateName: 'cancelled',
      variables: {
        ...getPatientVars(data),
        recipient_name: data.patient.name,
        cancelled_by: cancelledBy,
        cancellation_reason: reason,
      },
    }),
    // Doctor Notice
    sendEmail({
      to: data.doctor.email,
      subject: `[MedBook] Appointment Cancelled by ${cancelledBy} — ${data.patient.name}`,
      templateName: 'cancelled',
      variables: {
        ...getDoctorVars(data),
        recipient_name: `Dr. ${data.doctor.name}`,
        cancelled_by: cancelledBy,
        cancellation_reason: reason,
      },
    }),
  ])
}

// ============================================================
// 5. Patient / Doctor Reschedules an Appointment
// -> Updated Details to Both Parties
// ============================================================

export async function sendAppointmentRescheduled(data: AppointmentEmailData): Promise<void> {
  const rescheduledBy = data.appointment.rescheduledBy || 'Patient'
  const reason = data.appointment.rescheduleReason || 'Schedule adjustment'
  const oldDate = data.appointment.oldDate || 'Original date'
  const oldTime = data.appointment.oldTime || 'Original time'

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
      subject: `[MedBook] Appointment Rescheduled — Dr. ${data.appointment.doctorName}`,
      templateName: 'rescheduled',
      variables: {
        ...getPatientVars(data),
        ...baseVars,
        recipient_name: data.patient.name,
      },
    }),
    // Doctor Email
    sendEmail({
      to: data.doctor.email,
      subject: `[MedBook] Appointment Rescheduled by ${rescheduledBy} — ${data.patient.name}`,
      templateName: 'rescheduled',
      variables: {
        ...getDoctorVars(data),
        ...baseVars,
        recipient_name: `Dr. ${data.doctor.name}`,
      },
    }),
  ])
}

// ============================================================
// 6. Automated Visit Reminder (1 Hour Before)
// ============================================================

export async function sendAppointmentReminder(data: AppointmentEmailData): Promise<void> {
  await Promise.all([
    sendEmail({
      to: data.patient.email,
      subject: `[MedBook] Reminder: Appointment in 1 hour with Dr. ${data.appointment.doctorName}`,
      templateName: 'reminder',
      variables: {
        ...getPatientVars(data),
        recipient_name: data.patient.name,
      },
    }),
    sendEmail({
      to: data.doctor.email,
      subject: `[MedBook] Reminder: Upcoming Appointment in 1 hour with ${data.patient.name}`,
      templateName: 'reminder',
      variables: {
        ...getDoctorVars(data),
        recipient_name: `Dr. ${data.doctor.name}`,
      },
    }),
  ])
}