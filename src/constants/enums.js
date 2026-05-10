// src/constants/enums.js
// Source: Api_Integration_Fe.md — Enum Reference section

export const APPOINTMENT_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PENDING:         'pending',
  CONFIRMED:       'confirmed',
  IN_PROGRESS:     'in_progress',
  COMPLETED:       'completed',
  DECLINED:        'declined',
  CANCELLED:       'cancelled',
  NO_SHOW:         'no_show',
  RESCHEDULED:     'rescheduled',
  OVERDUE:        'overdue',
}

export const PAYMENT_STATUS = {
  UNPAID:   'unpaid',
  PAID:     'paid',
  FAILED:   'failed',
  REFUNDED: 'refunded',
  EXPIRED:  'expired',
}

export const USER_ROLE = {
  PATIENT: 'patient',
  DOCTOR:  'doctor',
  ADMIN:   'admin',
}

export const GENDER = {
  MALE:   'male',
  FEMALE: 'female',
  OTHER:  'other',
}

export const BLOOD_TYPE = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const DAY_OF_WEEK = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
]

export const NOTIFICATION_EVENT = {
  APPT_CREATED:         'appointment.created',
  APPT_CREATED_PATIENT: 'appointment.created_patient',
  APPT_CONFIRMED:       'appointment.confirmed',
  APPT_DECLINED:       'appointment.declined',
  APPT_CANCELLED:      'appointment.cancelled',
  APPT_COMPLETED:      'appointment.completed',
  APPT_RESCHEDULED:    'appointment.rescheduled',
  APPT_REMINDER:       'appointment.reminder',
  PAYMENT_CREATED:     'payment.created',
  PAYMENT_PAID:        'payment.paid',
  PAYMENT_SUCCESS:     'payment.success',
  PAYMENT_FAILED:      'payment.failed',
}

export const APPT_STATUS_LABEL = {
  pending_payment: 'Pending Payment',
  pending:         'Pending Confirmation',
  confirmed:       'Confirmed',
  in_progress:     'In Progress',
  completed:       'Completed',
  declined:        'Declined',
  cancelled:       'Cancelled',
  no_show:         'No Show',
  overdue:         'Overdue',
}

export const APPT_STATUS_COLOR = {
  pending_payment: { bg: '#fef9c3', text: '#854d0e' },
  pending:         { bg: '#dbeafe', text: '#1e40af' },
  confirmed:       { bg: '#dcfce7', text: '#166534' },
  in_progress:     { bg: '#e0f2fe', text: '#0369a1' },
  completed:       { bg: '#f0fdf4', text: '#15803d' },
  declined:        { bg: '#fee2e2', text: '#991b1b' },
  cancelled:       { bg: '#f1f5f9', text: '#475569' },
  no_show:         { bg: '#fef3c7', text: '#92400e' },
  overdue:         { bg: '#ffe4e6', text: '#be123c' },
}

export const TRIAGE_SESSION_STATUS = {
  ACTIVE:            'active',
  AI_SUGGESTED:      'ai_suggested',
  AUTO_CONFIRMED:    'auto_confirmed',
  PENDING_REVIEW:    'pending_review',
  DOCTOR_CONFIRMED:  'doctor_confirmed',
  REFERRED_INTERNAL: 'referred_internal',
  ABANDONED:         'abandoned',
}

export const LAB_RESULT_STATUS = {
  PENDING:              'PENDING',
  AI_PROCESSING:        'AI_PROCESSING',
  AI_DRAFT:             'AI_DRAFT',
  DOCTOR_REVIEW:        'DOCTOR_REVIEW',
  NEEDS_MANUAL_REVIEW:  'NEEDS_MANUAL_REVIEW',
  PUBLISHED:            'PUBLISHED',
}

export const DIAGNOSIS_STATUS = {
  ACTIVE:   'active',
  RESOLVED: 'resolved',
  CHRONIC:  'chronic',
}

export const MEDICATION_STATUS = {
  ACTIVE:    'active',
  STOPPED:   'stopped',
  COMPLETED: 'completed',
}

export const ORDER_PRIORITY = {
  ROUTINE: 'routine',
  URGENT:  'urgent',
  STAT:    'stat',
}

export const TEST_TYPE = {
  BLOOD_PANEL: 'blood_panel',
  IMAGING:     'imaging',
  ECG:         'ecg',
  URINE:       'urine',
  OTHER:       'other',
}

export const DEPARTMENT = {
  CARDIOLOGY: 'cardiology',
  RESPIRATORY: 'respiratory',
  HEMATOLOGY: 'hematology',
  INTERNAL_MEDICINE: 'internal_medicine',
  ORTHOPEDICS: 'orthopedics',
  RADIOLOGY: 'radiology',
}

export const XRAY_TYPE = {
  ABDOMINAL: 'abdominal',
  SKULL: 'skull',
  SPINE: 'spine',
}

/**
 * Static data: doctor specialties for the dashboard / booking wizard.
 * Centralized here to avoid duplication across components.
 */
export const SPECIALTIES = [
  { label: 'General Medicine', icon: '🩺' },
  { label: 'Cardiology',       icon: '❤️'  },
  { label: 'Neurology',        icon: '🧠'  },
  { label: 'Dermatology',      icon: '✨'  },
  { label: 'General Surgery',  icon: '🏥'  },
  { label: 'Pediatrics',       icon: '👶'  },
  { label: 'Ophthalmology',    icon: '👁️'  },
  { label: 'ENT',              icon: '👂'  },
]
