// TypeScript embedded email templates — 100% reliable on Vercel Serverless (no filesystem dependency)

export const EMAIL_TEMPLATES: Record<string, string> = {
    // 1. APPOINTMENT BOOKED (Patient Confirmation)
    booked: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Appointment Request Submitted</title>
</head>
<body style="margin:0; padding:0; background:#f5f9fc; font-family:Arial, Helvetica, sans-serif; color:#172b4d;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f9fc; padding:40px 16px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0"
                    style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="padding:28px 32px; background:linear-gradient(135deg,#2563eb,#0ea5a4);">
                            <h1 style="margin:0; color:#ffffff; font-size:26px;">MedBook</h1>
                            <p style="margin:6px 0 0; color:#eaf4ff; font-size:14px;">Healthcare appointments made simple</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 32px;">
                            <h2 style="margin:0 0 12px; font-size:22px; color:#172b4d;">Appointment Request Submitted</h2>
                            <p style="margin:0 0 20px; color:#526581; font-size:15px; line-height:1.6;">Hi {{patient_name}},</p>
                            <p style="margin:0 0 24px; color:#526581; font-size:15px; line-height:1.6;">
                                Your appointment request with <strong>{{doctor_display_name}}</strong> has been successfully submitted. It is currently awaiting confirmation from the doctor.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
                                <tr>
                                    <td style="padding:22px;">
                                        <p style="margin:0 0 8px; font-size:12px; color:#64748b; text-transform:uppercase; font-weight:bold;">CONSULTATION DETAILS</p>
                                        <p style="margin:0 0 18px; font-size:18px; font-weight:bold; color:#172b4d;">{{doctor_display_name}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Date:</strong> {{appointment_date}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Time:</strong> {{appointment_time}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Type:</strong> {{consultation_type}}</p>
                                        <p style="margin:0; font-size:14px; color:#526581;"><strong>Status:</strong> <span style="display:inline-block; padding:3px 10px; background:#fef3c7; color:#b45309; border-radius:999px; font-size:12px; font-weight:bold;">Pending Confirmation</span></p>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:24px 0 0; color:#526581; font-size:14px; line-height:1.6;">
                                You will receive another notification as soon as {{doctor_display_name}} confirms your visit.
                            </p>
                            <table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                                <tr>
                                    <td align="center" style="background:#2563eb; border-radius:8px;">
                                        <a href="{{dashboard_url}}" style="display:inline-block; padding:12px 24px; color:#ffffff; text-decoration:none; font-size:14px; font-weight:bold;">View in Patient Portal</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px 32px; background:#f8fafc; text-align:center; border-top:1px solid #edf2f7;">
                            <p style="margin:0 0 8px; font-size:13px; color:#64748b;">© {{current_year}} MedBook Healthcare System</p>
                            <p style="margin:0; font-size:12px; color:#94a3b8;">This is an automated message. Please do not reply directly to this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,

    // 2. DOCTOR NEW REQUEST (Doctor Notification)
    doctor_new_request: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Appointment Request - MedBook</title>
</head>
<body style="margin:0; padding:0; background:#f5f9fc; font-family:Arial, Helvetica, sans-serif; color:#172b4d;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f9fc; padding:40px 16px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0"
                    style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="padding:28px 32px; background:linear-gradient(135deg,#2563eb,#0ea5a4);">
                            <h1 style="margin:0; color:#ffffff; font-size:26px; font-weight:bold;">MedBook</h1>
                            <p style="margin:6px 0 0; color:#eaf4ff; font-size:14px;">Healthcare appointments made simple</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 32px;">
                            <h2 style="margin:0 0 12px; font-size:22px; color:#172b4d;">New Appointment Request</h2>
                            <p style="margin:0 0 20px; color:#526581; font-size:15px; line-height:1.6;">Hi {{doctor_display_name}},</p>
                            <p style="margin:0 0 24px; color:#526581; font-size:15px; line-height:1.6;">
                                You have received a new consultation request from patient <strong>{{patient_name}}</strong>. Please review the appointment details below and confirm or decline from your dashboard.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
                                <tr>
                                    <td style="padding:22px;">
                                        <p style="margin:0 0 8px; font-size:12px; color:#64748b; text-transform:uppercase; font-weight:bold;">PATIENT DETAILS</p>
                                        <p style="margin:0 0 18px; font-size:18px; font-weight:bold; color:#172b4d;">{{patient_name}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Date:</strong> {{appointment_date}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Time:</strong> {{appointment_time}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Type:</strong> {{consultation_type}}</p>
                                        <p style="margin:0; font-size:14px; color:#526581;"><strong>Status:</strong> <span style="display:inline-block; padding:3px 10px; background:#fef3c7; color:#b45309; border-radius:999px; font-size:12px; font-weight:bold;">Action Required</span></p>
                                    </td>
                                </tr>
                            </table>
                            <table cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
                                <tr>
                                    <td align="center" style="background:#2563eb; border-radius:8px;">
                                        <a href="{{dashboard_url}}" style="display:inline-block; padding:12px 24px; color:#ffffff; text-decoration:none; font-size:14px; font-weight:bold;">Review Request in Dashboard</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px 32px; background:#f8fafc; text-align:center; border-top:1px solid #edf2f7;">
                            <p style="margin:0 0 8px; font-size:13px; color:#64748b;">© {{current_year}} MedBook Healthcare System</p>
                            <p style="margin:0; font-size:12px; color:#94a3b8;">This is an automated message. Please do not reply directly to this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,

    // 3. APPOINTMENT CONFIRMED (Patient Notification)
    confirmed: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Appointment Confirmed</title>
</head>
<body style="margin:0; padding:0; background:#f5f9fc; font-family:Arial, Helvetica, sans-serif; color:#172b4d;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f9fc; padding:40px 16px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0"
                    style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="padding:28px 32px; background:linear-gradient(135deg,#2563eb,#0ea5a4);">
                            <h1 style="margin:0; color:#ffffff; font-size:26px;">MedBook</h1>
                            <p style="margin:6px 0 0; color:#eaf4ff; font-size:14px;">Healthcare appointments made simple</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 32px;">
                            <h2 style="margin:0 0 12px; font-size:22px; color:#172b4d;">Your appointment is confirmed!</h2>
                            <p style="margin:0 0 20px; color:#526581; font-size:15px; line-height:1.6;">Hi {{patient_name}},</p>
                            <p style="margin:0 0 24px; color:#526581; font-size:15px; line-height:1.6;">
                                Great news! <strong>{{doctor_display_name}}</strong> has confirmed your appointment. Your visit is scheduled.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
                                <tr>
                                    <td style="padding:22px;">
                                        <p style="margin:0 0 8px; font-size:12px; color:#64748b; text-transform:uppercase; font-weight:bold;">CONSULTATION DETAILS</p>
                                        <p style="margin:0 0 18px; font-size:18px; font-weight:bold; color:#172b4d;">{{doctor_display_name}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Date:</strong> {{appointment_date}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Time:</strong> {{appointment_time}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Type:</strong> {{consultation_type}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Location:</strong> {{clinic_address}}</p>
                                        <p style="margin:0; font-size:14px; color:#526581;"><strong>Status:</strong> <span style="display:inline-block; padding:4px 10px; background:#dcfce7; color:#15803d; border-radius:999px; font-size:12px; font-weight:bold;">CONFIRMED</span></p>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:24px 0 0; color:#526581; font-size:14px; line-height:1.6;">
                                Please be ready a few minutes before your scheduled appointment time.
                            </p>
                            <table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                                <tr>
                                    <td align="center" style="background:#2563eb; border-radius:8px;">
                                        <a href="{{dashboard_url}}" style="display:inline-block; padding:12px 22px; color:#ffffff; text-decoration:none; font-size:14px; font-weight:bold;">View My Appointment</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px 32px; background:#f8fafc; text-align:center; border-top:1px solid #edf2f7;">
                            <p style="margin:0 0 8px; font-size:13px; color:#64748b;">© {{current_year}} MedBook Healthcare System</p>
                            <p style="margin:0; font-size:12px; color:#94a3b8;">This is an automated message. Please do not reply directly to this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,

    // 4. APPOINTMENT REMINDER FOR PATIENT
    reminder_patient: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Appointment Reminder</title>
</head>
<body style="margin:0; padding:0; background:#f5f9fc; font-family:Arial, Helvetica, sans-serif; color:#172b4d;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f9fc; padding:40px 16px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="padding:28px 32px; background:linear-gradient(135deg,#2563eb,#0ea5a4);">
                            <h1 style="margin:0; color:#ffffff; font-size:26px;">MedBook</h1>
                            <p style="margin:6px 0 0; color:#eaf4ff; font-size:14px;">Healthcare appointments made simple</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 32px;">
                            <h2 style="margin:0 0 12px; font-size:22px; color:#172b4d;">Your appointment is coming up soon</h2>
                            <p style="margin:0 0 20px; color:#526581; font-size:15px; line-height:1.6;">Hi {{patient_name}},</p>
                            <p style="margin:0 0 24px; color:#526581; font-size:15px; line-height:1.6;">
                                This is a friendly reminder that your appointment with <strong>{{doctor_display_name}}</strong> is scheduled to begin in approximately one hour.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
                                <tr>
                                    <td style="padding:22px;">
                                        <p style="margin:0 0 8px; font-size:12px; color:#64748b; text-transform:uppercase; font-weight:bold;">UPCOMING APPOINTMENT</p>
                                        <p style="margin:0 0 18px; font-size:18px; font-weight:bold; color:#172b4d;">{{doctor_display_name}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Date:</strong> {{appointment_date}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Time:</strong> {{appointment_time}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Type:</strong> {{consultation_type}}</p>
                                        <p style="margin:0; font-size:14px; color:#526581;"><strong>Location:</strong> {{clinic_address}}</p>
                                    </td>
                                </tr>
                            </table>
                            <table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                                <tr>
                                    <td align="center" style="background:#2563eb; border-radius:8px;">
                                        <a href="{{dashboard_url}}" style="display:inline-block; padding:12px 22px; color:#ffffff; text-decoration:none; font-size:14px; font-weight:bold;">Open Patient Dashboard</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px 32px; background:#f8fafc; text-align:center; border-top:1px solid #edf2f7;">
                            <p style="margin:0 0 8px; font-size:13px; color:#64748b;">© {{current_year}} MedBook Healthcare System</p>
                            <p style="margin:0; font-size:12px; color:#94a3b8;">This is an automated message. Please do not reply directly to this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,

    // 5. APPOINTMENT REMINDER FOR DOCTOR
    reminder_doctor: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Upcoming Consultation Reminder</title>
</head>
<body style="margin:0; padding:0; background:#f5f9fc; font-family:Arial, Helvetica, sans-serif; color:#172b4d;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f9fc; padding:40px 16px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="padding:28px 32px; background:linear-gradient(135deg,#2563eb,#0ea5a4);">
                            <h1 style="margin:0; color:#ffffff; font-size:26px;">MedBook</h1>
                            <p style="margin:6px 0 0; color:#eaf4ff; font-size:14px;">Healthcare appointments made simple</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 32px;">
                            <h2 style="margin:0 0 12px; font-size:22px; color:#172b4d;">Upcoming Consultation in 1 Hour</h2>
                            <p style="margin:0 0 20px; color:#526581; font-size:15px; line-height:1.6;">Hi {{doctor_display_name}},</p>
                            <p style="margin:0 0 24px; color:#526581; font-size:15px; line-height:1.6;">
                                This is a friendly reminder that your upcoming consultation with patient <strong>{{patient_name}}</strong> is scheduled to begin in approximately one hour.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
                                <tr>
                                    <td style="padding:22px;">
                                        <p style="margin:0 0 8px; font-size:12px; color:#64748b; text-transform:uppercase; font-weight:bold;">SCHEDULED PATIENT</p>
                                        <p style="margin:0 0 18px; font-size:18px; font-weight:bold; color:#172b4d;">{{patient_name}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Date:</strong> {{appointment_date}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Time:</strong> {{appointment_time}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Type:</strong> {{consultation_type}}</p>
                                        <p style="margin:0; font-size:14px; color:#526581;"><strong>Location:</strong> {{clinic_address}}</p>
                                    </td>
                                </tr>
                            </table>
                            <table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                                <tr>
                                    <td align="center" style="background:#2563eb; border-radius:8px;">
                                        <a href="{{dashboard_url}}" style="display:inline-block; padding:12px 22px; color:#ffffff; text-decoration:none; font-size:14px; font-weight:bold;">Open Doctor Dashboard</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px 32px; background:#f8fafc; text-align:center; border-top:1px solid #edf2f7;">
                            <p style="margin:0 0 8px; font-size:13px; color:#64748b;">© {{current_year}} MedBook Healthcare System</p>
                            <p style="margin:0; font-size:12px; color:#94a3b8;">This is an automated message. Please do not reply directly to this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,

    // 6. APPOINTMENT CANCELLED (Patient Version)
    cancelled_patient: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Appointment Cancelled</title>
</head>
<body style="margin:0; padding:0; background:#f5f9fc; font-family:Arial, Helvetica, sans-serif; color:#172b4d;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f9fc; padding:40px 16px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="padding:28px 32px; background:linear-gradient(135deg,#2563eb,#0ea5a4);">
                            <h1 style="margin:0; color:#ffffff; font-size:26px;">MedBook</h1>
                            <p style="margin:6px 0 0; color:#eaf4ff; font-size:14px;">Healthcare appointments made simple</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 32px;">
                            <h2 style="margin:0 0 12px; font-size:22px; color:#172b4d;">Appointment Cancelled</h2>
                            <p style="margin:0 0 20px; color:#526581; font-size:15px; line-height:1.6;">Hi {{patient_name}},</p>
                            <p style="margin:0 0 24px; color:#526581; font-size:15px; line-height:1.6;">
                                Your appointment with <strong>{{doctor_display_name}}</strong> has been cancelled.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
                                <tr>
                                    <td style="padding:22px;">
                                        <p style="margin:0 0 8px; font-size:12px; color:#64748b; text-transform:uppercase; font-weight:bold;">CANCELLED VISIT</p>
                                        <p style="margin:0 0 18px; font-size:18px; font-weight:bold; color:#172b4d;">{{doctor_display_name}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Date:</strong> {{appointment_date}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Time:</strong> {{appointment_time}}</p>
                                        <p style="margin:0; font-size:14px; color:#526581;"><strong>Status:</strong> <span style="display:inline-block; padding:4px 10px; background:#fee2e2; color:#b91c1c; border-radius:999px; font-size:12px; font-weight:bold;">CANCELLED</span></p>
                                    </td>
                                </tr>
                            </table>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px; background:#fff7ed; border:1px solid #fed7aa; border-radius:12px;">
                                <tr>
                                    <td style="padding:18px 20px;">
                                        <p style="margin:0 0 8px; font-size:13px; font-weight:bold; color:#9a3412;">Cancellation Details</p>
                                        <p style="margin:0 0 6px; font-size:14px; color:#7c2d12;"><strong>Cancelled by:</strong> {{cancelled_by}}</p>
                                        <p style="margin:0; font-size:14px; color:#7c2d12;"><strong>Reason:</strong> {{cancellation_reason}}</p>
                                    </td>
                                </tr>
                            </table>
                            <table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                                <tr>
                                    <td align="center" style="background:#2563eb; border-radius:8px;">
                                        <a href="{{dashboard_url}}" style="display:inline-block; padding:12px 22px; color:#ffffff; text-decoration:none; font-size:14px; font-weight:bold;">Go to Patient Portal</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px 32px; background:#f8fafc; text-align:center; border-top:1px solid #edf2f7;">
                            <p style="margin:0 0 8px; font-size:13px; color:#64748b;">© {{current_year}} MedBook Healthcare System</p>
                            <p style="margin:0; font-size:12px; color:#94a3b8;">This is an automated message. Please do not reply directly to this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,

    // 7. APPOINTMENT CANCELLED (Doctor Version)
    cancelled_doctor: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Appointment Cancelled</title>
</head>
<body style="margin:0; padding:0; background:#f5f9fc; font-family:Arial, Helvetica, sans-serif; color:#172b4d;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f9fc; padding:40px 16px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="padding:28px 32px; background:linear-gradient(135deg,#2563eb,#0ea5a4);">
                            <h1 style="margin:0; color:#ffffff; font-size:26px;">MedBook</h1>
                            <p style="margin:6px 0 0; color:#eaf4ff; font-size:14px;">Healthcare appointments made simple</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 32px;">
                            <h2 style="margin:0 0 12px; font-size:22px; color:#172b4d;">Appointment Cancelled</h2>
                            <p style="margin:0 0 20px; color:#526581; font-size:15px; line-height:1.6;">Hi {{doctor_display_name}},</p>
                            <p style="margin:0 0 24px; color:#526581; font-size:15px; line-height:1.6;">
                                The scheduled appointment with patient <strong>{{patient_name}}</strong> has been cancelled.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
                                <tr>
                                    <td style="padding:22px;">
                                        <p style="margin:0 0 8px; font-size:12px; color:#64748b; text-transform:uppercase; font-weight:bold;">PATIENT VISIT</p>
                                        <p style="margin:0 0 18px; font-size:18px; font-weight:bold; color:#172b4d;">{{patient_name}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Date:</strong> {{appointment_date}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Time:</strong> {{appointment_time}}</p>
                                        <p style="margin:0; font-size:14px; color:#526581;"><strong>Status:</strong> <span style="display:inline-block; padding:4px 10px; background:#fee2e2; color:#b91c1c; border-radius:999px; font-size:12px; font-weight:bold;">CANCELLED</span></p>
                                    </td>
                                </tr>
                            </table>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px; background:#fff7ed; border:1px solid #fed7aa; border-radius:12px;">
                                <tr>
                                    <td style="padding:18px 20px;">
                                        <p style="margin:0 0 8px; font-size:13px; font-weight:bold; color:#9a3412;">Cancellation Details</p>
                                        <p style="margin:0 0 6px; font-size:14px; color:#7c2d12;"><strong>Cancelled by:</strong> {{cancelled_by}}</p>
                                        <p style="margin:0; font-size:14px; color:#7c2d12;"><strong>Reason:</strong> {{cancellation_reason}}</p>
                                    </td>
                                </tr>
                            </table>
                            <table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                                <tr>
                                    <td align="center" style="background:#2563eb; border-radius:8px;">
                                        <a href="{{dashboard_url}}" style="display:inline-block; padding:12px 22px; color:#ffffff; text-decoration:none; font-size:14px; font-weight:bold;">View Doctor Dashboard</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px 32px; background:#f8fafc; text-align:center; border-top:1px solid #edf2f7;">
                            <p style="margin:0 0 8px; font-size:13px; color:#64748b;">© {{current_year}} MedBook Healthcare System</p>
                            <p style="margin:0; font-size:12px; color:#94a3b8;">This is an automated message. Please do not reply directly to this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,

    // 8. APPOINTMENT DECLINED (Patient Notification)
    declined: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Appointment Declined</title>
</head>
<body style="margin:0; padding:0; background:#f5f9fc; font-family:Arial, Helvetica, sans-serif; color:#172b4d;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f9fc; padding:40px 16px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="padding:28px 32px; background:linear-gradient(135deg,#2563eb,#0ea5a4);">
                            <h1 style="margin:0; color:#ffffff; font-size:26px;">MedBook</h1>
                            <p style="margin:6px 0 0; color:#eaf4ff; font-size:14px;">Healthcare appointments made simple</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 32px;">
                            <h2 style="margin:0 0 12px; font-size:22px; color:#172b4d;">Appointment Request Declined</h2>
                            <p style="margin:0 0 20px; color:#526581; font-size:15px; line-height:1.6;">Hi {{patient_name}},</p>
                            <p style="margin:0 0 24px; color:#526581; font-size:15px; line-height:1.6;">
                                Unfortunately, <strong>{{doctor_display_name}}</strong> was unable to accept your appointment request at this scheduled time.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
                                <tr>
                                    <td style="padding:22px;">
                                        <p style="margin:0 0 8px; font-size:12px; color:#64748b; text-transform:uppercase; font-weight:bold;">REQUESTED CONSULTATION</p>
                                        <p style="margin:0 0 18px; font-size:18px; font-weight:bold; color:#172b4d;">{{doctor_display_name}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Date:</strong> {{appointment_date}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Time:</strong> {{appointment_time}}</p>
                                        <p style="margin:0; font-size:14px; color:#526581;"><strong>Status:</strong> <span style="display:inline-block; padding:4px 10px; background:#fee2e2; color:#b91c1c; border-radius:999px; font-size:12px; font-weight:bold;">DECLINED</span></p>
                                    </td>
                                </tr>
                            </table>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px; background:#fff7ed; border:1px solid #fed7aa; border-radius:12px;">
                                <tr>
                                    <td style="padding:18px 20px;">
                                        <p style="margin:0 0 8px; font-size:13px; font-weight:bold; color:#9a3412;">Doctor's Note</p>
                                        <p style="margin:0; font-size:14px; color:#7c2d12;">{{decline_reason}}</p>
                                    </td>
                                </tr>
                            </table>
                            <table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                                <tr>
                                    <td align="center" style="background:#2563eb; border-radius:8px;">
                                        <a href="{{browse_doctors_url}}" style="display:inline-block; padding:12px 22px; color:#ffffff; text-decoration:none; font-size:14px; font-weight:bold;">Find Another Doctor</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px 32px; background:#f8fafc; text-align:center; border-top:1px solid #edf2f7;">
                            <p style="margin:0 0 8px; font-size:13px; color:#64748b;">© {{current_year}} MedBook Healthcare System</p>
                            <p style="margin:0; font-size:12px; color:#94a3b8;">This is an automated message. Please do not reply directly to this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,

    // 9. APPOINTMENT RESCHEDULED (Patient Version)
    rescheduled_patient: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Appointment Rescheduled</title>
</head>
<body style="margin:0; padding:0; background:#f5f9fc; font-family:Arial, Helvetica, sans-serif; color:#172b4d;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f9fc; padding:40px 16px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="padding:28px 32px; background:linear-gradient(135deg,#2563eb,#0ea5a4);">
                            <h1 style="margin:0; color:#ffffff; font-size:26px;">MedBook</h1>
                            <p style="margin:6px 0 0; color:#eaf4ff; font-size:14px;">Healthcare appointments made simple</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 32px;">
                            <h2 style="margin:0 0 12px; font-size:22px; color:#172b4d;">Appointment Rescheduled</h2>
                            <p style="margin:0 0 20px; color:#526581; font-size:15px; line-height:1.6;">Hi {{patient_name}},</p>
                            <p style="margin:0 0 24px; color:#526581; font-size:15px; line-height:1.6;">
                                Your appointment with <strong>{{doctor_display_name}}</strong> has been rescheduled by {{rescheduled_by}}. Please check the updated details below.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
                                <tr>
                                    <td style="padding:22px;">
                                        <p style="margin:0 0 8px; font-size:12px; color:#64748b; text-transform:uppercase; font-weight:bold;">UPDATED VISIT DETAILS</p>
                                        <p style="margin:0 0 18px; font-size:18px; font-weight:bold; color:#172b4d;">{{doctor_display_name}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>New Date:</strong> {{new_appointment_date}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>New Time:</strong> {{new_appointment_time}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Location:</strong> {{clinic_address}}</p>
                                        <p style="margin:0; font-size:14px; color:#526581;"><strong>Status:</strong> <span style="display:inline-block; padding:4px 10px; background:#dcfce7; color:#166534; border-radius:999px; font-size:12px; font-weight:bold;">RESCHEDULED</span></p>
                                    </td>
                                </tr>
                            </table>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
                                <tr>
                                    <td style="padding:18px 20px;">
                                        <p style="margin:0 0 8px; font-size:13px; font-weight:bold; color:#64748b;">Previous Schedule</p>
                                        <p style="margin:0 0 6px; font-size:14px; color:#526581;"><strong>Original Date:</strong> {{previous_appointment_date}}</p>
                                        <p style="margin:0; font-size:14px; color:#526581;"><strong>Original Time:</strong> {{previous_appointment_time}}</p>
                                    </td>
                                </tr>
                            </table>
                            <table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                                <tr>
                                    <td align="center" style="background:#2563eb; border-radius:8px;">
                                        <a href="{{dashboard_url}}" style="display:inline-block; padding:12px 22px; color:#ffffff; text-decoration:none; font-size:14px; font-weight:bold;">View in Patient Portal</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px 32px; background:#f8fafc; text-align:center; border-top:1px solid #edf2f7;">
                            <p style="margin:0 0 8px; font-size:13px; color:#64748b;">© {{current_year}} MedBook Healthcare System</p>
                            <p style="margin:0; font-size:12px; color:#94a3b8;">This is an automated message. Please do not reply directly to this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,

    // 10. APPOINTMENT RESCHEDULED (Doctor Version)
    rescheduled_doctor: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Appointment Rescheduled</title>
</head>
<body style="margin:0; padding:0; background:#f5f9fc; font-family:Arial, Helvetica, sans-serif; color:#172b4d;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f9fc; padding:40px 16px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="padding:28px 32px; background:linear-gradient(135deg,#2563eb,#0ea5a4);">
                            <h1 style="margin:0; color:#ffffff; font-size:26px;">MedBook</h1>
                            <p style="margin:6px 0 0; color:#eaf4ff; font-size:14px;">Healthcare appointments made simple</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 32px;">
                            <h2 style="margin:0 0 12px; font-size:22px; color:#172b4d;">Appointment Rescheduled</h2>
                            <p style="margin:0 0 20px; color:#526581; font-size:15px; line-height:1.6;">Hi {{doctor_display_name}},</p>
                            <p style="margin:0 0 24px; color:#526581; font-size:15px; line-height:1.6;">
                                The appointment with patient <strong>{{patient_name}}</strong> has been rescheduled by {{rescheduled_by}}.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
                                <tr>
                                    <td style="padding:22px;">
                                        <p style="margin:0 0 8px; font-size:12px; color:#64748b; text-transform:uppercase; font-weight:bold;">UPDATED CONSULTATION</p>
                                        <p style="margin:0 0 18px; font-size:18px; font-weight:bold; color:#172b4d;">{{patient_name}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>New Date:</strong> {{new_appointment_date}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>New Time:</strong> {{new_appointment_time}}</p>
                                        <p style="margin:0 0 8px; font-size:14px; color:#526581;"><strong>Type:</strong> {{consultation_type}}</p>
                                        <p style="margin:0; font-size:14px; color:#526581;"><strong>Status:</strong> <span style="display:inline-block; padding:4px 10px; background:#dcfce7; color:#166534; border-radius:999px; font-size:12px; font-weight:bold;">RESCHEDULED</span></p>
                                    </td>
                                </tr>
                            </table>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
                                <tr>
                                    <td style="padding:18px 20px;">
                                        <p style="margin:0 0 8px; font-size:13px; font-weight:bold; color:#64748b;">Previous Schedule</p>
                                        <p style="margin:0 0 6px; font-size:14px; color:#526581;"><strong>Original Date:</strong> {{previous_appointment_date}}</p>
                                        <p style="margin:0; font-size:14px; color:#526581;"><strong>Original Time:</strong> {{previous_appointment_time}}</p>
                                    </td>
                                </tr>
                            </table>
                            <table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                                <tr>
                                    <td align="center" style="background:#2563eb; border-radius:8px;">
                                        <a href="{{dashboard_url}}" style="display:inline-block; padding:12px 22px; color:#ffffff; text-decoration:none; font-size:14px; font-weight:bold;">View in Doctor Dashboard</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px 32px; background:#f8fafc; text-align:center; border-top:1px solid #edf2f7;">
                            <p style="margin:0 0 8px; font-size:13px; color:#64748b;">© {{current_year}} MedBook Healthcare System</p>
                            <p style="margin:0; font-size:12px; color:#94a3b8;">This is an automated message. Please do not reply directly to this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,

    // 11. RESET PASSWORD
    reset_password: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
</head>
<body style="margin:0; padding:0; background:#f5f9fc; font-family:Arial, Helvetica, sans-serif; color:#172b4d;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f9fc; padding:40px 16px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="padding:28px 32px; background:linear-gradient(135deg,#2563eb,#0ea5a4);">
                            <h1 style="margin:0; color:#ffffff; font-size:26px;">MedBook</h1>
                            <p style="margin:6px 0 0; color:#eaf4ff; font-size:14px;">Healthcare appointments made simple</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 32px;">
                            <h2 style="margin:0 0 12px; font-size:22px; color:#172b4d;">Reset Your Password</h2>
                            <p style="margin:0 0 20px; color:#526581; font-size:15px; line-height:1.6;">Hi {{recipient_name}},</p>
                            <p style="margin:0 0 24px; color:#526581; font-size:15px; line-height:1.6;">
                                We received a request to reset the password for your MedBook account. Click the button below to create a new password.
                            </p>
                            <table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                                <tr>
                                    <td align="center" style="background:#2563eb; border-radius:8px;">
                                        <a href="{{reset_password_url}}" style="display:inline-block; padding:12px 24px; color:#ffffff; text-decoration:none; font-size:14px; font-weight:bold;">Reset Password</a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:24px 0 0; color:#64748b; font-size:13px; line-height:1.6;">
                                If you did not request a password reset, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px 32px; background:#f8fafc; text-align:center; border-top:1px solid #edf2f7;">
                            <p style="margin:0 0 8px; font-size:13px; color:#64748b;">© {{current_year}} MedBook Healthcare System</p>
                            <p style="margin:0; font-size:12px; color:#94a3b8;">This is an automated message. Please do not reply directly to this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
}

// Aliases for backward compatibility
EMAIL_TEMPLATES.reminder = EMAIL_TEMPLATES.reminder_patient
EMAIL_TEMPLATES.cancelled = EMAIL_TEMPLATES.cancelled_patient
EMAIL_TEMPLATES.rescheduled = EMAIL_TEMPLATES.rescheduled_patient
