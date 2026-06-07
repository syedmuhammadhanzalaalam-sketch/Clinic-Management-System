-- ============================================================
-- Clinic Management System - Neon PostgreSQL Setup
-- Run this in Neon SQL Editor: https://console.neon.tech
-- ============================================================

-- Enums
CREATE TYPE "UserRole" AS ENUM ('admin', 'doctor', 'patient');
CREATE TYPE "AllergySeverity" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "AppointmentStatus" AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'card', 'bank_transfer', 'online');
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'refunded', 'cancelled');
CREATE TYPE "RiskLevel" AS ENUM ('low', 'medium', 'high');

-- Users
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(40),
  role          "UserRole" NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Doctors
CREATE TABLE doctors (
  id               SERIAL PRIMARY KEY,
  user_id          INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  license_number   VARCHAR(80) NOT NULL,
  qualification    VARCHAR(160) NOT NULL,
  bio              TEXT,
  consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  experience_years INT NOT NULL DEFAULT 0
);

-- Specialties
CREATE TABLE specialties (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL UNIQUE,
  description TEXT
);

-- Doctor Specialties (join table)
CREATE TABLE doctor_specialties (
  doctor_id    INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  specialty_id INT NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  PRIMARY KEY (doctor_id, specialty_id)
);

-- Doctor Availability
CREATE TABLE doctor_availability (
  id                    SERIAL PRIMARY KEY,
  doctor_id             INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week           INT NOT NULL,
  start_time            VARCHAR(8) NOT NULL,
  end_time              VARCHAR(8) NOT NULL,
  slot_duration_minutes INT NOT NULL DEFAULT 30,
  is_active             BOOLEAN NOT NULL DEFAULT true
);

-- Patients
CREATE TABLE patients (
  id                      SERIAL PRIMARY KEY,
  user_id                 INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth           VARCHAR(20) NOT NULL,
  gender                  VARCHAR(30) NOT NULL,
  blood_group             VARCHAR(10),
  address                 TEXT,
  emergency_contact_name  VARCHAR(120),
  emergency_contact_phone VARCHAR(40)
);

-- Patient Medical History
CREATE TABLE patient_medical_history (
  id             SERIAL PRIMARY KEY,
  patient_id     INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  condition_name VARCHAR(160) NOT NULL,
  description    TEXT,
  diagnosed_at   VARCHAR(20),
  is_chronic     BOOLEAN NOT NULL DEFAULT false
);

-- Patient Allergies
CREATE TABLE patient_allergies (
  id           SERIAL PRIMARY KEY,
  patient_id   INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  allergy_name VARCHAR(160) NOT NULL,
  severity     "AllergySeverity" NOT NULL DEFAULT 'low',
  notes        TEXT
);

-- Appointments
CREATE TABLE appointments (
  id               SERIAL PRIMARY KEY,
  patient_id       INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id        INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date VARCHAR(20) NOT NULL,
  start_time       VARCHAR(8) NOT NULL,
  end_time         VARCHAR(8) NOT NULL,
  status           "AppointmentStatus" NOT NULL DEFAULT 'pending',
  reason_for_visit TEXT,
  created_by       INT,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (doctor_id, appointment_date, start_time)
);

-- Visits
CREATE TABLE visits (
  id                SERIAL PRIMARY KEY,
  appointment_id    INT NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id        INT NOT NULL REFERENCES patients(id),
  doctor_id         INT NOT NULL REFERENCES doctors(id),
  symptoms          TEXT,
  vitals            JSONB,
  examination_notes TEXT,
  diagnosis         TEXT,
  treatment_plan    TEXT,
  follow_up_date    VARCHAR(20)
);

-- Lab Reports
CREATE TABLE lab_reports (
  id          SERIAL PRIMARY KEY,
  patient_id  INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_id    INT REFERENCES visits(id),
  uploaded_by INT,
  report_name VARCHAR(160) NOT NULL,
  file_url    TEXT NOT NULL,
  report_type VARCHAR(100),
  notes       TEXT,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id             SERIAL PRIMARY KEY,
  appointment_id INT NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id     INT NOT NULL REFERENCES patients(id),
  doctor_id      INT NOT NULL REFERENCES doctors(id),
  amount         DECIMAL(10,2) NOT NULL,
  payment_method "PaymentMethod" NOT NULL DEFAULT 'cash',
  payment_status "PaymentStatus" NOT NULL DEFAULT 'pending',
  paid_at        TIMESTAMP
);

-- AI Assessments
CREATE TABLE ai_assessments (
  id                 SERIAL PRIMARY KEY,
  visit_id           INT NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  patient_id         INT NOT NULL REFERENCES patients(id),
  doctor_id          INT NOT NULL REFERENCES doctors(id),
  risk_level         "RiskLevel" NOT NULL,
  possible_diagnoses JSONB,
  recommended_tests  JSONB,
  precautions        JSONB,
  natural_remedies   JSONB,
  warnings           JSONB,
  ai_model           VARCHAR(100),
  prompt_version     VARCHAR(40),
  created_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Seed default specialties
-- ============================================================
INSERT INTO specialties (name, description) VALUES
  ('General Medicine', 'Primary care and general health'),
  ('Cardiology', 'Heart and cardiovascular system'),
  ('Dermatology', 'Skin, hair and nail conditions'),
  ('Pediatrics', 'Medical care for children'),
  ('Orthopedics', 'Bones, joints and muscles'),
  ('Gynecology', 'Female reproductive health'),
  ('Neurology', 'Brain and nervous system'),
  ('ENT', 'Ear, nose and throat'),
  ('Ophthalmology', 'Eye care'),
  ('Psychiatry', 'Mental health');

-- ============================================================
-- Done! Now run: node seed.js to create admin/doctor/patient
-- ============================================================
