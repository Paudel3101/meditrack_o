-- ============================================================
-- MediTrack Database Schema — PostgreSQL
-- Drops and recreates all types and tables cleanly.
-- ============================================================

-- Drop dependent types first (CASCADE removes tables that use them)
DROP TYPE IF EXISTS role_enum   CASCADE;
DROP TYPE IF EXISTS gender_enum CASCADE;
DROP TYPE IF EXISTS status_enum CASCADE;

-- Enum: staff roles
CREATE TYPE role_enum AS ENUM ('Admin', 'Doctor', 'Nurse', 'Receptionist');

-- Enum: patient gender
CREATE TYPE gender_enum AS ENUM ('Male', 'Female', 'Other');

-- Enum: appointment status (lowercase to match frontend values)
CREATE TYPE status_enum AS ENUM ('scheduled', 'completed', 'cancelled', 'no-show');

CREATE TABLE IF NOT EXISTS staff (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  phone           VARCHAR(20),
  role            role_enum NOT NULL,
  specialization  VARCHAR(100),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
  id                        SERIAL PRIMARY KEY,
  medical_record_number     VARCHAR(50) UNIQUE NOT NULL,
  first_name                VARCHAR(100) NOT NULL,
  last_name                 VARCHAR(100) NOT NULL,
  date_of_birth             DATE NOT NULL,
  gender                    gender_enum NOT NULL,
  phone                     VARCHAR(20),
  email                     VARCHAR(255),
  address                   VARCHAR(255),
  city                      VARCHAR(100),
  state                     VARCHAR(100),
  zip_code                  VARCHAR(20),
  allergies                 TEXT,
  -- blood_group used by frontend (alias for blood_type)
  blood_group               VARCHAR(10),
  emergency_contact_name    VARCHAR(100),
  emergency_contact_phone   VARCHAR(20),
  medical_notes             TEXT,
  is_archived               BOOLEAN DEFAULT FALSE,
  created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Medical Records ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medical_records (
  id              SERIAL PRIMARY KEY,
  patient_id      INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_date      DATE NOT NULL,
  chief_complaint TEXT,
  diagnosis       TEXT,
  treatment       VARCHAR(500),
  notes           TEXT,
  doctor_id       INT REFERENCES staff(id),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Appointments ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id                  SERIAL PRIMARY KEY,
  patient_id          INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id           INT REFERENCES staff(id),
  appointment_date    DATE NOT NULL,
  appointment_time    TIME NOT NULL,
  duration_minutes    INT DEFAULT 30,
  reason              TEXT,
  status              status_enum DEFAULT 'scheduled',
  notes               TEXT,
  cancellation_reason TEXT,
  created_by          INT REFERENCES staff(id),
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id          SERIAL PRIMARY KEY,
  staff_id    INT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  token       VARCHAR(500),
  login_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logout_time TIMESTAMP NULL,
  ip_address  VARCHAR(50),
  user_agent  VARCHAR(500),
  is_active   BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_staff_email         ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_role          ON staff(role);
CREATE INDEX IF NOT EXISTS idx_staff_is_active     ON staff(is_active);

CREATE INDEX IF NOT EXISTS idx_patients_mrn        ON patients(medical_record_number);
CREATE INDEX IF NOT EXISTS idx_patients_email      ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_archived   ON patients(is_archived);
CREATE INDEX IF NOT EXISTS idx_patients_name       ON patients(first_name, last_name);

CREATE INDEX IF NOT EXISTS idx_appts_patient       ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appts_doctor        ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appts_date          ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appts_status        ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_sessions_staff      ON sessions(staff_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active     ON sessions(is_active);
