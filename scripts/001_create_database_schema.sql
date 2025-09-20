-- Hospital PWA Database Schema
-- This script creates all the necessary tables for the hospital patient management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user management (references auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'nurse', 'admin')),
  hospital_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hospitals table
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table (extends profiles for patient-specific data)
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id TEXT UNIQUE NOT NULL, -- Hospital-assigned patient ID
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_type TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  allergies TEXT[],
  medical_conditions TEXT[],
  insurance_info JSONB,
  nfc_id TEXT UNIQUE, -- For NFC card identification
  qr_code TEXT UNIQUE, -- For QR code identification
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medical_records table
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id),
  visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  diagnosis TEXT,
  symptoms TEXT,
  treatment TEXT,
  notes TEXT,
  attachments JSONB, -- Store file URLs and metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id),
  medical_record_id UUID REFERENCES public.medical_records(id),
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT,
  instructions TEXT,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medicine_reminders table
CREATE TABLE IF NOT EXISTS public.medicine_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  prescription_id UUID REFERENCES public.prescriptions(id),
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  reminder_times TIME[], -- Array of times for daily reminders
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medicine_logs table (for tracking taken medicines)
CREATE TABLE IF NOT EXISTS public.medicine_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  reminder_id UUID REFERENCES public.medicine_reminders(id),
  medication_name TEXT NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  taken_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'taken', 'missed', 'skipped')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rewards table for gamification
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  badges JSONB DEFAULT '[]', -- Array of earned badges
  streak_days INTEGER DEFAULT 0,
  total_medicines_taken INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id),
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for patients
CREATE POLICY "Patients can view their own data" ON public.patients
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Patients can update their own data" ON public.patients
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Patients can insert their own data" ON public.patients
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for medical_records
CREATE POLICY "Patients can view their own medical records" ON public.medical_records
  FOR SELECT USING (
    patient_id IN (SELECT id FROM public.patients WHERE id = auth.uid())
  );

CREATE POLICY "Doctors can view their patients' medical records" ON public.medical_records
  FOR SELECT USING (
    doctor_id = auth.uid() OR 
    patient_id IN (SELECT id FROM public.patients WHERE id = auth.uid())
  );

CREATE POLICY "Doctors can insert medical records" ON public.medical_records
  FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update their medical records" ON public.medical_records
  FOR UPDATE USING (doctor_id = auth.uid());

-- RLS Policies for prescriptions
CREATE POLICY "Patients can view their own prescriptions" ON public.prescriptions
  FOR SELECT USING (
    patient_id IN (SELECT id FROM public.patients WHERE id = auth.uid())
  );

CREATE POLICY "Doctors can manage prescriptions" ON public.prescriptions
  FOR ALL USING (
    doctor_id = auth.uid() OR 
    patient_id IN (SELECT id FROM public.patients WHERE id = auth.uid())
  );

-- RLS Policies for medicine_reminders
CREATE POLICY "Patients can manage their own reminders" ON public.medicine_reminders
  FOR ALL USING (
    patient_id IN (SELECT id FROM public.patients WHERE id = auth.uid())
  );

-- RLS Policies for medicine_logs
CREATE POLICY "Patients can manage their own medicine logs" ON public.medicine_logs
  FOR ALL USING (
    patient_id IN (SELECT id FROM public.patients WHERE id = auth.uid())
  );

-- RLS Policies for rewards
CREATE POLICY "Patients can view their own rewards" ON public.rewards
  FOR SELECT USING (
    patient_id IN (SELECT id FROM public.patients WHERE id = auth.uid())
  );

CREATE POLICY "System can update rewards" ON public.rewards
  FOR ALL USING (
    patient_id IN (SELECT id FROM public.patients WHERE id = auth.uid())
  );

-- RLS Policies for appointments
CREATE POLICY "Patients can view their own appointments" ON public.appointments
  FOR SELECT USING (
    patient_id IN (SELECT id FROM public.patients WHERE id = auth.uid())
  );

CREATE POLICY "Doctors can view their appointments" ON public.appointments
  FOR SELECT USING (
    doctor_id = auth.uid() OR 
    patient_id IN (SELECT id FROM public.patients WHERE id = auth.uid())
  );

CREATE POLICY "Patients can insert their own appointments" ON public.appointments
  FOR INSERT WITH CHECK (
    patient_id IN (SELECT id FROM public.patients WHERE id = auth.uid())
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON public.patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_nfc_id ON public.patients(nfc_id);
CREATE INDEX IF NOT EXISTS idx_patients_qr_code ON public.patients(qr_code);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_medicine_reminders_patient_id ON public.medicine_reminders(patient_id);
CREATE INDEX IF NOT EXISTS idx_medicine_logs_patient_id ON public.medicine_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
