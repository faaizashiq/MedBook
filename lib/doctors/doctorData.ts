export interface DoctorDetail {
  id: string
  name: string
  title: string
  specialty: string
  experience: number
  rating: number
  reviewCount: number
  price: number
  location: string
  clinicName: string
  clinicAddress: string
  about: string
  education: string[]
  specializations: string[]
  languages: string[]
  available: boolean
  nextSlot: string
  verified: boolean
  avatar?: string
  phone: string
  email: string
}

export const DOCTORS_DATA: Record<string, DoctorDetail> = {
  '1': {
    id: '1',
    name: 'Dr. Sarah Johnson',
    title: 'MD, FACC • Senior Cardiologist',
    specialty: 'Cardiologist',
    experience: 8,
    rating: 4.8,
    reviewCount: 120,
    price: 150,
    location: 'New York, NY',
    clinicName: 'MedBook Cardiology & Heart Center',
    clinicAddress: '450 Lexington Ave, Suite 1200, New York, NY 10017',
    about:
      'Dr. Sarah Johnson is a board-certified cardiologist with over 8 years of clinical experience specializing in non-invasive cardiology, preventive heart health, hypertension management, and cardiovascular risk assessment. She is passionate about patient education and utilizing modern telemedicine to provide timely cardiac care.',
    education: [
      'MD — Harvard Medical School (2015)',
      'Residency in Internal Medicine — Johns Hopkins Hospital',
      'Cardiology Fellowship — Columbia University Irving Medical Center',
      'Board Certified in Cardiovascular Disease & Echocardiography',
    ],
    specializations: [
      'Preventive Cardiology',
      'Echocardiography & ECG Interpretation',
      'Hypertension & Lipid Disorders',
      'Heart Rhythm Management',
      'Post-COVID Cardiovascular Assessment',
    ],
    languages: ['English', 'Spanish'],
    available: true,
    nextSlot: 'Today, 9:30 AM',
    verified: true,
    phone: '+1 (212) 555-0143',
    email: 'dr.johnson@medbook.app',
  },
  '2': {
    id: '2',
    name: 'Dr. Michael Chen',
    title: 'MD, PhD • Neurologist & Neurophysiology Specialist',
    specialty: 'Neurologist',
    experience: 10,
    rating: 4.7,
    reviewCount: 98,
    price: 120,
    location: 'Los Angeles, CA',
    clinicName: 'West Coast Neuroscience Institute',
    clinicAddress: '8631 W 3rd St, Suite 800E, Los Angeles, CA 90048',
    about:
      'Dr. Michael Chen specializes in neurological disorders, chronic migraines, peripheral neuropathy, and cognitive assessments. With 10 years of patient care experience, Dr. Chen emphasizes holistic treatment plans combined with cutting-edge diagnostics.',
    education: [
      'MD & PhD in Neuroscience — Stanford University (2014)',
      'Neurology Residency — UCSF Medical Center',
      'Fellowship in Clinical Neurophysiology — UCLA Health',
    ],
    specializations: [
      'Migraine & Chronic Headache Disorders',
      'Epilepsy & Seizure Management',
      'Neuropathy & Nerve Conduction Studies',
      'Memory & Cognitive Health',
    ],
    languages: ['English', 'Mandarin'],
    available: true,
    nextSlot: 'Today, 11:00 AM',
    verified: true,
    phone: '+1 (310) 555-0199',
    email: 'dr.chen@medbook.app',
  },
  '3': {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    title: 'MD, FAAD • Dermatologist & Cosmetic Specialist',
    specialty: 'Dermatologist',
    experience: 6,
    rating: 4.9,
    reviewCount: 76,
    price: 100,
    location: 'Chicago, IL',
    clinicName: 'Midwest Skin & Aesthetic Clinic',
    clinicAddress: '676 N Michigan Ave, Suite 3400, Chicago, IL 60611',
    about:
      'Dr. Emily Rodriguez provides comprehensive medical and cosmetic dermatology care. She specializes in acne management, eczema, psoriasis, skin cancer screenings, and advanced anti-aging treatments.',
    education: [
      'MD — Northwestern University Feinberg School of Medicine',
      'Dermatology Residency — University of Chicago Medicine',
      'Member, American Academy of Dermatology (FAAD)',
    ],
    specializations: [
      'Medical Dermatology & Acne Care',
      'Skin Cancer Screening & Mole Mapping',
      'Psoriasis & Eczema Therapy',
      'Laser Skin Treatments',
    ],
    languages: ['English', 'Spanish'],
    available: true,
    nextSlot: 'Tomorrow, 10:00 AM',
    verified: true,
    phone: '+1 (312) 555-0182',
    email: 'dr.rodriguez@medbook.app',
  },
  '4': {
    id: '4',
    name: 'Dr. James Wilson',
    title: 'MD • Family Physician',
    specialty: 'General Practitioner',
    experience: 12,
    rating: 4.8,
    reviewCount: 110,
    price: 130,
    location: 'Houston, TX',
    clinicName: 'Houston Family Health Center',
    clinicAddress: '6560 Fannin St, Suite 1400, Houston, TX 77030',
    about:
      'Dr. James Wilson has over 12 years of experience providing compassionate primary healthcare for families and adults. He focuses on preventive medicine, routine wellness exams, and chronic disease management.',
    education: [
      'MD — Baylor College of Medicine',
      'Family Medicine Residency — Memorial Hermann Hospital',
    ],
    specializations: [
      'Primary Care & Wellness Exams',
      'Diabetes & Hypertension Management',
      'Preventive Vaccinations',
    ],
    languages: ['English'],
    available: false,
    nextSlot: 'Aug 26, 09:00 AM',
    verified: true,
    phone: '+1 (713) 555-0167',
    email: 'dr.wilson@medbook.app',
  },
  '5': {
    id: '5',
    name: 'Dr. Aisha Patel',
    title: 'MD, FAAP • Pediatrician',
    specialty: 'Pediatrician',
    experience: 9,
    rating: 4.6,
    reviewCount: 89,
    price: 90,
    location: 'Phoenix, AZ',
    clinicName: 'Desert Pediatric Care Center',
    clinicAddress: '19829 N 27th Ave, Phoenix, AZ 85027',
    about:
      'Dr. Aisha Patel is a dedicated pediatrician dedicated to the growth, developmental milestones, and well-being of infants, children, and adolescents.',
    education: [
      'MD — University of Arizona College of Medicine',
      'Pediatric Residency — Phoenix Children’s Hospital',
    ],
    specializations: [
      'Newborn & Infant Care',
      'Childhood Development & Nutrition',
      'Pediatric Asthma & Allergies',
    ],
    languages: ['English', 'Hindi', 'Gujarati'],
    available: true,
    nextSlot: 'Today, 3:00 PM',
    verified: true,
    phone: '+1 (602) 555-0154',
    email: 'dr.patel@medbook.app',
  },
  '6': {
    id: '6',
    name: 'Dr. Robert Kim',
    title: 'MD, FAAOS • Orthopedic Surgeon',
    specialty: 'Orthopedic Surgeon',
    experience: 15,
    rating: 4.9,
    reviewCount: 203,
    price: 200,
    location: 'Philadelphia, PA',
    clinicName: 'Penn Orthopedic & Sports Medicine',
    clinicAddress: '3737 Market St, Suite 600, Philadelphia, PA 19104',
    about:
      'Dr. Robert Kim is a renowned orthopedic specialist with 15 years of experience in sports injuries, joint preservation, knee and shoulder arthroscopy, and fracture recovery.',
    education: [
      'MD — University of Pennsylvania Perelman School of Medicine',
      'Orthopedic Surgery Residency — Hospital of the University of Pennsylvania',
      'Sports Medicine Fellowship — Andrews Institute',
    ],
    specializations: [
      'Sports Medicine & Arthroscopy',
      'Knee, Shoulder & Joint Care',
      'Ligament Reconstruction (ACL/MCL)',
      'Cartilage Repair & Rehabilitation',
    ],
    languages: ['English', 'Korean'],
    available: true,
    nextSlot: 'Today, 4:30 PM',
    verified: true,
    phone: '+1 (215) 555-0128',
    email: 'dr.kim@medbook.app',
  },
}

export function getDoctorById(id: string): DoctorDetail {
  if (DOCTORS_DATA[id]) {
    return DOCTORS_DATA[id]
  }
  // Fallback default
  return {
    id,
    name: `Dr. Specialist ${id}`,
    title: 'MD • Healthcare Specialist',
    specialty: 'General Specialist',
    experience: 8,
    rating: 4.8,
    reviewCount: 50,
    price: 120,
    location: 'New York, NY',
    clinicName: 'MedBook Healthcare Plaza',
    clinicAddress: '500 5th Avenue, New York, NY 10110',
    about:
      'Experienced healthcare professional dedicated to delivering comprehensive, patient-centered clinical and tele-health care.',
    education: [
      'MD — Top Medical University',
      'Board Certified Specialist',
    ],
    specializations: [
      'General Diagnosis & Preventive Care',
      'Consultation & Follow-up',
    ],
    languages: ['English'],
    available: true,
    nextSlot: 'Tomorrow, 10:00 AM',
    verified: true,
    phone: '+1 (800) 555-0199',
    email: `doctor.${id}@medbook.app`,
  }
}
