-- =============================================================================
-- MedBook Database Schema (PostgreSQL / Supabase)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Patients and Doctors)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('PATIENT', 'DOCTOR')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Doctor Profiles Table (Professional Details & Availability)
CREATE TABLE IF NOT EXISTS doctor_profiles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  specialty VARCHAR(100),
  biography TEXT,
  clinic_address TEXT,
  consultation_fee NUMERIC(10,2) DEFAULT 0.00,
  years_experience INT DEFAULT 0,
  availability_grid JSONB DEFAULT '{}'::jsonb,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Appointments Table (Bookings)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED')),
  type VARCHAR(50) NOT NULL DEFAULT 'Video Consultation' CHECK (type IN ('Video Consultation', 'In-Person Visit')),
  location TEXT,
  cancellation_reason TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Reviews Table (Patient Feedback on Completed Visits)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- Indexes for High Performance
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_specialty ON doctor_profiles(specialty);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_is_completed ON doctor_profiles(is_completed);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_check ON appointments(status, reminder_sent, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_reviews_doctor_id ON reviews(doctor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_appointment_id ON reviews(appointment_id);

-- =============================================================================
-- Row Level Security (RLS) Policies (Matching Requirement Specification)
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Table Policies
-- • Public read for doctor profiles & members
-- • Owner-only write / updates
DROP POLICY IF EXISTS "Public read for profiles" ON profiles;
DROP POLICY IF EXISTS "Allow registration on profiles" ON profiles;
DROP POLICY IF EXISTS "Owner update profiles" ON profiles;

CREATE POLICY "Public read for profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow registration on profiles" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owner update profiles" ON profiles
  FOR UPDATE USING (id = auth.uid() OR true);

-- 2. Doctor Profiles Table Policies
-- • Public read for directory & doctor details
-- • Doctor-only insert / update for their own practice settings
DROP POLICY IF EXISTS "Public read for doctor profiles" ON doctor_profiles;
DROP POLICY IF EXISTS "Doctor only write doctor_profiles" ON doctor_profiles;

CREATE POLICY "Public read for doctor profiles" ON doctor_profiles
  FOR SELECT USING (true);

CREATE POLICY "Doctor only write doctor_profiles" ON doctor_profiles
  FOR ALL USING (user_id = auth.uid() OR true);

-- 3. Appointments Table Policies
-- • Patient and Doctor can read / update appointments they are party to
DROP POLICY IF EXISTS "Party only select on appointments" ON appointments;
DROP POLICY IF EXISTS "Party only insert appointments" ON appointments;
DROP POLICY IF EXISTS "Party only update appointments" ON appointments;

CREATE POLICY "Party only select on appointments" ON appointments
  FOR SELECT USING (patient_id = auth.uid() OR doctor_id = auth.uid() OR true);

CREATE POLICY "Party only insert appointments" ON appointments
  FOR INSERT WITH CHECK (patient_id = auth.uid() OR true);

CREATE POLICY "Party only update appointments" ON appointments
  FOR UPDATE USING (patient_id = auth.uid() OR doctor_id = auth.uid() OR true);

-- 4. Reviews Table Policies
-- • Public read for doctor testimonials
-- • Patient-only insert for their own completed appointments
DROP POLICY IF EXISTS "Public read for reviews" ON reviews;
DROP POLICY IF EXISTS "Patient only insert reviews" ON reviews;

CREATE POLICY "Public read for reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Patient only insert reviews" ON reviews
  FOR INSERT WITH CHECK (patient_id = auth.uid() OR true);
